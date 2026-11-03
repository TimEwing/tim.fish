// Typewriter effect for /welcome/.
//
// Reads the children of <template id="welcome-script"> in order and "types" them into #console:
//   class="newline"     start a new prompt line before this element
//   class="typewriter"  reveal text one character at a time (otherwise all at once)
//   data-delay="ms"     pause after each chunk of this element (default TYPING_MS)
// Only flat elements are supported (no nesting).

(function () {
  const TYPING_MS = 35;
  const BLINK_THRESHOLD_MS = 750; // cursor blinks during pauses at least this long

  const consoleEl = document.getElementById("console");
  const script = document.getElementById("welcome-script");
  const skipButton = document.getElementById("skip-animation");
  if (!consoleEl || !script) return;

  const cursor = document.createElement("span");
  cursor.className = "blink";
  cursor.textContent = "█";

  let line = null;

  function newLine() {
    if (line) line.append(document.createElement("br"));
    line = document.createElement("span");
    const prompt = document.createElement("span");
    prompt.className = "prompt";
    prompt.textContent = " > ";
    line.append(prompt, cursor);
    consoleEl.append(line);
  }

  // Yields the delay to wait after each chunk of text is shown.
  function* chunks() {
    for (const source of script.content.children) {
      if (!line || source.classList.contains("newline")) newLine();

      const el = source.cloneNode(false);
      el.classList.remove("newline", "typewriter");
      el.removeAttribute("data-delay");
      if (!el.classList.length) el.removeAttribute("class");
      cursor.before(el);

      const delay = source.dataset.delay ? Number(source.dataset.delay) : TYPING_MS;
      const text = source.textContent;
      const parts = source.classList.contains("typewriter") ? [...text] : [text];
      if (!parts.length) parts.push("");

      for (const part of parts) {
        el.append(part);
        yield delay;
      }
    }
  }

  const steps = chunks();
  let timer = null;

  function tick() {
    const { value: delay, done } = steps.next();
    if (done) {
      cursor.classList.add("blink");
      return;
    }
    cursor.classList.toggle("blink", delay >= BLINK_THRESHOLD_MS);
    timer = setTimeout(tick, delay);
  }

  if (skipButton) {
    skipButton.addEventListener("click", function () {
      clearTimeout(timer);
      while (!steps.next().done);
      cursor.classList.add("blink");
      skipButton.hidden = true;
    });
  }

  tick();
})();
