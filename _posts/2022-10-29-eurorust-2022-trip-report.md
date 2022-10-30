---
layout: post
title:  "EuroRust 2022 Trip Report"
date:   2022-10-29 23:58:48+0200
tags:
  - rust
  - c++
  - wasm
  - conference
math-enabled: false
excerpt: "This fall, I attended the first-ever EuroRust, the European offshoot of Rustfest, in Berlin. In this post, I’ve collected my impressions of some of the talks, grouped by their overarching topics."
---

This fall, I attended the first-ever [EuroRust][eurorust], the European offshoot of Rustfest, in Berlin. The conference
was fairly small (but sold out) with just two days and a single track, yet the talks were all pretty high-quality. Since
the Rust community is quite small and full-time Rust jobs are still in short supply, it was interesting talking to
people who managed to work in one. I had a great time in Berlin; the organizers were very professional, the venue was
appropriately industrial, food and coffee (!) were great, and it was all rounded out by a delightful closing dinner on a
boat on the Spree river. In short, I’m already looking forward to next year’s edition.

Below, I’ve collected my impressions of some of the talks, grouped by their overarching topics.

## Integration and interop with other languages

Few people get the chance to start a greenfield project at work, let alone in Rust; for most projects and products, the
aim is to start using Rust in some fairly small corner where it can play out its strengths, be it performance or safety,
and gradually expand its scope from there. The headline story in this context in recent months certainly was Rust being
used inside the Linux kernel, but an arguably even more pervasive piece of software which underpins billions of devices,
is libcurl. Its maintainer, [Daniel Stenberg][stenberg], gave the opening keynote and presented the architecture of
libcurl which provides several C interfaces for HTTP 1/2/3, QUIC, and TLS backends, all of which have implementations in
Rust, based on the [`hyper`][hyper], [`quiche`][quiche], and [`rustls`][rustls] crates, respectively. Neither one is
feature-complete at this point, and it’ll be awhile until downstream projects start shipping libcurl with the Rust
backends by default, but I’m amazed that a library as well established as libcurl dares to build on top of, say, `hyper`
and the underlying Tokio runtime. Vice versa, libcurl’s requirements can inform the development of new APIs in those
crates, as well as the Rust language at large.

[Colin Finck][finck], who’s a contributor in the [React OS][react-os] project which aims to reverse-engineer a
binary-compatible clone of MS Windows, presented on his crate [`nt-list`][nt-list] which comes with an ABI compatible
implementation of Windows Linked Lists in Rust. He highlighted some of the challenges that arise from the need to copy
the memory layout of the intrusive `LIST_ENTRY` node and how to overcome those in safe Rust. The resulting
implementation prevents most of the common misuses of the original C implementation while retaining binary compatibility
which allows using them to write Windows drivers or to browse their contents in WinDbg, even with versions predating
Rust itself.

[Raphaël Gomès][gomes] reported on how the [Mercurial VCS][mercurial] has been rewriting some of its Python codebase in
Rust. He went over some of the challenges, from technical issues related to encodings and testing, to human ones, like
building Rust experience in a team of Python devs. While the learning curve has been steep and bumpy at times, he
surmised that introducing Rust has been beneficial not just for the head-spinning performance improvements of 20,000x in
some cases, but also in terms of developer productivity.

While many of the Rust integrations rest on the FFI to C, interoperating with higher-level languages can be a bit more
of a challenge. As a C++ developer in my day job, Rust’s interop story with C++ was of particular interest to
me. [Tobias Hunger][hunger] reviewed several approaches, from calling member functions of C++ classes from within Rust
(and vice versa) using the [`cxx`][cxx] crate, including automatic translation between certain library types
like `std::unique_ptr`, `std::vector`, and `std::string` to Rust counterparts, to writing inline C++ code within a Rust
function using the [`cpp`][cpp] crate. Tobias also briefly touched on how C++ libraries can be integrated into Cargo
projects and how Rust code can be built from a CMake project using [Corrosion][corrosion]. I was pleasantly surprised by
what is possible in this space, esp. in the context of the current craze around C++ successor languages
like [Carbon][carbon], which actually recommends to use Rust for new projects and pitches itself as an option for
seamless interop with legacy C++ codebases. I wonder if an investment into Rust interop wouldn’t be more fruitful than
building another memory-unsafe language from scratch.

