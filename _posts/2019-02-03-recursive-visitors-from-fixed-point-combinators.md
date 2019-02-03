---
layout: post
title:  "Recursive visitors from fixed-point combinators"
date:   2019-02-03 16:34:57+01:00
tags:
  - c++
  - functional
math-enabled: true
excerpt: "In this follow-up post, we demonstrate how concept from lambda calculus can benefit real code by using the Y combinator to define recursive lambda functions. This is particularly useful in the visitor pattern introduced in the previous post."
disclaimer: "This post picks up where the previous one left off. [Go back](/2018/10/21/type-safety-variants-and-visitors) for an introduction to the visitor pattern for `std::variant`."
---

<!-- Intro -->

#### Variadically inheriting from lambdas

In the previous post, we left off with a simple visitor functor `Printer` which
provides two overloads for `operator()` which are called by `std::visit`
depending on the type realized in the variant.

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

This is easy enough, but there's an even simpler way of achieving the same that
was recently featured by Jason Turner on [C++ Weekly Ep. 134][1]: we define a
generic functor `visitor` which variadically inherits from a bunch of lambdas:

{% highlight cpp %}
template <typename... Bases>
struct visitor : Bases... {
    using Bases::operator()...;
};

template <typename... Bases>
visitor(Bases...) -> visitor<Bases...>;
{% endhighlight %}

The struct merely contains a variadic [using declaration][7] (C++17) which
introduces all the call operators of the base classes into the derived class
definition. Lastly, we declare a template parameter deduction guide. This allows
us to construct a `visitor` through [aggregate initialization][8] and have the
template parameters inferred. This is non-optional if we want to inherit from
inline lambdas whose type cannot be expressed in closed form. If you want to
know more about the subtleties of this, I highly recommend watching
Jason's [video][1].

Thus, we can use `visitor` to quickly define a one-time-use visitor:

{% highlight cpp %}
using Data = std::variant<int, std::string>;

int main() {
    Data d[2] = {42, "Hello, world!"};
    for (Data & x : d)
        std::visit(visitor {
                [] (int i) {
                    std::cout << "got an int: " << i << '\n';
                },
                [] (std::string const& s) {
                    std::cout << "got a string: " << s << '\n';
                }
            }, x);
}
{% endhighlight %}

The advantages of this approach are basically those of using lambdas in place of
regular functions in general: we increase readability by keeping the logic in the
place of its (one-time) use. Another upside is the ability to capture variables
from the local scope.

The `visitor` template obviously needs to be defined only once. Its definition
is simple enough to stuff it into some utility header. In case you a using (a
fairly recent version of) Boost anyway, the new meta-programming library Boost
Hana offers a definition called [`boost::hana::overload`][5] straight out of the
box.

#### Recursive visitors

One problem arises when we want to call the visitor recursively. Consider the
following example of a variant that's supposed to represent a value in a JSON
file which can be either a number, a string, or an array or
'object' (a.k.a. dictionary or map) of JSON values themselves. JSON also allows
null and Boolean values, which are omitted here for brevity.

{% highlight cpp %}
namespace json {
    struct array;  // forward declaration
    struct object; // forward declaration

    using value = std::variant<int, std::string, array, object>;

    struct array : std::vector<value> {
        using std::vector<value>::vector;
    };

    struct object : std::map<std::string, value> {
        using std::map<std::string, value>::map;
    };
}
{% endhighlight %}

With this, we can list-initialize a nested `value` object rather elegantly:

{% highlight cpp %}
int main() {
    json::value val = json::object{
        {"title", "Can Quantum-Mechanical Description of Physical"
                  " Reality Be Considered Complete?"},
        {"year", 1935},
        {"authors", json::array{
                "A. Einstein",
                "B. Podolsky",
                "N. Rosen"
            }}
    };
    std::cout << val << std::endl; // to be implemented
}
{% endhighlight %}

In order to serialize a `json::value` object into valid JSON, we again resort to
the visitor pattern. As a fully-fledged functor class, the visitor might look
like this:

