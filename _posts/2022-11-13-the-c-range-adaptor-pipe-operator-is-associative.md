---
layout: post
title:  "The C++ range adaptor pipe operator is associative"
date:   2022-11-13 14:37:28+0100
tags:
  - c++
  - algorithms
  - functional
math-enabled: false
---

Tina Ulbrich ([@\_Yulivee\_][tina-twitter]) recently gave her talk ["How to Rangify Your Code"][cpponsea-talk] at my
local meetup, in which she gave a rundown of several examples from her codebase where loop-heavy code was replaced by
pipelines of range adaptors. I sunk my teeth into one of those from an API design perspective and show how it can be
generalized to work with generic ranges, based on the associative property of the pipe operator used to compose ranges
and range adaptors.

### Tina's `sliding_mean` example

First off, Tina used the [range-v3][range-v3] library for most of her code samples as it supports more range adaptors
and consumers than the meager subset that was standardized for C++20. However, C++23 will improve the situation
significantly and MSVC (or rather the Microsoft STL) already has good enough support that I will use C++23 standard
ranges in this post.

Now, one of the first examples Tina showed was the calculation of a sliding mean. The code that she started out with
iterated over a `span` of values with a raw loop and created arrays of five elements in each iteration which was than
passed into a `mean` function. The resulting means for each of the sliding windows were than pushed into a vector. She
then showed how you'd go about doing the same with ranges:

