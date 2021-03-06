---
layout: post
title:  "Mathematics integration"
date:   2018-02-11 00:08:00 +0100
tags:
- jekyll
- latex
math-enabled: true
description: "Showing off mathematical formulae in blog posts."
---
This post demos rendering mathematical equations on this blog using KaLaTeX. As an example, take this path integral representation of the single-particle propagator in the Fröhlich polaron:

$$\left< 0,0 \vert 0, \beta \right> = \int D \mathbf{r}(\tau) \exp \left[ -\frac{1}{2} \int_0^{\beta} \dot{\mathbf{r}}(\tau)^2\mathrm d\tau + \frac{\alpha}{2^{3/2}} \int_0^{\beta} \int_0^{\beta} \frac{e^{- \left| \tau - \sigma \right|}}{ \left| \mathbf{r}(\tau) - \mathbf{r}(\sigma) \right|} \mathrm d\tau \mathrm d\sigma \right]$$
