---
layout: post
title:  "Variadic expansion in aggregate initialization"
date:   2018-09-15 13:07:14+02:00
tags:   c++
math-enabled: false
# description: ""
---

Variadic templates ([parameter packs][1]) have been in the language ever since
C++11. With the introduction of [fold expressions][2] in C++17, they have gotten
even more useful. This post showcases their utility for initializing aggregate
types such as `std::array` without prior default initialization of their fields.

#### The problem

Suppose you have a class `foo` which is not default-constructible, or whose
default constructor incurs significant and unnecessary overhead (heap allocation,
thread synchronization, etc.). For the sake of this post, `foo` will just wrap
an integer and its custom constructor will define the implicitly declared
default constructor [as deleted][3].

{% highlight cpp %}
struct foo {
    foo(int i) : data(i) {}
    friend inline std::ostream& operator<<(std::ostream& os,
                                           foo const& f)
    { return os << "foo(" << f.data << ")"; }
private:
    int data;
};
{% endhighlight %}

Now, given the task to fill a fixed-size array with instances of `foo` wrapping
the integers 0, 1, ..., 9, one might write code like this:

{% highlight cpp %}
std::array<foo, 10> arr;
for (int i = 0; i < arr.size(); ++i)
    arr[i] = foo(i);
{% endhighlight %}

As an aside, we could simply write `arr[i] = i`; the integer would implicitly be
converted to an object of type `foo`.

This, however, will fail to compile, with the compiler complaining about the use
of the deleted default constructor `foo::foo()`. Another (inequivalent!)
possibility would be to write

{% highlight cpp %}
std::array<foo, 10> arr {};
{% endhighlight %}

which performs [_list initialization_][4], and since arrays are aggregate types,
this invokes [_aggregate initialization_][5]. The latter will copy-initialize
the first elements of the array from the expressions within the braces (in this
case, none) and [_value-initialize_][6] the remaining elements. Thus, also this
code fails to compile, but this time we get 10 errors due to the compiler
complaining about the absence of a default constructor (which is required for
value initialization) for each of the 10 array elements.

#### Quick and dirty solution: just give it a default constructor already!

For at least until C++11 came about, the answer to this conundrum was to just
add a default constructor. In our example, we can explicitly define the
constructor as defaulted:

{% highlight cpp %}
    // inside struct foo
    foo() = default;              // variant 1
{% endhighlight %}

**If** (!) the defaulted default constructor was invoked, its action would be
identical to a default constructor with empty initializer list and empty body:

{% highlight cpp %}
    // inside struct foo
    foo() {};                     // variant 2
{% endhighlight %}

This means that all class members (and base classes) are themselves
default-initialized, but POD members such as our sole member `int i;` will
remain uninitialized.

That **'If'** is important though: whilst default initialization will _always_
invoke the default constructor, value initialization will only invoke the
default constructor if it is _user-defined_ as in variant 2. Otherwise (variant
1), value initialization will zero-initialize all members. As a corollary,
default-initializing the array will always default-initialize its members,
resulting in ten `foo` objects with undefined values of their member `i`,
regardless of whether variant 1 or 2 was used to define the default constructor.
In contrast, aggregate initialization of the array will only produce the same
result if variant 2 is used, but will produce ten `foo(0)` objects in the case
of variant 1.

#### Why introducing a default state might be a bad idea

So, while it is possible to ensure that no memory is zeroed before
move-assigning the ascending `foo` objects, the performance penalty for doing so
would likely be negligible. The bigger issue with introducing default
constructors runs deeper. By doing so, we introduce another state for objects of
type `foo` and in order to avoid expensive resource acquisition, that default
state might be special and every function called on `foo` would henceforth need
to check for this artificial edge case. In other words, by adding meaningless
default states for mere technical reasons, we erode the internal guarantees
imposed by the type system.

Even worse, if `foo` is a view of sorts, it likely has reference members and
references cannot be default-initialized or reassigned. The obvious way out of
that situation is to replace the reference by a pointer to the parent of the
view. Whenever you feel like that's the way to fix a problem, it might be time
to step back and reevaluate. C++ ain't Rust and references are far from safe
(since the compiler does not enforce lifetime) but replacing them by pointers
for the single reason to introduce a state where those pointers are dangling is
surely a bad idea.

#### Avoiding default construction with vectors

