---
layout: post
title:  "C++ on Sea 2022 Trip Report"
date:   2022-08-07 15:04:49+0200
tags:
  - c++
  - wasm
math-enabled: false
---

I had a chance to attend "C++ on Sea" in Folkestone this year. This write-up aims to give an overview of my personal
highlights as well as some solid overview talks.

## Highlights

### [Jason Turner: Making C++ fun, safe, and accessible][turner]

Jason gave the closing plenary talk of the conference, dubbed "endnote", and this was announced as his "most interactive
talk" yet which says a lot if you know his style. However, it started out perfectly silent with him putting up slides
with code in a made-up language with gibberish keywords and unfamiliar syntax, prompting the audience to infer what the
code would do and by extension learn a new language. This was later revealed as a pitch for a project to develop
resources to teach C++ to people (and particularly children) who don't speak English (yet) to make it more accessible.

As for whether C++ as a language is safe, he showed a code snippet with several bugs and demonstrated how using the
right tools, modern compilers will suggest how to make the code compile, sanitizers can spot memory errors among other
things, and static analyzers will nudge you in the way of best practices. These tools can be difficult to set up
properly (as even our build systems have the wrong defaults) and Jason promoted his best-practice CMake starter projects
on Github which come with full sanitizers and static analyzers running in CI on day one.

### [Daniela Engert: Contemporary C++][engert]

Daniela's talk was dominated largely by her scrolling through a toy project (which is already on her Github) which is a
simple client/server architecture where the server reads GIFs from a directory and writes their frames to socket;
whereas the client reads the images and displays them in a GUI. This was accomplished through liberate use of
coroutines: iterating the directory using a generator, reading the GIFs from disk, and running the server — all done
asynchronously but without spawning any dedicated threads. Instead, she plugged the coroutines into each other and
scheduled the whole thing on a thread pool provided by the ASIO library, meaning that she could just as well run the
whole app just on a single thread, without ever blocking on I/O operations. Even though the presentation of the code was
a bit dry at times, this was a really impressive demo how to use coroutines in practice and how they have the potential
to revamp and simplify our architectures, removing the need for synchronization completely and thus eliminating entire
species of bugs.

Daniela also showed off the use of `std::stop_source` for cooperative cancellation (standalone, without
using `std::jthread`) to shut the server down cleanly, and generally wrapped all her dependencies in modules which
re-export the bits she needed.

### [Jonathan Müller: Coroutines in C++ vs. Rust][mueller]