{% highlight cpp %}
namespace json {
    struct printer {
        std::ostream & os;

        std::ostream& operator()(int x) const {
            return os << x;
        }
        std::ostream& operator()(std::string const& s) const {
            return os << std::quoted(s);
        }
        std::ostream& operator()(array const& a) const {
            os << '[';
            for (auto const& v : a)
                std::visit(*this, v) << ',';
            return os << ']';
        }
        std::ostream& operator()(object const& obj) const {
            os << '{';
            for (auto const& [k, v] : obj) {
                os << std::quoted(k) << ':';
                std::visit(*this, v) << ',';
            }
            return os << '}';
        }
    };

    std::ostream& operator<<(std::ostream& os, value const& val) {
        return std::visit(printer{os}, val);
    }
}
{% endhighlight %}

For the above `main()` function, this will produce the output:

{% highlight plain %}
{"authors":["A. Einstein","B. Podolsky","N. Rosen",],"title":"Can Quantum-Mechanical Description of Physical Reality Be Considered Complete","year":1935,}
{% endhighlight %}

which is valid JSON when disregarding the occurrence of trailing commas (which
are technically not allowed).

Note the use of recursion in the overloads for `array` and `object`: the visitor
passes itself on to `std::visit` which in turn calls its appropriate overloads
for the array elements and values contained in the `object`. When attempting to
realize the same kind of visitor by inheriting from lambdas, we however run into
a problem:

{% highlight cpp %}
namespace json {
    std::ostream& operator<<(std::ostream& os, value const& val) {
        return std::visit(visitor{
                [&](int x) -> std::ostream& { return os << x; },
                [&](std::string const& s) -> std::ostream& {
                    return os << std::quoted(s);
                },
                [&](array const& a) -> std::ostream& {
                    os << '[';
                    for (auto const& v : a) {
                        // std::visit(*this, v) << ',';
                    }
                    return os << ']';
                },
                [&](object const& obj) -> std::ostream& {
                    os << '{';
                    for (auto const& [k, v] : obj) {
                        os << std::quoted(k) << ':';
                        // std::visit(*this, v) << ',';
                    }
                    return os << '}';
                }
            }, val);
    }
}
{% endhighlight %}

While the overloads for `int` and `std::string` are straight-forwardly
implemented (streaming to `os` which is captured by reference), we have no means
of invoking the visitor recursively. Passing `*this` to `std::visit` (as
illustrated in the comments) is bound to fail: the lambdas are defined outside
of any class so there is no `this` to be captured. Further, before the lambdas
are fully defined, the derived visitor type is incomplete and could not even be
forward-declared because its `Bases...` parameter pack cannot be specified in
closed form.

This makes a naive implementation through inheritance from lambdas impossible.
Fortunately, the situation can be salvaged using a concept from theoretical
computer science that has major implication for recursion in general: the fixed
point combinator.

#### Lambda calculus

Before we introduce the fixed-point combinator, let's get acquainted with the
weird notation known as [lambda calculus][2]. The function of one variable that
squares its argument would traditionally be written as $$f(x)=x^2$$, or more
mathematically, $$f: \mathbb{R}\to\mathbb{R}, x\mapsto x^2$$. In lambda
calculus, this becomes $$f = \lambda x\,.\,x^2$$. Note that the expression on
the right-hand side of the equality sign completely defines the function and it
is not even necessary to give it a name ($$f$$). For this reason, lambdas are
often referred to as _anonymous functions_. Further, the name of the argument is
just a placeholder, i.e. $$\lambda x\,.\,x^2=\lambda y\,.\,y^2$$.

When a lambda is invoked, i.e. evaluated for a specific value of its argument,
the parentheses may be omitted if this does not cause confusion, e.g.
$$(\lambda x\,.\,x^2)\,5=5^2=25$$.

A function of two variables, say $$f(x,y)=y^x$$, can be written as
$$\lambda (x,y)\,.\,y^x$$, but in many cases it is more convenient to express
the same as a _higher-order function_:

$$f = \lambda x\,.\,\lambda y\,.\,y^x$$

