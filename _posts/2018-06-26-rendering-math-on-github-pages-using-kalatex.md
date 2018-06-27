---
layout: post
title:  "Rendering math on GitHub Pages using KaLaTeX"
date:   2018-06-26 13:26:08+02:00
tags:   latex jekyll web
math-enabled: true
---

How to get $$\LaTeX$$ support on my GitHub Pages blog?

Stuff that goes in the `<head>`:

{% highlight html %}
{% raw %}
{% assign kalatex-enabled = page.math-enabled
                            | default: site.math-enabled
                            | default: false %}
{% assign jquery-required = kalatex-enabled %}

{% if jquery-required %}
  <script src="https://ajax.googleapis.com/ajax/libs/jquery/3.3.1/jquery.min.js"></script>
{% endif %}
{% if kalatex-enabled %}
  <link rel="stylesheet"
        href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-beta1/katex.min.css"
        integrity="sha384-VEnyslhHLHiYPca9KFkBB3CMeslnM9CzwjxsEbZTeA21JBm7tdLwKoZmCt3cZTYD"
        crossorigin="anonymous">
  <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.9.0-beta1/katex.min.js"
          integrity="sha384-O4hpKqcplNCe+jLuBVEXC10Rn1QEqAmX98lKAIFBEDxZI0a+6Z2w2n8AEtQbR4CD"
          crossorigin="anonymous"></script>
{% endif %}
{% endraw %}
{% endhighlight %}

Stuff that goes at the end of the document:

{% highlight html %}
{% raw %}
{% if kalatex-enabled %}
<script>
  $("script[type='math/tex']").replaceWith(() => {
      var tex = $(this).text();
      return katex.renderToString(tex, {displayMode: false});
  });

  $("script[type='math/tex; mode=display']").replaceWith(() => {
      var tex = $(this).html();
      return katex.renderToString(tex.replace(/%.*/g, ''),
                                  {displayMode: true});
  });
</script>
{% endif %}
{% endraw %}
{% endhighlight %}