This probably isn't a huge revelation, but the above problem is easily solved
for `std::vector`s where one can simply construct the elements one by one and
push them to the back of the vector:

{% highlight cpp %}
std::vector<foo> vec;
vec.reserve(10);
for (int i = 0; i < 10; ++i)
    vec.push_back(i);
{% endhighlight %}

By reserving the anticipated amount of memory, we can be sure that dynamic
memory allocation happens only once. Again, we are making use
of [implicit conversion][7] to construct the objects of type `foo` before
calling `push_back`, thus being equivalent to `vec.push_back(foo{i})`. This is
an important thing to recall: the objects are constructed in the local scope and
passed on to `push_back` as an _rvalue_ reference which can be moved out of. Our
class `foo` has implicitly declared [move semantics][8] (which will copy the POD
member `i` nonetheless). If `foo` was immovable in addition to being not
default-constructible, we could still avoid copying by using [`emplace_back`][9]
instead:

{% highlight cpp %}
for (int i = 0; i < 10; ++i)
    vec.emplace_back(i);
{% endhighlight %}

This time, `i` is not implicitly converted to `foo`, but instead it (and any
further arguments to `emplace_back`) are forwarded to a constructor of `foo`
which constructs the object at its spot in the vector.

Should one be so inclined to program in a _'loopless'_ style, we could also fill
the vector by invoking [`std::generate_n`][10] with a stateful lambda and have it
feed the elements in a [`std::back_insert_iterator`][11]:

{% highlight cpp %}
std::vector<foo> vec;
vec.reserve(10);
std::generate_n(std::back_inserter(vec), 10,
                [i=0]() mutable -> foo { return i++; });
{% endhighlight %}

While these solutions for `std::vector` are fine and dandy, they still require
(one) dynamic memory allocation on the heap. This is perfectly fine for large
amounts of data, but can cause significant overhead when the arrays are small,
_e.g._ in the case of (ironically) vectors in few dimensions as they occur in
physics. When the dimension is small and known at compile time, but generic so
we can't simply write `{0, 1, 2}`, it's much better to use arrays living on the
stack. Which brings us back to square one: how to initialize such an array
without requiring default-constructibility?

#### Variadic expansion to the rescue

C++11 introduced [_variadic templates_][1] to the language, that is, templates
with a variable number of template parameters, be it types, enums, or integral
values. The name derives from [variadic functions][12] in C (and C++) such as
`printf` which take a variable number of arguments. Unlike variadic function
which iterate over their arguments at runtime (and perform type erasure and are
generally unsafe), variadic templates collect template parameters in _parameter
packs_ which are expanded at compile time.

The parameter pack can be expanded using the `...` operator in various places.
The most common one is inside the argument list of a function invocation. The
function that's being called is often itself a variadic template and in a lot of
cases it's the same function, but with fewer template parameters. This way, the
variadic template function can be defined recursively by eventually reaching a
base case which has to be defined as a separate (non-variadic) overload.

Here, we'll focus on another expansion locus which eliminates the need for
explicit recursion: brace-enclosed initializers which
trigger [list initialization][4] or [aggregate initialization][5]. Consider the
following helper function:

{% highlight cpp %}
template <typename Container, int... I>
Container iota_impl() {
    return {I...};
} 
{% endhighlight %}

This defines a template with a parameter pack `I` of `int` values. It
list-initializes a new instance of the templated type `Container` and returns it
immediately. The pack expansion `I...` takes place in the list initializer. When
invoking the template function as

{% highlight cpp %}
auto arr = iota_impl<std::array<int, 4>, 0, 1, 2, 3>();
{% endhighlight %}

this indeed initializes `arr` with an array equal to `{0, 1, 2, 3}`. So this
works, but surely we've only shifted the problem from having to specify the
integer sequence inside the braced initializer to specifying it as template
parameters? Well, yes, but template parameters (and parameter packs) can be
deduced from the signature of the template function.

This is where [`std::integer_sequence`][12] comes into play, a nifty auxiliary type
that was introduced in C++14. It actually doesn't do anything, it's just a
template over some integral type `T` and a parameter pack `T...` of those. By
adding an argument to our helper function `iota_impl` of type
`std::integer_sequence<int, I...>`, and calling it with an instance of
`integer_sequence`, we do no longer need to put the numbers `0, 1, 2, 3` in the
template parameter list of `iota_impl`, but rather `I...` is deduced from the
type of the function argument:

{% highlight cpp %}
template <typename Container, int... I>
Container iota_impl(std::integer_sequence<int, I...>) {
    return {I...};
} 

auto arr = iota_impl<std::array<int, 4>>(
        std::integer_sequence<int, 0, 1, 2, 3>{}
    );
{% endhighlight %}

Note that the `std::integer_sequence` object is never actually used. We don't
even give a name to the argument of `iota_impl`. The type just sits there _pro
forma_ to facilitate template deduction at compile time and therefore doesn't
incur any runtime costs.

Again, you might ask, 'didn't we just shift the problem from putting
`0, 1, 2, 3` in the template arguments of `iota_impl` to putting it in the template
arguments of the dummy object we're passing into it?'. True, but we're inching
closer to a solution. The final piece of the puzzle is an innocent-looking type
alias provided by the standard library:

{% highlight cpp %}
template <typename T, T N>
using make_integer_sequence =
    std::integer_sequence<T, /* a sequence 0, 1, 2, ..., N-1 */ >;
{% endhighlight %}

Despite its `make_*` name suggesting that it might create an `integer_sequence`
object, `std::make_integer_sequence` is actually a type. Obviously, the above
pseudo-definition is not valid C++, but it is not that hard to come up with a
recursive definition that does the job. Again, all the instantiations of
templates happen at compile time, so the use of recursion does not hurt the
runtime performance.

Using `std::make_integer_sequence`, we can finally eliminate the explicit
sequence `0, 1, 2, 3, ...` from the code:

{% highlight cpp %}
template <typename Container, int... I>
Container iota_impl(std::integer_sequence<int, I...>) {
    return {I...};
} 

template <typename T, size_t N>
auto iota_array() {
    using Sequence = std::make_integer_sequence<int, N>;
    return iota_impl<std::array<T, N>>(Sequence{});
}

auto arr = iota_array<foo, 10>();
std::copy(arr.begin(), arr.end(),
          std::ostream_iterator<foo>{std::cout, ", "});
/* output: foo(0), foo(1), foo(2), foo(3), foo(4), ... */
{% endhighlight %}

The split between the (exposed) API function `iota_array` and the helper
`iota_impl` is necessary to 'extract' the integer parameter pack from the
`std::integer_sequence` type and the use of the latter is necessary to implicitly
make use of recursion in `std::make_integer_sequence` to build up the sequence.

The definition of the helper function has to go in the header as the template
will need to be instantiated anew for every `N`. It's common to indicate that it is
not meant to be used directly by the `_impl` suffix, or by placing it in an
`impl::` or `detail::` namespace. If the exposed function is a class member, the
helper can also be made private.

#### Extensions

The pattern presented here can also be used in more intricate ways. For example,
we could use the integers from the sequence as indices in an array access. In
this case, we'd want to use `size_t` rather than `int`. This is such a common
application that the standard library provides the type alias
`std::index_sequence<N>` for `std::integer_sequence<size_t, N>`. The following
function `subarray<S>` returns a length-`S` subarray by aggregate initialization
with copies of the elements of the original array:

{% highlight cpp %}
template <typename T, size_t N, size_t... I>
auto subarray_impl(std::array<T, N> const& arr,
                   size_t first,
                   std::index_sequence<I...>)
    -> std::array<T, sizeof...(I)>
{
    return {arr[first + I]...};
}

template <size_t S, typename T, size_t N>
auto subarray(std::array<T, N> const& arr, size_t first) {
    using Indices = std::make_index_sequence<S>;
    return subarray_impl(arr, first, Indices{});
}
{% endhighlight %}

Possible use would look like this:
{% highlight cpp %}
auto arr = iota_array<foo, 10>();
/* foo(0), foo(1), foo(2), foo(3), foo(4), foo(5), foo(6), ... */
auto sub = subarray<4>(arr, 2);
/* foo(2), foo(3), foo(4), foo(5) */
{% endhighlight %}

Note the use of the `sizeof...` operator to find the number of elements in the
parameter pack at compile time. Inside the braced initializer, we can put
(almost) any expression we like and use the pack parameter `I` as though it was
a single element of the pack and apply the pack expansion operator `...` to the
whole _expression_.

