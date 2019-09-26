---
layout: post
title:  "Type safety, variants, and visitors"
date:   2018-10-21 21:47:08+02:00
tags:
  - c++
math-enabled: false
excerpt: "Don't use unions anymore. Variants offer type safety and better compiler diagnostics with less boilerplate. std::visit makes it easy to apply the visitor pattern without setting up intricate class hierarchies, while achieving data/algorithm separation."
disclaimer: "This post covers the basics of variants and the visitor pattern in detail. It is meant as preparation for a [follow-up post](/2019/02/03/recursive-visitors-from-fixed-point-combinators) on some more creative uses of visitors."
---

#### Variants vs. unions

C++17 came with library support for type-safe unions in the form of
[`std::variant`][2]. A variant will hold exactly one instance of its template
parameter types. For example, objects of type

{% highlight cpp %}
using foo = std::variant<int, std::string>;
{% endhighlight %}

can hold either an `int`, or a `std::string`. In plain old C, one would use a
_union type_ in this situation:

{% highlight cpp %}
union bar {
    int i;
    std::string s;
};
{% endhighlight %}

A variable of type `bar` could hence be accessed as an `int` by using the `i`
member and as a `std::string` by using `s`, implicitly performing an
`reinterpret_cast` of the data. [`reinterpret_cast`s are frowned upon][5], and
rightly so, as they open the door to undefined behavior, and this extends to
unions. It is up to the programmer to keep track of the realization that is
used. For member types with non-trivial constructors or destructors (such as
`std::string`), one has to carefully provide those explicitly to not risk memory
leaks or segfaults. In practice, one will almost always create a _tagged union_,
i.e. associate the union with a tag (index) to indicate the realized
alternative.

The `std::variant` is in essence such a tagged union. This is also apparent from
the sizeof the types: on a 64-bit machine `sizeof(bar)` is 32 bytes which is
identical to `sizeof(std::string)`, the `int` alternative being significantly
smaller at 4 bytes. In contrast, `sizeof(foo)` yields 40 bytes, where the
additional 8 bytes are reserved for the index (or tag) which is itself a
`std::size_t`. Thus, the variant knows which alternative it holds, lets us test
against it, and provides safe constructors and destructors. It is still possible
to attempt to access the wrong alternative, but this will be caught at run-time
and an exception will be thrown.

{% highlight cpp %}
foo f = "Hello, world";   // realizes the std::string alternative
int i = std::get<int>(f); // throws std::bad_variant_access
{% endhighlight %}

Thus, `i` will not be assigned with the first four bytes of the `std::string`
object; no undefined behavior can arise. This renders `std::variant` a type-safe
replacement of unions.

When the realized alternative is not apparent from the context, one will often
end up with code that tests for each of the realizations and conditionally
executes a code branch:

{% highlight cpp %}
if (std::holds_alternative<int>(f)) {
    std::cout << "got an int: " << std::get<int>(f) << std::endl;
} else {
    std::cout << "got a string: " << std::get<std::string>(f)
              << std::endl;
}
{% endhighlight %}

This can get hairy when a lot of alternatives exist. If additional alternatives
are added to the variant, the above code would execute the `else` branch for any
new non-`int` type. This is not a big deal since `std::get` would throw if used
improperly; still, it would be preferable if the compiler had a way of checking
for an exhaustive treatment of all possible alternatives. Visitors can achieve
just that.

#### The visitor pattern

The main goal of the [visitor pattern][1] is to achieve a separation between code
that defines a data structure and that which operates on the data. This makes
it well-suited to variants, since one would typically not derive directly from
the variant, but work with the generic variant type, but still be able to
perform arbitrary operations one the data contained in the variant.

The visitor pattern however predates `std::variant` or even `boost::variant`. It
originates from object-oriented programming where dynamic dispatch is used to
select the proper overload. Consider the following program:

{% highlight cpp %}
#include <iostream>
#include <string>

struct Int;    // forward declaration
struct String; // forward declaration

