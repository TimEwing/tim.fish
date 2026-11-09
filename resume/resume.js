// Renders /resume/ from master.yaml + variants/<v>.yaml (default "public").
// The data model and override rules are documented in resume/README.md.
// Depends only on js-yaml (vendored at /js/vendor/js-yaml.min.js).

(function () {
  const params = new URLSearchParams(location.search);
  const variantName = params.get("v") || "public";
  const root = document.getElementById("resume");
  const warningsEl = document.getElementById("warnings");
  const warnings = [];

  // ---------- data ----------

  async function loadYaml(path) {
    const res = await fetch(path, { cache: "no-cache" });
    if (!res.ok) throw new Error(`Couldn't load ${path} (HTTP ${res.status})`);
    return jsyaml.load(await res.text()) || {};
  }

  const isObject = (x) => x !== null && typeof x === "object" && !Array.isArray(x);

  // Deep merge: objects merge key by key, anything else (strings, numbers, arrays) replaces,
  // and a null in `over` deletes that key.
  function merge(base, over) {
    if (over === undefined) return base;
    if (!isObject(base) || !isObject(over)) return over;
    const out = { ...base };
    for (const [k, v] of Object.entries(over)) {
      if (v === null) delete out[k];
      else out[k] = merge(base[k], v);
    }
    return out;
  }

  function build(master, variant) {
    const basics = merge(master.basics || {}, variant.basics || {});
    const masterSections = master.sections || {};
    // A variant with no `sections` gets every master section.
    const picked = variant.sections || Object.fromEntries(Object.keys(masterSections).map((id) => [id, null]));

    const sections = [];
    for (const [id, over] of Object.entries(picked)) {
      const base = masterSections[id];
      if (!base && !(over && over.kind)) {
        warnings.push(`Section "${id}" isn't in master.yaml and has no "kind", so it was skipped.`);
        continue;
      }
      // An empty section in the variant (null) means "take master as-is".
      const s = merge(base || {}, over || {});
      const items = s.items || {};
      const ids = s.order || Object.keys(items);
      for (const itemId of ids) {
        if (!items[itemId]) warnings.push(`Section "${id}" lists item "${itemId}" in its order, but there's no such item.`);
      }
      if (s.order && over && isObject(over.items)) {
        for (const [itemId, v] of Object.entries(over.items)) {
          if (v !== null && !(base && base.items && base.items[itemId]) && !s.order.includes(itemId)) {
            warnings.push(`Section "${id}" adds item "${itemId}", but it isn't in that section's order, so it won't show.`);
          }
        }
      }
      sections.push({ id, ...s, list: ids.filter((i) => items[i]).map((i) => items[i]) });
    }
    return { basics, sections };
  }

  // ---------- rendering ----------

  function el(tag, className, ...children) {
    const node = document.createElement(tag);
    if (className) node.className = className;
    for (const c of children) if (c !== undefined && c !== null && c !== "") node.append(c);
    return node;
  }

  function dates(s) {
    if (s.start == null && s.end == null) return "";
    if (s.start == null) return String(s.end);
    if (s.end == null || String(s.end) === String(s.start)) return String(s.start);
    return `${s.start} - ${s.end}`;
  }

  // Contact fields that get a small label in the header. Anything else in `basics` (citizenship,
  // location, ...) is self-explanatory and goes unlabeled on the line above.
  const CONTACT_LABELS = { email: "Email", phone: "Cell", website: "Personal site" };

  function renderHeader(basics) {
    const { name, ...rest } = basics;
    const about = el("p", "contact about");
    const reach = el("div", "contact reach");
    for (const [key, value] of Object.entries(rest)) {
      let node = String(value);
      if (key === "email") node = Object.assign(el("a", null, node), { href: `mailto:${value}` });
      else if (key === "website") node = Object.assign(el("a", null, node), { href: value });
      const label = CONTACT_LABELS[key];
      if (label) reach.append(el("span", "contact-label", label), el("span", "contact-value", node));
      else about.append(el("span", null, node));
    }
    // Name + about on the left, contact methods as a small label/value table on the right.
    return el("header", "resume-header",
      el("div", "who", el("h1", null, name), about.childNodes.length ? about : null),
      reach.childNodes.length ? reach : null);
  }

  function renderItem(item) {
    const li = el("li", item.topic ? "topic" : "bullet");
    if (item.topic) li.append(el("strong", null, item.topic), item.text ? " - " : "");
    li.append(item.text || "");
    if (Array.isArray(item.details) && item.details.length) {
      li.append(el("ul", null, ...item.details.map((d) => el("li", null, d))));
    }
    return li;
  }

  const renderers = {
    entry(s) {
      const box = el("div", "entry");
      if (s.title || s.org || s.location || dates(s)) {
        const what = el("span", "what");
        if (s.title) what.append(el("strong", null, s.title));
        const rest = [s.org, s.location].filter(Boolean).join(", ");
        if (rest) what.append(s.title ? `, ${rest}` : el("strong", null, rest));
        box.append(el("div", "entry-head", what, el("span", "when", dates(s))));
      }
      let group, ul;
      for (const item of s.list) {
        if (!ul || item.group !== group) {
          group = item.group;
          if (group) box.append(el("div", "group", group));
          ul = box.appendChild(el("ul", "items"));
        }
        ul.append(renderItem(item));
      }
      return box;
    },

    publications(s) {
      // The section's `me` (e.g. "Ewing, Timothy") is wrapped in <strong> wherever it appears in an author list
      // (styled in the accent color in resume.css, so it doesn't compete with the bold title).
      const authors = (text) => {
        const parts = String(text || "").split(s.me || "\0");
        return parts.flatMap((part, i) => (i ? [el("strong", null, s.me), part] : [part]));
      };
      return el("div", "pubs", ...s.list.map((p) =>
        el("div", "pub", el("div", "pub-title", p.title), el("div", null, ...authors(p.authors)), el("div", "venue", p.venue))));
    },

    skills(s) {
      const thisYear = new Date().getFullYear();
      const head = el("tr", null, ...["Skill", "Active Use", "Years of Experience", "Experience Level"].map((h) => el("th", null, h)));
      const rows = s.list.map((k) => {
        const years = k.years ?? (k.until ?? thisYear) - k.since;
        return el("tr", null,
          el("td", null, k.name),
          el("td", null, `${k.since} - ${k.until ?? "Present"}`),
          el("td", "num", String(years)),
          el("td", null, k.level || ""));
      });
      return el("table", "skills", el("thead", null, head), el("tbody", null, ...rows));
    },
  };

  function render({ basics, sections }) {
    root.append(renderHeader(basics));
    let heading = null;
    let block = null;
    for (const s of sections) {
      const renderer = renderers[s.kind];
      if (!renderer) {
        warnings.push(`Section "${s.id}" has unknown kind "${s.kind}" (expected: ${Object.keys(renderers).join(", ")}).`);
        continue;
      }
      if (!block || s.heading !== heading) {
        heading = s.heading;
        block = root.appendChild(el("section", "block"));
        if (heading) block.append(el("h2", null, heading));
      }
      block.append(renderer(s));
    }
  }

  // ---------- page fitting ----------
  // Grows the resume to fill a whole number of Letter pages: extra space goes into the gaps
  // between entries/sections (capped), and a trailing skills block is pinned to the bottom of
  // the last page. Measured on screen, which has the same content width as print (7.3in).

  const PX_PER_IN = 96;
  const PAGE_H = 10 * PX_PER_IN;     // 11in Letter minus the 0.5in top/bottom @page margins in resume.css
  const MAX_GAP = 0.3 * PX_PER_IN;   // most extra space added between two entries
  const SAFETY = 12;                 // px of slack: print layout runs a few px taller than screen (row rounding)
  const narrow = matchMedia("screen and (max-width: 8.5in)");   // "screen": printing must not trigger it

  // Units that the printer won't split (see break-inside/break-after in resume.css).
  // A section heading travels with the first thing under it.
  function atoms(pinned) {
    const list = [];
    for (const child of root.children) {
      if (child.classList.contains("fit-spacer")) continue;
      if (!child.matches("section.block") || child === pinned) { list.push({ from: child, to: child }); continue; }
      const parts = child.querySelectorAll(":scope > .entry, :scope > .pubs > .pub, :scope > table");
      if (!parts.length) { list.push({ from: child, to: child }); continue; }
      parts.forEach((p, i) => list.push({ from: i ? p : child, to: p }));
    }
    return list;
  }

  // Simulates print pagination. Returns where the content ends (in px from the top of the
  // first page's content area) once atoms that would straddle a page break are pushed down,
  // and how far the last atom was pushed by the ones before it.
  function paginate(list) {
    const origin = root.getBoundingClientRect().top + parseFloat(getComputedStyle(root).paddingTop);
    let shift = 0, pageEnd = PAGE_H, end = 0, shiftBeforeLast = 0;
    for (const a of list) {
      shiftBeforeLast = shift;
      let t = a.from.getBoundingClientRect().top - origin + shift;
      let b = a.to.getBoundingClientRect().bottom - origin + shift;
      while (t >= pageEnd) pageEnd += PAGE_H;
      if (b > pageEnd && b - t <= PAGE_H) {   // doesn't fit: the printer moves it to the next page
        shift += pageEnd - t;
        b += pageEnd - t;
        pageEnd += PAGE_H;
      }
      while (b > pageEnd) pageEnd += PAGE_H;   // taller than a page: it just breaks
      end = b;
    }
    return { end, shiftBeforeLast };
  }

  const pagesFor = (end) => Math.max(1, Math.ceil((end + SAFETY) / PAGE_H));

  function fit() {
    root.querySelectorAll(".fit-spacer").forEach((n) => n.remove());
    root.style.removeProperty("--gap");
    root.style.removeProperty("--pages");
    root.classList.remove("multipage");
    const last = root.lastElementChild;
    const pinned = last && last.querySelector(":scope > table.skills") ? last : null;
    root.querySelectorAll(".pinned").forEach((n) => n.classList.remove("pinned"));
    if (pinned) pinned.classList.add("pinned");
    if (narrow.matches) return;   // phone layout: different widths, nothing to match

    const list = atoms(pinned);
    const setGap = (g) => root.style.setProperty("--gap", `${g}px`);
    const pages = pagesFor(paginate(list).end);

    // Biggest gap (up to MAX_GAP) that doesn't add a page.
    let lo = 0, hi = MAX_GAP;
    setGap(hi);
    if (pagesFor(paginate(list).end) > pages) {
      for (let i = 0; i < 12; i++) {
        const mid = (lo + hi) / 2;
        setGap(mid);
        if (pagesFor(paginate(list).end) > pages) hi = mid; else lo = mid;
      }
      setGap(lo);
    }

    // Whatever is left over goes above the pinned block, so it sits on the bottom of the last page.
    if (pinned) {
      const { shiftBeforeLast } = paginate(list);
      const origin = root.getBoundingClientRect().top + parseFloat(getComputedStyle(root).paddingTop);
      const bottom = pinned.getBoundingClientRect().bottom - origin + shiftBeforeLast;
      const space = pages * PAGE_H - SAFETY - bottom;
      if (space > 0) pinned.before(Object.assign(el("div", "fit-spacer"), { style: `height:${space}px` }));
    }

    root.style.setProperty("--pages", pages);
    root.classList.toggle("multipage", pages > 1);
  }

  function showWarnings() {
    if (!warnings.length) return;
    warningsEl.hidden = false;
    warningsEl.append(el("strong", null, "Resume warnings (not printed):"),
      el("ul", null, ...warnings.map((w) => el("li", null, w))));
  }

  (async function main() {
    try {
      const [master, variant] = await Promise.all([
        loadYaml("master.yaml"),
        loadYaml(`variants/${encodeURIComponent(variantName)}.yaml`),
      ]);
      document.title = `${(variant.basics && variant.basics.name) || master.basics.name} - ${variant.title || "Resume"}`;
      render(build(master, variant));
      await document.fonts.ready;   // measure with the real font, not the fallback
      fit();
      narrow.addEventListener("change", fit);
    } catch (err) {
      warnings.push(String(err.message || err));
      if (location.protocol === "file:") {
        warnings.push("Browsers block loading files from file:// pages. From the repo root run `python3 -m http.server 8000`, then open http://localhost:8000/resume/");
      }
    }
    showWarnings();
    document.body.dataset.ready = "true";
  })();
})();
