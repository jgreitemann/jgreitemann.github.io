---
layout: post
title:  "Version 3 release of TK-SVM — Wrapping up"
date:   2019-12-01 23:17:04+01:00
tags:
  - physics
  - thesis
  - machine-learning
  - c++
math-enabled: false
---

A new version of the TK-SVM framework has just been released and is now
available on the university's GitLab repository. In keeping with the number of
SVM-related papers we have published in the past 1.5 years, this is version 3
and reflects the changes made to the framework to facilitate our [latest
paper][3], studying the XXZ model on the pyrochlore lattice.

[svm-order-params][1]{: .gitlab}
{: .centered}

This release brings about a larger selection of sweep policies, more flexibility
in combining data from different runs, a [new client code][4] for generic
classical frustrated spin systems, a new MPI-based parallelization model,
infrastructure for parallel tempering, many extensions to the simple graph
analysis introduced in the previous version, and countless bug fixes. A
comprehensive [changelog][5] is also available.

More information on the TK-SVM method is now also publically available in my
[PhD thesis][2], including an (otherwise unpublished) application to the
Heisenberg model on the Kagome lattice.
This wraps up my involvement with the TK-SVM project, even though this work will
very much continue without me.

[1]: https://gitlab.physik.uni-muenchen.de/LDAP_ls-schollwoeck/svm-order-params
[2]: https://nbn-resolving.org/urn:nbn:de:bvb:19-250579
[3]: /publications/1907.12322/
[4]: https://gitlab.physik.uni-muenchen.de/LDAP_ls-schollwoeck/svm-order-params/tree/v3.0/frustmag
[5]: https://gitlab.physik.uni-muenchen.de/LDAP_ls-schollwoeck/svm-order-params/blob/v3.0/CHANGELOG.md