```cpp
constexpr auto mean(std::span<double const> s) -> double {
  return std::reduce(s.begin(), s.end(), 0.) / s.size();
}

auto sliding_mean(std::span<double const> s)
    -> std::vector<double>
{
  return s | std::views::slide(5)
           | std::views::transform(mean)
           | std::ranges::to<std::vector>();
}
```
[Godbolt](https://godbolt.org/z/GTqM6s4Ee)

The ranges-based implementation has several advantages over the loop-based one: The size of the window is easily
changed; in fact, it could just be turned into a second parameter to the `sliding_mean` function. Additionally, the
original code would have needed to do bounds checking in case the input range is smaller than the window size; the
ranges code does that automatically and produces an empty vector in that case.

### Generalizing the function to return ranges

Tina already mentioned in her talk that the `std::ranges::to<std::vector>()` is not even necessary, but she included
this to keep the function signature the same compared to the original implementation. If you relax this
requirement, `sliding_mean` turns into a lazy algorithm and its result can be further adapted, e.g., by rounding the
window means to the nearest integer:

```cpp
constexpr auto sliding_mean(std::span<double const> s)
    -> std::ranges::random_access_range auto
{
  return s | std::views::slide(5)
           | std::views::transform(mean);
}

auto round_to_int(double d) -> int {
  return static_cast<int>(std::lround(d));
}

int main() {
  std::array const a = {3., 4., 5., 4., 3., 2., 4., 5., 9., 7.,
                        8., 6., 5., 4., 3., 2., 0., 1., 2., 1.};
  fmt::print("{}\n", sliding_mean(a)
                     | std::views::transform(round_to_int));
}
```
[Godbolt](https://godbolt.org/z/jzcTdKc3P)

I'm using the {fmt} library here which has the ability to format ranges directly. To be clear, this would've worked with
the previous version as well but it would've meant that first the means are calculated and aggregated into a vector and
then, second, that vector would've been iterated, its elements rounded and the result would've been printed. Instead,
this version doesn't need to allocate any memory for the intermediate vector and instead calculates the means, rounds
them, and prints the resulting integers in a single pass.

You may also notice the funny-looking trailing return type. The _actual_ return type is some unwieldy thing like
`slide_view<transform_view<span<double const>, ...>>`. It is of course perfectly fine to
omit the return type altogether and have `auto` deduce it, but just like that's often not the best idea for "normal"
functions with respect to readability, it is beneficial to constrain the return type with an appropriate range concept
to give the consumer of the API just the information they actually need to use it. I haven't seen constrained return
types being used in the wild yet, but I hope they catch on as people get more comfortable with concepts as a tool for
understanding and documenting requirements rather than just as language support for `std::enable_if`. In this case, we
input a `std::span` which is a _contiguous_ range, but `transform` can only retain the _random access_ property.

It should be noted that doing things lazily is not always more efficient and can easily lead to work being done twice.
One should be conscious of _where_ the actual work happens (inside of `fmt::print` where the range is consumed) and that
saving the range itself as a local variable and using it multiple times only saves you from rebuilding the "expression
template" but does not cache the result of the calculation. If the latter is desired, the caller needs to follow up the
range with a `to<std::vector>()` at the call site to eagerly consume it and then share the result. From an API design
perspective, this leaves the decision between lazy and eager computation with the caller; that's fine so long as they
are aware of the responsibility bestowed upon them which can be problematic when introducing this kind of thing to
legacy codebases where team members expect eager algorithms.

### Generalizing function arguments to accept ranges

Tina's `sliding_mean` is already great in that it accepts a `std::span`. That means that it can be called using
a `std::vector` or a `std::array`, a C-style array, or in general any range that is both _sized_ and _contiguous_. That
is however still a pretty hefty requirement and rules out almost all the non-trivial range adaptors, as well as range
factories like `std::views::iota`. And it's an unnecessary requirement at that, given `std::views::slide` merely
requires a _forward_ range. To relax it, we need to turn `sliding_mean` into a template (here using C++20's `auto`
template parameters):

```cpp
constexpr auto sliding_mean(std::ranges::forward_range auto rng)
    -> std::ranges::forward_range auto
{
  return rng | std::views::slide(5)
             | std::views::transform(mean);
}
```

Constraining the template with the appropriate concept is of course optional, but it helps with readability and fails
earlier. There's a catch here, however: `mean` so far also operated on `span`s which worked because `slide` yields views
which are sized and themselves model the same range concept as the input range; i.e., when operating on a _contiguous_
range (like `span`), `slide` yields itself _sized_ and _contiguous_ ranges which are then implicitly convertible
to `span`s. Now that we relaxed the contiguity of the argument of `sliding_mean`, we need to do the same for the
argument of `mean`. Merely turning `mean` into a function template doesn't work either, as it cannot be passed as a
function reference to `std::views::transform` without specifying its template arguments which is difficult to do
portably. What does work is turning `mean` into a function object with a generic call operator, e.g. by defining it as a
lambda:

```cpp
inline constexpr auto mean =
    [](std::ranges::input_range auto s) -> double {
      auto c = s | std::views::common;
      return std::reduce(c.begin(), c.end(), 0.) / s.size();
    };
```

Another detail here is that the `<numeric>` algorithms are not yet rangified, so we use C++17's iterator version
of `std::reduce`. That however requires both begin and end iterators to have the same type which is not true for some
range views, e.g., `std::views::filter`. To fix this, the input range is first adapted into a _common_ range.

With this, we are finally able to use our `sliding_mean` with an input view which is itself a range pipeline,
where `fmt::print` still consumes the range completely lazily but that now also includes the generation of the input
numbers themselves.

```cpp
fmt::print("{}\n", sliding_mean(std::views::iota(0, 30)
                                | std::views::filter(is_even))
                   | std::views::transform(round_to_int));
```
[Godbolt](https://godbolt.org/z/38r9rGjn7)

### Composite range adaptors

While the above version is now functionally exactly where we want it to be, it looks pretty awkward. It would be much
nicer if `sliding_mean` would support range pipelining:

```cpp
fmt::print("{}\n", a | sliding_mean
                     | std::views::transform(round_to_int));

fmt::print("{}\n", std::views::iota(0, 30)
                   | std::views::filter(is_even)
                   | sliding_mean
                   | std::views::transform(round_to_int));
```

Besides the fact that there's something deeply satisfying about lining up the pipe operators, this also communicates
more clearly that `sliding_mean` is merely adapting a range and is itself lazy. How might we implement support
for `operator|`? This is actually quite hard to do in general with the range facilities as they stand in C++20 without
adding to the `std` namespace, which is in fact undefined behavior. Fortunately, the situation is about to improve in
C++23 thanks to [Barry Revzin's P2387][p2387] which introduces the CRTP base class `std::ranges::range_adaptor_closure`.
The `sliding_mean` function can then be replaced by the call operator of a function object `sliding_mean_fn` which
derives from `range_adaptor_closure`:

```cpp
struct sliding_mean_fn
  : std::ranges::range_adaptor_closure<sliding_mean_fn>
{
  constexpr auto operator()(forward_range auto&& rng) const
      -> std::ranges::forward_range auto
  {
    return rng | std::views::slide(5)
               | std::views::transform(mean);
  }
};

inline constexpr sliding_mean_fn sliding_mean;
```
[Godbolt](https://godbolt.org/z/ecGa3Exqe)

That works and is honestly not that much boilerplate. There exists however a much simpler way of achieving the same
effect which already works in C++20 (at least if you ignore that `slide` is C++23) and relies on the fact that the pipe
operator for range adaptors is associative, meaning that given a range `R` and two range adaptors `A₁` and `A₂`, the
expression `R | A₁ | A₂` can both be seen as the successive application of both adaptors, `(R | A₁) | A₂`, or
equivalently as the application of a single combined adaptor, `R | (A₁ | A₂)`. Hence, instead of defining
a `sliding_mean` function which applies two adaptors to a generic range argument and then going to the motions of
turning that function into a range adaptor closure, we can simply combine both adaptors to yield the `sliding_mean`
adaptor object directly!

```cpp
inline constexpr auto sliding_mean =
    std::views::slide(5) | std::views::transform(mean);
```
[Godbolt](https://godbolt.org/z/T3Px7jKh9)

That is almost embarrassingly simple. Composing range adaptors in this way is akin to _point-free programming_ in
functional programming languages where functions are defined through composition and partial application ("currying") of
other functions. The equivalent of currying is also possibly by creating a range adaptor factory function, e.g. to allow
specifying the window size:

```cpp
constexpr auto sliding_mean(std::size_t s) {
  return std::views::slide(s) | std::views::transform(mean);
}
```
[Godbolt](https://godbolt.org/z/n9M47K1fM)

<!--
### Comparison to Rust's `Iterator` trait

```rust
fn mean(slice: &[f64]) -> f64 {
    let len = slice.len() as f64;
    slice.into_iter().sum::<f64>() / len
}

fn sliding_mean(slice: &[f64]) -> impl Iterator<Item=f64> + '_ {
    slice.windows(5)
         .map(mean)
}
```

```rust
use itertools::Itertools;
let a = [3., 4., 5., 4., 3., 2., 4., 5., 9., 7.,
         8., 6., 5., 4., 3., 2., 0., 1., 2., 1.];
println!("[{}]", sliding_mean(&a)
                 .map(f64::round)
                 .format(", "));
```
[Godbolt](https://godbolt.org/z/3bEre38cf)



```rust
println!("[{}]", sliding_mean(a.into_iter())
                 .map(f64::round)
                 .format(", "));
println!("[{}]", sliding_mean(0..15)
                 .map(f64::round)
                 .format(", "));
```

[Godbolt: tuple impl](https://godbolt.org/z/9PWeThW9r)

Discussion on [itertools issue #64][itertools-issue-64]

```rust
fn mean<I, T>(iter: I) -> f64
    where I: Iterator<Item=T> + ExactSizeIterator,
          T: Into<f64>,
{
    let len = iter.len() as f64;
    iter.map_into().sum::<f64>() / len
}

fn sliding_mean<I, T>(iter: I) -> impl Iterator<Item=f64>
    where I: Iterator<Item=T> + ExactSizeIterator + Clone,
          T: Into<f64>,
{
    iter.slide(5)
        .map(mean)
}
```
[Godbolt](https://godbolt.org/z/E7EdrxMnj)

Would be nicer to simply chain function:

```rust
println!("[{}]", a.into_iter()
                  .sliding_mean()
                  .map(f64::round)
                  .format(", "));
println!("[{}]", (0..15).sliding_mean()
                        .map(f64::round)
                        .format(", "));
```

Using an extension trait with a blanket implementation:

```rust
trait SlidingMeanIterator: Iterator + ExactSizeIterator + Clone
    where <Self as Iterator>::Item: Into<f64>,
{
    fn sliding_mean(self)
        -> Map<Slide<Self>,
               fn(<Slide<Self> as Iterator>::Item) -> f64>
    {
        self.slide(5)
            .map(mean)
    }
}

impl<I, T> SlidingMeanIterator for I
    where I: Iterator<Item=T> + ExactSizeIterator + Clone,
          T: Into<f64>
{}
```
[Godbolt](https://godbolt.org/z/z7Gf6avEz)

[itertools-issue-64]: https://github.com/rust-itertools/itertools/issues/64
-->


[tina-twitter]: https://twitter.com/_Yulivee_
[cpponsea-talk]: https://www.youtube.com/watch?v=Ln_cVjJl680
[range-v3]: https://github.com/ericniebler/range-v3
[p2387]: https://www.open-std.org/jtc1/sc22/wg21/docs/papers/2021/p2387r3.html
