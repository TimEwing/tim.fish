# Resume

The resume is data plus one HTML page. There's no build step and nothing to install: you edit YAML, open the page in a browser, and print it to PDF.

```
resume/
  master.yaml          Everything I've ever done. The single source of facts.
  variants/<name>.yaml One file per tailored resume (public, brc, ...). Each one overrides master.
  index.html           The page. /resume/?v=<name> renders that variant (default: public).
  resume.js            Loads + merges the YAML and renders it. Vanilla JS.
  resume.css           Print-first styling, US Letter.
  fonts/               IBM Plex Sans (vendored .woff2 files, OFL license).
js/vendor/js-yaml.min.js   YAML parser (vendored, pinned; no CDN).
```

## Viewing and printing

The site's "Resume" links go to https://tim.fish/resume/, which renders the public variant live from the YAML, so pushing a YAML change updates it. There's no committed PDF. The old `/assets/resume_tim_ewing.pdf` URL redirects to `/resume/` (see `404.html`). To make a PDF, for a job application say:

1. From the **repo root**: `python3 -m http.server 8000`. Browsers won't load the YAML if you open `index.html` straight from disk (`file://`).
2. Open http://localhost:8000/resume/ (or `/resume/?v=brc`). If the data has problems, a yellow warning box appears at the top. It doesn't print.
3. Either press Ctrl+P → "Save as PDF" in Chrome (margins: Default; headers/footers can stay on, since the page leaves no room for the header), or run the headless version:

```sh
google-chrome --headless --no-pdf-header-footer --window-size=1200,1000 --virtual-time-budget=5000 \
  --print-to-pdf=resume_tim_ewing.pdf "http://localhost:8000/resume/?v=public"
```

`chromium` works the same way. Keep `--window-size`: headless Chrome defaults to an 800px-wide window, which is narrow enough to get the phone layout, and then page fitting (below) is skipped.

**Page fitting.** The page always fills a whole number of Letter pages. `fit()` in `resume.js` measures the content, works out how many pages it needs, and spreads the leftover space into the gaps between entries and sections, up to `MAX_GAP` (0.3in) per gap. If the last section is a `skills` table, it's pinned to the bottom of the last page and takes up any space that's still left over. It checks where page breaks fall, so the extra spacing never adds a page. On screen, multi-page resumes show grey lines where the pages will break. To change the feel, edit `MAX_GAP`, or the `1.5 *` weight on section gaps in `resume.css`.

## The data model

`master.yaml` has `basics` (name and contact info, shown in the header in the order written) and `sections`. In the header, `email`, `phone` and `website` sit on the right as a small labeled table (Email / Cell / Personal site, set in `CONTACT_LABELS` in `resume.js`), and any other fields, like citizenship and location, go unlabeled under the name. Each section has an id and:

| field | meaning |
|---|---|
| `kind` | `entry` (jobs, degrees, projects, plain lists), `publications`, or `skills` |
| `heading` | big section header ("Experience"). Consecutive sections with the same heading share one header |
| `title`, `org`, `location`, `start`, `end` | `entry` header line. All optional; leave them all out for a plain list |
| `items` | the subsections/bullets, keyed by id |
| `order` | which item ids show, in what order. Leave it out to show all items |

An `entry` item has a `text` and an optional `topic`. With a topic it renders as "**Topic** - text", and without one it's a plain bullet. It can also have `group` (an italic sub-heading such as a mission name; consecutive items with the same group share it) and `details` (a list of nested bullets).

`publications` items have `title`, `authors` and `venue`. `skills` items have `name`, `since`, `until` (leave it out for "Present"), `level`, and optionally `years`. If `years` is missing, it's computed from since..until, or since..this year, so it never goes stale.

Alternate phrasings of the same fact go in master as separate items (e.g. `daq-officer` and `daq-officer-bullet`). The section's `order` picks the default, and variants pick whichever they want.

## Variants (tailored resumes)

A variant is master with overrides applied:

```yaml
title: Software resume        # used for the browser tab / PDF filename
basics:
  website: null               # null removes a field
sections:                     # ONLY these sections appear, in this order
  spacex:                     # empty = use master as-is
  toro:
    title: Robotics Engineer  # override any field
    order: [path-planning, topology]   # choose/reorder bullets
    items:
      topology:
        text: Reworded for this audience.
      devops: null            # delete a bullet
  my-one-off:                 # a section not in master is fine if it has a kind
    kind: entry
    heading: Other
    items:
      x: { text: Something only this resume says. }
```

The rules (implemented by `merge()` in `resume.js`):

1. `sections` lists which sections appear and in what order. If a variant has no `sections`, it gets all of master.
2. Everything else deep-merges over master: objects merge key by key, and strings, numbers and lists (like `order`) replace the master value.
3. `null` deletes the key it's on, whether that's a field, a bullet or a basics entry.
4. If a section has an `order` (from master or the variant), only those items show. A new bullet added in a variant has to be added to `order` too, and the warning box tells you if you forget.

## Common tasks

- **New job:** add a section to `master.yaml` (copy an existing job), then add its id to the `sections` of each variant that should show it, usually including `public.yaml`.
- **New tailored resume:** copy `variants/public.yaml` to `variants/<name>.yaml`, edit it, and open `/resume/?v=<name>`.
- **Changing the look:** `resume.css`. The font is IBM Plex Sans, saved into `fonts/` so the PDF looks the same on every machine. To switch fonts, download the `.woff2` files (e.g. from `https://cdn.jsdelivr.net/npm/@fontsource/<font>@<version>/files/`), put them in `fonts/`, and update the `@font-face` rules and `--font` at the top of `resume.css`.
