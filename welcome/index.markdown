---
# Feel free to add content and custom Front Matter to this file.
# To modify the layout, see https://jekyllrb.com/docs/themes/#overriding-theme-defaults

layout: splash
classes: wide
author_profile: false
---

<!-- content of console, to be rendered in char by char -->
<div id="template-div" style="display: none;">
  <span id="template-newline" style="color: #999;">&nbsp;&gt;&nbsp;</span>
  <span id="template-cursor" class="blink">&#9608;</span>
  <!-- Each element inside the template-content div will be added to #console one at a time in a copy of their element (without the extra classes) -->
  <!-- For data-delay, the text will be rendered with a longer delay -->
  <!-- For typewriter classes, the text will be added one char at a time -->
  <!-- For newline classes, the element gets added to a new parent <p> -->

  <!-- Nested elements are not supported; the first element must have class newline -->
  <div id="template-content">
    <span class="newline" data-delay="2000"></span>
    <span class="typewriter">Hello, world!</span>
    <span data-delay="1500"></span>

    <span class="newline typewriter">I'm Tim Ewing.</span>
    <span data-delay="800"></span> 
    <span class="typewriter"> I'm a Software Engineer with a BS in Engineering Physics from the University of Colorado Boulder.</span>
    <span data-delay="1500"></span>

    <a href="/" class="newline typewriter">tim.fish</a>
    <span class="typewriter"> is my website.</span>
    <span data-delay="300"></span>
    <span class="typewriter"> It shows off some of the projects and work that I do. </span>
    <span data-delay="500"></span>
    <span class="newline typewriter">I use it as a virtual resume and portfolio;</span>
    <span data-delay="300"></span> 
    <span class="typewriter"> since you're here, I probably want you to hire me! </span>
    <span data-delay="1000"></span>

    <span class="newline typewriter">If so, my resume is </span>
    <a href="/assets/resume_tim_ewing.pdf" class="typewriter">here</a>
    <span class="typewriter"> and a list of the projects on this site is </span>
    <a href="/" class="typewriter">here</a>
    <span class="typewriter">.</span>
    <span data-delay="1000"></span>

    <span class="newline"></span>
    <span class="newline typewriter">If you're not here to hire me, then</span>
    <span data-delay="600">...</span>
    <span data-delay="1000"></span>
    <span class="typewriter"> Well, hi I guess?</span>
    <span data-delay="600"></span>
    <span class="typewriter"> How did you get here?</span>
    <span data-delay="500"></span>
    <span class="typewriter"> Are you lost?</span>
    <span data-delay="500"></span>
    <span data-delay="1000" class="newline typewriter">...</span>
    <span class="newline typewriter">I guess you should just take a look around too. </span>
    <span data-delay="1000"></span>

    <span class="newline" data-delay="750"></span>
    <span class="typewriter">Click </span>
    <a href="/" class="typewriter">here</a>
    <span class="typewriter"> to continue.</span>

  </div>
</div>

<div class="console">
  <div id="console"></div>
  <a class="btn skip-animation" href="#" id="skip-animation">Skip Animation</a>
</div>
