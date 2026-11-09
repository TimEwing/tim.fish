# tim.fish

Tim Ewing's personal website: plain HTML, CSS, and a little vanilla JS. There are no frameworks and no build step, and the only third-party code is one vendored file (`js/vendor/js-yaml.min.js`). Every file is served exactly as it is in the repo.

## Layout

```
index.html              Home: profile + project cards. Sends first-time visitors (per session) to /welcome/.
about/index.html        About / contact page.
welcome/index.html      Typewriter "console" intro; its script lives in a <template> on the page.
projects/<name>/        One page per project (omnichrome, kepler, nh-convert, swri).
resume/                 Resume as data: master.yaml + variants/*.yaml, rendered by index.html.
                        Served live at /resume/ (there is no static PDF). See resume/README.md.
404.html                Not-found page (GitHub Pages serves it automatically). Also redirects old URLs,
                        like the retired /assets/resume_tim_ewing.pdf, to their new homes.

css/site.css            The only stylesheet. Colors are CSS variables at the top.
js/typewriter.js        Drives the /welcome/ animation. Conventions are documented in the file header.
js/vendor/              Vendored third-party JS (js-yaml, for the resume page).

assets/                 Static media: images/, videos/, and PDFs (papers).
favicon.ico/.png
CNAME                   Custom domain for GitHub Pages.
.nojekyll               Tells GitHub Pages to serve files as-is instead of running Jekyll.
```

URLs map directly to folders: `projects/kepler/index.html` is served at `/projects/kepler/`.

## Conventions

- Every page is a complete HTML document. The masthead (`<header class="masthead">`) is copied into each page instead of being templated. If you change the nav, update every `*.html` (`grep -rl masthead --include=*.html .`).
- Use root-relative links (`/assets/...`, `/projects/...`).
- **Adding a project:** copy an existing `projects/<name>/index.html`, then add a card for it in `index.html`. Cards are listed newest first.

## Local preview

Any static file server from the repo root works:

```sh
python3 -m http.server 8000   # then open http://localhost:8000
```

## Deploying

GitHub Pages serves this repo directly from `master` (repo root), with the custom domain set by `CNAME`. Since there's no build step, pushing to `master` publishes the site, usually within a minute.

(Before 2026 the site was built with Jekyll and the output pushed to a separate `TimEwing.github.io` repo. That repo is archived.)