If the elements of the initialized array were the result of a more complicated
calculation, one might be tempted to use an _immediately invoked lambda
expression_ (IILE) to turn multiple _statements_ into a single _expression_ and
expand that:

{% highlight cpp %}
return {
    [&](size_t i) {
        /* some multi-statement computation,
         * as a function of `i`, possibly using
         * captured variables */
    }(I)...
};
{% endhighlight %}

The thing to note here is that a separate lambda will be compiled for every
integer in the sequence. Still, the compiler would most likely be able to inline
those. What's worse is that the above **doesn't seem to work** with current
compilers (GCC and clang). For some reason, only the first lambda in the
expansion correctly captures its environment. I'm fairly sure this is a compiler
bug; also confer the relevant [StackExchange thread][13]. For now it's probably
best to move the lambda outside the initializer, give it a name, and invoke it
by name:

{% highlight cpp %}
auto f = [&](size_t i) {
    /* some multi-statement computation,
     * as a function of `i`, possibly using
     * captured variables */
};
return {f(I)...};
{% endhighlight %}

Finally, I'd like to showcase one last place where this pattern might come in
handy and that's with C++17's [fold expressions][2]. If we wanted to implement
a stream out operator for `std::array`, we could do so in the following way:

{% highlight cpp %}
template <typename Container, size_t... I>
std::ostream& print_impl(std::ostream& os, Container const& arr,
                         std::index_sequence<I...>)
{
    return (os << ... << arr[I]);
}

template <typename T, size_t N>
std::ostream& operator<<(std::ostream& os, std::array<T, N> const& arr) {
    using Indices = std::make_index_sequence<N>;
    return print_impl(os, arr, Indices{});
}
{% endhighlight %}

The binary fold expression `(os << ... << arr[I])` will be expanded into `os <<
arr[0] << arr[1] << arr[2] << ...`. Thus, we get the following output:

{% highlight cpp %}
std::cout << sub << std::endl;
/* foo(2)foo(3)foo(4)foo(5) */
{% endhighlight %}

If instead be wanted to separate the individual elements by a comma, the binary
fold cannot be used and we need to ressort to a trick where we're performing a
unary fold with respect to the comma operator: `((os << arr[I] << ", "), ...)`
which would expand to

{% highlight cpp %}
(os << arr[0] << ", "),
(os << arr[1] << ", "),
(os << arr[2] << ", "),
...
{% endhighlight %}

Thus the output reads:

{% highlight cpp %}
std::cout << sub << std::endl;
/* foo(2), foo(3), foo(4), foo(5),  */
{% endhighlight %}

Drop me a line if you know of an elegant idea to get rid of that trailing comma.

The application of this pattern to printing is probably not a particularly good
use case since you could achieve the same thing by just looping over the array
or using an algorithm:

{% highlight cpp %}
std::copy(sub.begin(), sub.end(),
          std::ostream_iterator<foo>{std::cout, ", "});
{% endhighlight %}

For `std::array`, the compiler will likely unroll the loop anyway, producing the
same assembly, so there isn't a performance benefit in using fold expressions
for that either. For the aggregate initialization of non-default-constructible
objects though, the pattern I presented in this post is the only way I know of to
accomplish the task at hand.

You can download and fork the code presented in this post from this 
[Gist][14]{: .github}.

[1]: https://en.cppreference.com/w/cpp/language/parameter_pack
[2]: https://en.cppreference.com/w/cpp/language/fold
[3]: https://en.cppreference.com/w/cpp/language/default_constructor
[4]: https://en.cppreference.com/w/cpp/language/list_initialization
[5]: https://en.cppreference.com/w/cpp/language/aggregate_initialization
[6]: https://en.cppreference.com/w/cpp/language/value_initialization
[7]: https://en.cppreference.com/w/cpp/language/implicit_conversion
[8]: https://en.cppreference.com/w/cpp/language/move_constructor
[9]: https://en.cppreference.com/w/cpp/container/vector/emplace_back
[10]: https://en.cppreference.com/w/cpp/algorithm/generate_n
[11]: https://en.cppreference.com/w/cpp/iterator/back_insert_iterator
[12]: https://en.cppreference.com/w/cpp/utility/integer_sequence
[13]: https://stackoverflow.com/questions/39128413
[14]: https://gist.github.com/jgreitemann/79f3d8c83a839a3a7f55abb135637a6d
