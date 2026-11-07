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

  function renderHeader(basics) {
    const { name, ...rest } = basics;
    const contact = el("p", "contact");
    for (const [key, value] of Object.entries(rest)) {
      let node = String(value);
      if (key === "email") node = Object.assign(el("a", null, node), { href: `mailto:${value}` });
      else if (key === "website") node = Object.assign(el("a", null, node), { href: value });
      contact.append(el("span", null, node));
    }
    return el("header", "resume-header", el("h1", null, name), contact);
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
      return el("div", "pubs", ...s.list.map((p) =>
        el("div", "pub", el("div", "pub-title", p.title), el("div", null, p.authors), el("div", "venue", p.venue))));
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