Last but not least in this category, there was a talk by [Bogdan Kolbik][kolbik] about interop with the JVM from an
application written in Scala. While it is possible to call into native code from the JVM using the JNI, they ended up
passing Protobuf messages between Rust and Scala code. It would be interesting to know how JetBrains does interop
between Kotlin, another JVM language, and the Rust backend in their new [Fleet][fleet] IDE, but I suspect it will be a
similar story, given that Fleet’s backend can run remotely as well.

## Rust and the Web

While in C++ circles, Rust is perceived mainly as a competitor systems programming language, a lot of the interest in
Rust is actually coming from the massive web development community. This is attested to by Mainmatter, a Munich-based
web consultancy, who presented EuroRust and publicized what they call a [“strategic bet on Rust”][mainmatter-bet] at the
start of the conference. In this space, there are mainly two areas where Rust is becoming increasingly popular: Using
Rust in the server backend to replace web frameworks like Rails, as well as compiling Rust to WebAssembly to run in the
browser. Of course, both of these can be combined in the same application to convey some of the same benefits that made
Node.js popular, i.e. sharing code between client and server side, and WASM itself can be executed server-side as well,
either through Node.js or for instance [wasmtime][wasmtime].

On the first front, server-side web frameworks, Rust developers are increasingly spoiled for
choice. [Rainer Stropek][stropek] did a good job reviewing and comparing four of them: [Actix-web][actix-web],
[Rocket][rocket], [Warp][warp], and [Axum][axum]. He implemented the same simple API in each of them and gave the
audience a feel for their respective approaches. While Rocket seems to be the most ergonomic of the bunch with its
"magic" proc macro routes and being pitched as "batteries-included", personally I like the tradeoffs chosen by the
newcomer Axum best as it is built on top of [Tower][tower], Tokio's middleware ecosystem, and ditches macros in favor of
still-readable-yet-not-quite-as-magic builder patterns.

On the WebAssembly side of things, [François Mockers][mockers] showed how games written using the [Bevy][bevy] engine
can be compiled into WASM. His talk was somewhat in the same vein as the one by Ólafur Waage
[back at C++ on Sea][cpp-on-sea] who showed how to accomplish the same thing in C++, albeit without the benefit of
a feature-rich engine such as Bevy. Subsequently, [Alberto Schiabel][schiabel] dove a little more into technical details
on the secret sauce which makes the integration of Rust into a JS app relatively smooth, but also showed some of the
limitations that (still) exist.

## Case studies

There's just something deeply satisfying in starting out with a long spaghetti-code function and iteratively refactoring
it until it fits comfortably on a single slide. That's exactly what [Stefan Baumgartner][baumgartner] did in this talk
"Trails, traits, and tribulations". While some of this is just the application of common sense and recognizing where the
responsibility of one function ends and that of another starts, Stefan also had some advice specific to Rust, like using
the ?-operator to focus the function on the happy path and how implementing standard library traits for your own types
helps you identify those responsibilities and leads to more idiomatic code, meanwhile promoting code reuse, e.g. by
implementing `Display for Foo` instead of writing a function `print_foo`.

[Rafael Epplée][epplee] gave an account of how he went about end-to-end testing a web backend, though I found that most
of what he presented carries over to other types of application you'd want to write tests for (which should be all of
them!), be it integration tests or unit tests. In Rust, the story really isn’t any different from how you’d go about it
in other languages: abstract over the unit’s interactions with the outside world (filesystem, databases, other program
units which are tested separately) with a trait, and inject a fake test implementation which can be used to verify the
expected effects but doesn’t depend on the actual environment, thus giving you fast, parallel, and reproducible tests.
Rust's trait system is uniquely suited for this task as it allows implementing the trait also on foreign types, thus
eliminating the need for a wrapper around third-party dependencies. Rafael also introduced the [`rstest`][rstest] crate
which I have since started using myself as it provides support for test fixtures, parametrized tests, and more.