This is to be understood as a function of one variable ($$x$$), returning
functions of another variable ($$y$$). This procedure of going from one function
of two variables to a _higher-order function_ (one returning functions) of one
variable, is known as [_Currying_][9].

#### The fixed-point combinator

Say, we wanted to define the factorial function
$$n! = n\times(n-1)\times\dots\times 2\times 1$$ recursively. In traditional
function notation, we'd write

$$
f(n) = \begin{cases}
n\times f(n-1), & n > 0,\\
1, & n = 0.
\end{cases}
$$

However, this definition is self-referential: we are using the function $$f$$ in
its own definition. We run into deep water when trying to write down the
corresponding lambda expression: lambdas are anonymous, so we don't have a name
to refer to the thing we are trying to define. Straightforward recursion is not
possible in lambda calculus.

What we _can_ do, however, is define a helper function $$g$$ of two arguments: a
function $$f$$ that we think of as our sought-after factorial function and the
integer $$n$$:

$$
g(f, n) = \begin{cases}
n\,f(n-1), & n > 0,\\
1, & n = 0.
\end{cases}
$$

There is no recursion happening here, so this may be written as a lambda
expression:

$$
g = \lambda f\,.\,\lambda n\,.\,\begin{cases}
n\,f(n-1), & n > 0,\\
1, & n = 0.
\end{cases}
$$

This alone does not constitute a solution, since in order to define the
factorial function itself, we still need to invoke some sort of recursion:

$$
f(n) = g(f, n).
$$

If we omit the argument $$n$$ for a moment (through currying), this reduces to
$$f = g(f)$$ and is called the _fixed-point equation_. Solutions for $$f$$ that
satisfy this equation are called fixed points since $$g$$ maps those to
themselves. Thus, the factorial function $$f$$ is a fixed point of the helper
function $$g$$.

How does one find _a_ fixed point of a function? Turns out that within the
limits of lambda calculus, one can construct a lambda function that maps
functions to (one of) their fixed-point(s). Such a function is called a _fixed-
point combinator_. One particular construction is the so-called _Y combinator_
which was discovered by Haskell Curry (who already has a programming language
and the Currying procedure named after him). The lambda expression for the Y
combinator looks like this:

$$\mathsf{Y} = \lambda f \,.\, (\lambda x \,.\, f(x\ x))(\lambda x \,.\, f(x\ x)).$$

This may look intimidating at first, but honestly it's quite simple. To verify
that it in fact works as advertized, we first apply it to some function $$g$$,

$$\mathsf{Y}g = (\lambda x \,.\, g(x\ x))(\lambda x \,.\, g(x\ x)),$$

where we just replaced the "independent variable" with the concrete function
$$g$$ we're acting upon. We follow the same pattern in evaluating the right-
hand-side: the first pair of parentheses defines a lambda function of $$x$$
which is then _evaluated_ at the point given by the second pair of parentheses,
$$\lambda x\,.\, g(x\ x)$$,

$$\mathsf{Y}g = g((\lambda x \,.\, g(x\ x))(\lambda x \,.\, g(x\ x))) = g(\mathsf{Y}g).$$

In the last equality, we have just recovered the expression for $$\mathsf{Y}g$$
from the previous line. Hence, $$\mathsf{Y}g$$ is indeed a fixed point of $$g$$.

This immediately yields the solution to our problem of defining the factorial
function $$f$$ in lambda calculus: it is simply given by $$f = \mathsf{Y}g$$.
The fixed _point_ in this case is not a number, but a function (of $$n$$), but
that is not a problem. (In fact, numbers _are_ functions in lambda calculus.)

Thus, the Y combinator allows the introduction of recursion to lambda calculus
without changing its axioms or explicitly introducing some sense of self-
referentiality into the formalism. In fact, lambda calculus has been proven to
be Turing complete, _i.e._ any program can be expressed as a lambda expression.
To learn more, I recommend the videos on [lambda calculus][2] in general and the
[Y combinator][3] in particular on the Computerphile Youtube channel.

#### Using the fixed-point combinator in C++