// Abstract Visitor interface
struct Visitor {
    virtual void operator()(Int & d) = 0;
    virtual void operator()(String & d) = 0;
};

struct Data {
    virtual void visit(Visitor && v) = 0;
};

struct Int : Data {
    int i;
    Int(int i) : i(i) {}
    void visit(Visitor && v) override {
        v(*this);
    }
};

struct String : Data {
    std::string s;
    String(std::string const& s) : s(s) {}
    void visit(Visitor && v) override {
        v(*this);
    }
};

struct Printer : Visitor {
    void operator()(Int & d) override {
        std::cout << "got an int: " << d.i << std::endl;
    }
    void operator()(String & d) override {
        std::cout << "got a string: " << d.s << std::endl;
    }
};

int main() {
    Int i {42};
    String s {"Hello, world!"};
    Data *d[2] = {&i, &s};
    d[0]->visit(Printer{}); // 'got an int: 42'
    d[1]->visit(Printer{}); // 'got a string: Hello, world!'
}
{% endhighlight %}

`Data` is the common abstract base class of two data "structures", `Int` and
`String`. These must implement a `visit` member function, invoking the call
operator on a `Visitor` functor that is passed along. The bodies of `Int::visit`
and `String::visit` may look alike but in fact these invoke different overloads
of `operator()` since `*this` has a different type (`Int&` vs. `String&`). The
concrete visitor class `Printer` in turn derives from the interface `Visitor`.

Crucially, the data classes `Int` and `String` don't need any knowledge of
`Printer`. The user may implement arbitrary visitors by deriving from `Visitor`
and handling each of the alternatives in a separate overload of the call
operator. No explicit type checks and no downcasts are required which makes this
pattern quite elegant. On the downside, the whole thing relies on run-time
polymorphism and dynamic dispatch and the associated [vtable][4] lookups incur
a significant performance cost (which may be partly negated if devirtualization
optimization can be used). The derived classes will typically also need to be
allocated dynamically, adding an additional level of indirection and breaking
memory locality compared to variants.

#### Visitation of `std::variant`

Rather than relying on dynamic polymorphism, `std::variant` uses the visitor
pattern to achieve the same thing with static polymorphism (i.e. generic
programming). [`std::visit`][3] is called on an arbitrary variant and a
visitor functor which similarly provides overloads of the call operator (but is
not derived from any interface). Internally, `std::visit` will use
`holds_alternative` successively and call the visitor with a reference to its
contents. This ensures that the visitor handles all alternatives of the variant,
giving a hard compiler error should any overload be missing. The call of the
visitor is dispatched statically, meaning no vtable lookups are necessary, the
function bodies can be inlined and branch prediction and vectorization can be used.

The equivalent to the above example program, realized with variants, becomes
much simpler:

{% highlight cpp %}
#include <iostream>
#include <string>
#include <variant>

using Data = std::variant<int, std::string>;

struct Printer {
    void operator()(int i) const {
        std::cout << "got an int: " << i << std::endl;
    }
    void operator()(std::string const& s) const {
        std::cout << "got a string: " << s << std::endl;
    }
};

int main() {
    Data d[2] = {42, "Hello, world!"};
    std::visit(Printer{}, d[0]); // 'got an int: 42'
    std::visit(Printer{}, d[1]); // 'got a string: Hello, world!'
}
{% endhighlight %}

**TL;DR** Don't use unions anymore. Variants offer type safety and better
compiler diagnostics with less boilerplate. `std::visit` makes it easy to apply
the visitor pattern without setting up intricate class hierarchies, while
achieving data/algorithm separation.


[1]: https://en.wikipedia.org/wiki/Visitor_pattern#C++_example
[2]: https://en.cppreference.com/w/cpp/utility/variant
[3]: https://en.cppreference.com/w/cpp/utility/variant/visit
[4]: https://en.wikipedia.org/wiki/Virtual_method_table
[5]: https://youtu.be/L06nbZXD2D0