A colleague of mine at MVTec, [Lukas Bergdoll][bergdoll], set out on a journey to optimize Rust's existing stable sort
implementation and took the audience along to witness the mistakes he made on the way and shared his learnings. Overall,
it served as a humble reminder to always re-check your assumptions when confronted with surprising results. It takes
some courage to admit that you're wrong, let alone to turn that into a talk. Here's to hoping that his work might still
make it into the standard library.

## Governance and Organizations

This last cluster of topics focussed less on the language itself but rather on the people and processes that drive its
progress. Recent events and discussions about the future of C++ pointed out the shortcomings of its ISO process and
many see Carbon's biggest advantage over C++ in its open-source process for evolving the language (draft) which is
inspired by the likes of Swift and Rust. Hence, I was interested in how the Rust project's governance model actually
works and [Ryan Levick][levick] gave a pretty good overview of its structure and processes in his keynote at the start
of the second day. The day before, [Pietro Albini][albini], who heads the Rust Security Response WG, walked through the
lifecycle of a particular CVE and shed some light on the sensitive work that by definition has to happen behind closed
doors.

The first day concluded with a panel discussion, moderated by the Rust Foundation's CEO, [Rebecca Rumbul][rumbul], with
representatives from four companies which are using Rust. An interesting takeaway was that the market for Rust
developers is still pretty much inverted from the labor market at large, both because Rust is popular with developers,
but also because companies are still reluctant and careful to migrate projects to (or start projects in) Rust. And when
they do, they typically start with a small team of veteran engineers; few companies are willing to take the risk of
trusting a new hire with a project using a technology they don't have experience with — that's one unknown too many.
Thus, for folks who wish to use Rust professionally, the panel recommended to try to push for Rust at work when the
chance presents itself, to find some niche where Rust can be integrated and play out its strengths, and then to talk
about it, at conferences, in blog posts, on Twitter, to make the industry see that placing the bet on Rust may not be as
risky as it might seem.

[eurorust]: https://eurorust.eu/

[stenberg]: https://eurorust.eu/2022/speakers/daniel-stenberg/

[finck]: https://eurorust.eu/2022/speakers/colin-finck/

[gomes]: https://eurorust.eu/2022/speakers/raphael-gomes/

[hunger]: https://eurorust.eu/2022/speakers/tobias-hunger/

[kolbik]: https://eurorust.eu/2022/speakers/bogdan-kolbik/

[stropek]: https://eurorust.eu/2022/speakers/rainer-stropek/

[mockers]: https://eurorust.eu/2022/speakers/francois-mockers/

[schiabel]: https://eurorust.eu/2022/speakers/alberto-schiabel/

[baumgartner]: https://eurorust.eu/2022/speakers/stefan-baumgartner/

[epplee]: https://eurorust.eu/2022/speakers/rafael-epplee/

[bergdoll]: https://eurorust.eu/2022/speakers/lukas-bergdoll/

[levick]: https://eurorust.eu/2022/speakers/ryan-levick/

[albini]: https://eurorust.eu/2022/speakers/pietro-albini/

[rumbul]: https://eurorust.eu/2022/speakers/rebecca-rumbul/

[hyper]: https://crates.io/crates/hyper

[quiche]: https://crates.io/crates/quiche

[rustls]: https://crates.io/crates/rustls

[nt-list]: https://crates.io/crates/nt-list

[cpp]: https://crates.io/crates/cpp

[cxx]: https://crates.io/crates/cxx

[actix-web]: https://crates.io/crates/actix-web

[rocket]: https://crates.io/crates/rocket

[warp]: https://crates.io/crates/warp

[axum]: https://crates.io/crates/axum

[tower]: https://crates.io/crates/tower

[rstest]: https://crates.io/crates/rstest

[react-os]: https://reactos.org/

[mercurial]: https://www.mercurial-scm.org/

[corrosion]: https://github.com/corrosion-rs/corrosion

[carbon]: https://github.com/carbon-language/carbon-lang

[fleet]: https://blog.jetbrains.com/fleet/2022/01/fleet-below-deck-part-i-architecture-overview/

[mainmatter-bet]: https://mainmatter.com/blog/2022/10/12/making-a-strategic-bet-on-rust/

[wasmtime]: https://wasmtime.dev/

[bevy]: https://bevyengine.org/

[cpp-on-sea]: /2022/08/07/cpp-on-sea-2022-trip-report
