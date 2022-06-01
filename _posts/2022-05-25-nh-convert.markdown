---
layout: single
author_profile: true
classes: wide

title:  "nh_convert.sh<span class='blink'>&#9608;</span>"
date:   2022-05-18 10:00:00 -0600
header:
  teaser: /assets/images/nh.jpg
excerpt: New Horizons unresolved observation filter conversion, performed as an independent study.
---

<a href="https://github.com/TimEwing/pluto">
  <i class="fab fa-github"> View source on GitHub</i>
</a>

One of the perks of interning at Southwest Research Institute was being able to do an independent study my senior year. I was asked to convert unresolved observations of Pluto from NASA's New Horizons between two sets of optical filters. Since the bandwidth profile of the two filter sets didn't correspond cleanly, conversion was fairly involved. 

A writeup of the project is available as a pdf [here](/assets/nh_conversion_tim_ewing.pdf):

<embed src="/assets/nh_conversion_tim_ewing.pdf" type="application/pdf">

<br>

The code is structured as a Python data pipeline, segmented into many steps which were individually tested and verified. It's available on [GitHub](git@github.com:TimEwing/pluto.git).