I was looking forward to this talk ever since the programme was announced. Same as C++, Rust gained language support for
coroutines (more commonly just referred to as "async/await") fairly recently and both languages went for a "stackless"
approach (contrary to Go's "Goroutines" which are stackful). Otherwise, they went for quite different approaches.

In C++, a coroutine looks like a regular function but has to contain one of the new keywords `co_await` , `co_return`, or
`co_yield` . The return type of the function is not the "logical" return type which is "returned" through co_return or
`co_yield` , but a coroutine type like `std::generator`  (coming in C++23) which customises the behaviour of the coroutine
through its associated `promise_type` and is usually templated on the logical return type. Rust coroutines are more
obvious to spot from the function declaration as they are functions prefixed with the async keyword. There's no special
syntax to return from them, `co_await x` is spelled `x.await`, and there is no way to yield values from them.

There are also notable differences in how the memory associated with a coroutine is managed. A C++ coroutine's internal
state machine resides in a compiler generated type, the coroutine frame, which is inaccessible to the programmer who
interacts with it solely through a type-erased handle. For that reason, the coroutine frame is technically always
heap-allocated, though that allocation may be elided in some cases. In contrast, the state machine type powering Rust's
`async` functions (which implements the Future trait) is either entirely compiler-generated, or can be entirely
hand-written and its type can be named and is `Sized`. This gives Rust programmers control over how they want to store
the coroutine, including on the stack when practical, but also means that the type must be known to the compiler
frontend which prevents the backend from optimising away unused members.

I'll definitely have to rewatch the talk after I have played around with coroutines in both languages more. Jonathan
talks quite fast and the subject is not easy so all of us came out of that talk with our heads spinning. My impression
is that C++'s approach is overall probably a bit more efficient and flexible; I'm just wondering if that is worth it,
considering that Rust's async functions seem more accessible, particularly to programmers coming from e.g. Javascript
where working with async/await is common practice.

## Honourable mentions

### [Hana Dusíková: Lightning Updates][dusikova]

Hana gave the opening keynote of the conference, presenting a soon-to-be-open-sourced library to manage update
mechanisms with possibly complex update path graphs. This was an interesting case study in API design, showing off many
of the new features coming in C++23 along the way. Working at Avast, the natural example for this are Anti-Virus
definitions which need frequent updates but shouldn't guzzle too much bandwidth. However, towards the end she showed how
the updater can be customized to draw its update data from the filesystem, effectively turning her library into a simple
VCS.

### [Andrew Soffer: How Hard Could It Be? Lessons Learned from Replacing int64 With int64_t.][soffer]

Andrew gave an account of what it took to refactor Google's entire codebase to replace Google's own typedef `int64` with
the standard `int64_t`. Even when only considering x86_64 Linux as the target architecture, this turned out much harder
than one might expect even though both types represent the same idea, have identical binary representations, and are
implicitly interconvertible. Still, both typedefs alias distinct types (`long` vs. `long long`) which has implications for
overload resolution of function templates, as well as type specifiers in `printf`-style format strings.

The sheer size of Google's codebase (about 250 million lines) means that manual refactorings just don't scale. Instead,
he stressed the importance of automatic refactorings using clang-based tools and how an almost full unit test coverage
is essential to confidently commit changes too large for any human to review.

### [Ólafur Waage: Sandbox Games — Using WebAssembly and C++ to make a simple game][waage]

It's been more than four years since I last worked with C++ compiled into WebAssembly using the Emscripten toolchain, so
I was curious to see how the tooling improved, esp. given that Rust has been leading the way in terms of WASM support
recently. Emscripten now targets WASM by default (as opposed to asm.js) and bindings for C++ data structures and
functions can be defined through macros in the emscripten.h header which is a huge improvement from the raw shared
memory access I was familiar with, though it's nowhere near as convenient as Rust's bindgen.

In terms of tooling, Ólafur demonstrated how the built-in (Javascript) debugger in Chrome and Firefox can be used to
debug and profile WASM, including setting breakpoints in C++ code or viewing flame graphs. Additionally, standalone WASM
runtimes allow using WebAssembly also outside of the browser similar to Node.js, or they can be embedded to create
portable plug-in infrastructures.

## Good overview talks

### [Anthony Williams: An introduction to multithreading in C++20][williams]

Anthony is responsible for many of the multithreading features in C++ and gave a good overview of latches, barriers,
futures, mutexes, semaphores, and atomics — and why should reach for them in that order. He also explained how the
cooperative cancellation API and `std::jthread` can help treat dedicated threads as value types.

### [Bryce Adelstein Lelbach: Standard Parallelism][lelbach]

Bryce gave an introduction into the "senders and receivers" proposal which will hopefully be accepted for C++26. If so,
it will deliver on the final two "pillars" of standard parallelism, the first one being the C++ 17 `ExecutionPolicy`
overloads of standard algorithms. In the second part of the talk, Bryce then presented `std::mdspan`, which is now almost
certainly coming in C++23, and gave an outlook how it may tie into the various linear algebra proposals.

### Mateusz Pusz: Sneak Peek C++23

Mateusz's talk went over all the new features that made it into C++23 so far. In particular, he spent quite a bit of
time on "deducing this" which will reduce the amount of boilerplate code library authors will need to write and will
make CRTP obsolete. _Update: Unfortunately, the video of this talk is not available on Youtube. There may have been a
problem with the recording._

## Closing remarks

This being my first C++ conference I was curious how the experience would compare to academic (physics) conferences and
how much of a difference it would make to attend in person as compared to watching the recording on Youtube. It is
definitely something else to sit in a Jason Turner talk for real. I also didn't find the more technical talks as
exhausting as watching them on Youtube. This was helped by the fact that the programme had plenty of coffee breaks.
Those are sometimes referred to as the "hallway track" and I found it easy to engage in conversation with other people
as this was the first conference for many of them. Lastly, I was pleasantly surprised by how diverse and inclusive the
conference was.

{% include figure.html
   url="/assets/img/folkestone_beach.jpg"
   width="70%"
   caption="View from the conference venue, overlooking the English channel with the Frensh coastline on the horizon." %}

[turner]: https://youtu.be/HlaoxhmThmk
[engert]: https://youtu.be/J_1-Au2MX6Y
[mueller]: https://youtu.be/yt-gueRNCTU
[dusikova]: https://youtu.be/f5o42_bMidg
[soffer]: https://youtu.be/NPHO3bhQ3G8
[waage]: https://youtu.be/5dcqJF0pZk0
[williams]: https://youtu.be/8mt076AtqYg
[lelbach]: https://youtu.be/cCOABV97zfA