When we tried to define the recursive visitor to serialize JSON, we faced a
similar problem to the one that lambda calculus faced conceptually when it comes
to recursion. This raises the question of whether we can also solve it by
similar means; the answer to which is of course _'yes'_.

We can write a C++ version of the fixed-point combinator:

{% highlight cpp %}
#include <utility>

template <typename G>
struct Y {
    template <typename... X>
    decltype(auto) operator()(X &&... x) const &
    {
        return g(*this, std::forward<X>(x)...);
    }
    G g;
};

template <typename G>
Y(G) -> Y<G>;
{% endhighlight %}

Albeit I called it affectionally `Y` for brevity, it does not follow the same
construction as the Y combinator, but rather it is actually implemented in a
self-referential way, invoking `g` with itself as first argument and then
forwarding any other arguments in the parameter pack `X`.

For example, to realize the factorial function without any recursion or
captures, we can write:

{% highlight cpp %}
auto g = [](auto f, int n) -> int {
	if (n > 0) {
		return n * f(n - 1);
	} else {
		return 1;
	}
};

auto f = Y{g};

std::cout << f(5) << std::endl; // outputs 120
{% endhighlight %}

Note that we used `auto` as the argument type in the definition of $$g$$, making
this a generic lambda. Thus, the return type cannot be inferred and needs to be
specified with trailing return type syntax.

The above code compiles with `g++` 7 or newer, as well as `clang++` 5 or newer.
Clang actually evaluates the expression `f(5)` at compile time with optimization
level `-O3`. GCC does not, but can be forced to do so by declaring the variables
`g` and `f`, as well as the `Y::operator()` function `constexpr`.

Boost provides a similar implementation for the fixed-point combinator in the
new Hana library called [`boost::hana::fix`][6].

#### Recursive serialization of JSON

Finally, let's bring it all together and implement the serialization of JSON
using a variant visitor derived from lambdas, and by reintroducing recursion
using the fixed-point combinator.

{% highlight cpp %}
namespace json {
    std::ostream& operator<<(std::ostream& os, value const& val) {
        return std::visit(Y{visitor{
                [&](auto, int x) -> std::ostream& {
	                return os << x;
	            },
                [&](auto, std::string const& s) -> std::ostream& {
                    return os << std::quoted(s);
                },
                [&](auto self, array const& a) -> std::ostream& {
                    os << '[';
                    for (auto const& v : a) {
                        std::visit(self, v) << ',';
                    }
                    return os << ']';
                },
                [&](auto self, object const& obj) -> std::ostream&
                {
                    os << '{';
                    for (auto const& [k, v] : obj) {
                        os << std::quoted(k) << ':';
                        std::visit(self, v) << ',';
                    }
                    return os << '}';
                }
            }}, val);
    }
}
{% endhighlight %}

Note the changes compared to the version at the beginning of this post: the
individual lambda overloads have an additional first argument `auto self` and
the whole `visitor` is wrapped in a `Y` combinator.

While the contents of this post are certainly a lot to take in, especially so if
lambda calculus is new to you, the resulting solutions are quite simple to use
and I've found myself using them loads since. It's a case where concepts from
theoretical computer science can be applied in real code.

[1]: https://www.youtube.com/watch?v=EsUmnLgz8QY
[2]: https://www.youtube.com/watch?v=eis11j_iGMs
[3]: https://www.youtube.com/watch?v=9T8A89jgeTI
[4]: https://en.wikipedia.org/wiki/Fixed-point_combinator
[5]: https://www.boost.org/doc/libs/1_61_0/libs/hana/doc/html/group__group-functional.html#ga83e71bae315e299f9f5f9de77b012139
[6]: https://www.boost.org/doc/libs/1_61_0/libs/hana/doc/html/group__group-functional.html#ga1393f40da2e8da6e0c12fce953e56a6c
[7]: https://en.cppreference.com/w/cpp/language/using_declaration
[8]: https://en.cppreference.com/w/cpp/language/aggregate_initialization
[9]: https://en.wikipedia.org/wiki/Currying
