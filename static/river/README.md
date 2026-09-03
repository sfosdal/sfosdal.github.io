# Streamline Tavern website — handoff guide

This is everything a developer needs to take over the Streamline Tavern
website. It assumes you can edit HTML/CSS/JavaScript and use git. Nothing
here needs a build tool, a database, or a server you have to run.

- **Live site:** https://fosdal.net/river/
- **Source:** the `static/river/` folder of https://github.com/sfosdal/sfosdal.github.io
- **Hosting:** GitHub Pages, published by GitHub Actions on every push to `main`
- **Events feed:** https://fosdal.net/lqa-events/ (a separate project, see §5)
- **Built by:** Steve Fosdal, Ghostwood Labs — steve@fosdal.net
- **Last updated:** 2026-09-03

---

## 1. What the site is

A single-page static site for the Streamline Tavern, 174 Roy St, Seattle
(Lower Queen Anne). Sections, top to bottom, each with an HTML `id` you can
jump to (`#specials`, `#events`, …):

| Section | id | What it holds |
|---|---|---|
| Hero | `top` | Logo, hours, Follow Us button |
| Weekly specials | `specials` | Wing Monday, Wiener Wednesday, Taco Thursday, Slider Sunday |
| Nearby events | `events` | Live list pulled from the events feed + venue cards |
| Menu | `menu` | Food and drink copy (no prices) |
| Our Story | `about` | The Mike Lewis / Mary McIntyre story |
| Gallery | `gallery` | 50-photo carousel with lightbox |
| Visit | `visit` | Address, hours, directions, Google/Yelp/Facebook links, map |

Everything is plain HTML, CSS and vanilla JavaScript. There is no framework,
no npm, no build step for this folder.

## 2. Files

```
static/river/
├── index.html            the whole page — all copy lives here
├── styles.css            all styling (light-on-dark, red accent)
├── app.js                gallery/lightbox + the live events block
├── README.md             this file (also published at /river/README.md)
├── favicon.svg
├── manifest.webmanifest  "add to home screen" metadata
├── apple-touch-icon.png  180×180 home-screen icon (iOS)
├── icon-192.png          home-screen icons (Android/manifest)
├── icon-512.png
└── images/
    ├── logo.png          the sign artwork used in the hero
    ├── full/01.jpg … 50.jpg    gallery photos (~22 MB total)
    └── thumb/01.jpg … 50.jpg   matching thumbnails (~4.5 MB total)
```

Sizes: `index.html` and `styles.css` are hand-written and small; `app.js`
is about 17 KB. The photos are the only heavy thing.

## 3. How it is hosted and deployed

The `sfosdal/sfosdal.github.io` repo is a [Hugo](https://gohugo.io) site
for fosdal.net. Hugo copies anything under `static/` to the published site
verbatim, so `static/river/index.html` becomes `https://fosdal.net/river/`.
The Streamline site does not use Hugo templates, themes, or content files
at all; it just rides along in `static/`.

Deploy pipeline (`.github/workflows/gh-pages.yml`):

1. Push to `main`.
2. GitHub Actions runs `hugo --minify` (Hugo 0.118.2 extended).
3. `peaceiris/actions-gh-pages` pushes the `public/` output to the
   `gh-pages` branch.
4. GitHub Pages serves `gh-pages` at fosdal.net. Changes are live in
   roughly one minute. Check the Actions tab if they are not.

There is nothing to configure per deploy. There are no secrets; the
workflow uses the built-in `GITHUB_TOKEN`.

**Cloning:** the repo is large-ish. A sparse, blobless clone that only
pulls this folder is enough:

```sh
git clone --filter=blob:none --sparse https://github.com/sfosdal/sfosdal.github.io.git
cd sfosdal.github.io
git sparse-checkout set static/river .github
```

**Local preview:** any static file server works. From the repo root:

```sh
python3 -m http.server -d static 8086
# then open http://localhost:8086/river/
```

The events block will load from the live feed, so you see real data locally.

### Moving it somewhere else

Because it is plain files, the whole `static/river/` folder can be dropped
onto any static host (Netlify, Cloudflare Pages, S3, a shared host).
Only one file assumes the `/river/` path: `manifest.webmanifest`, whose
`start_url` and `scope` are `/river/`. `index.html` has no absolute
`/river/` references, and asset paths in `index.html`, `styles.css` and
`app.js` are all relative.

## 4. Making common changes

All copy is in `index.html`. Search for the text you see on the page and
edit it. Then commit and push to `main`.

| Change | Where |
|---|---|
| Hours | Hero and Visit sections in `index.html`; also `manifest.webmanifest` description |
| Weekly specials | `<section id="specials">` in `index.html` |
| Menu | `<section id="menu">` |
| Our Story | `<section id="about">` |
| Social links | Instagram in the hero, Facebook/Yelp/Google in `#visit` |
| Colors, fonts, spacing | `styles.css` (custom properties at the top) |
| Which venues appear in the events list | `LQA_FILTER` in `app.js` — see §5 |
| Venue card blurbs and links | the `VENUES` map in `app.js` |

**Cache busting.** `index.html` loads `styles.css?v=27` and `app.js?v=10`.
When you change either file, bump its number in `index.html` or browsers
may keep the old version.

### Gallery photos

- Photos are `images/full/NN.jpg` with a matching `images/thumb/NN.jpg`,
  numbered `01` upward with two digits, no gaps.
- `app.js` has `var TOTAL = 50;` at the top. Set it to the number of photos.
- Full images are sized for screens (longest side 1600 px); thumbnails are
  the same photo at 640 px. To make a thumbnail on a Mac:
  `sips -Z 640 images/full/51.jpg --out images/thumb/51.jpg`
- The current 50 photos are neighborhood photos, not the bar's own. Replace
  them with the owners' photos before calling the site official.

### The logo and icons

`images/logo.png` is the hero artwork (1200×2200). The home-screen icons
(`apple-touch-icon.png`, `icon-192.png`, `icon-512.png`) were made from it,
padded on the background color `#0c0a0a`. Regenerate them if the logo changes.

## 5. The events feed (the one real dependency)

The "Nearby events" section is not maintained by hand. On page load,
`app.js` fetches a JSON feed of events around Seattle Center from a separate
project and renders the ones that match a filter.

**Where the data comes from**

- Feed: `https://fosdal.net/lqa-events/events.json`
- Helper script: `https://fosdal.net/lqa-events/filter.js`, loaded by
  `index.html` just before `app.js`. It exposes `window.LQAFilter` with the
  filter logic, the venue/team icon map, series detection, the connector
  graph drawing, and the pager math. The Streamline site uses the same
  code the calendar uses so the two always agree.
- Source of the feed: https://github.com/sfosdal/lqa-events. Its own README
  explains the scrapers (Ticketmaster, Seattle Center, SIFF, On the Boards,
  Vera Project, team schedule APIs) and the six-hourly cron that rebuilds
  `events.json`.

**What the site does with it** (all in `app.js`, after the gallery code)

- `LQA_FILTER = '0000E0'` is a filter code. It currently keeps Climate
  Pledge Arena, McCaw Hall and Seattle Center. To change the selection:
  open https://fosdal.net/lqa-events/, set the filters you want, click
  **Copy Filter Link**, and paste the six-character `?f=` value into
  `LQA_FILTER`. Do not hand-edit the code; it is a bitmask.
- The list shows events from today through four months out, eight per
  page, with a pager. Multi-night runs at the same venue are detected and
  drawn as connectors in the right gutter.
- The venue cards below the list are generated for every venue that has an
  event from two months back to four months ahead, using the `VENUES` map
  for the blurb and link. Four static cards in `index.html` are the
  fallback if the feed cannot be reached.
- On phones (≤620 px) tapping a row opens a bottom sheet instead of leaving
  the page.

**If the feed goes away**

The section degrades to the four static venue cards in `index.html`; the
rest of the site is unaffected. To remove the dependency entirely, delete
the `<script src="https://fosdal.net/lqa-events/filter.js">` tag and the
events block in `app.js`, and keep the static cards. To keep it, host your
own copy of the lqa-events project and change `LQA` in `app.js` to its URL.

## 6. Other external services

None of these need accounts or keys. All are called from the browser.

| Service | Used for | If it breaks |
|---|---|---|
| Google Fonts (Anton, Bebas Neue, Fugaz One, Caveat, Inter) | Typography | Falls back to system fonts; site still works |
| Google Maps embed (`<iframe>` in `#visit`) | The map | Blank box; the "Get Directions" link still works |
| Google favicon service (`google.com/s2/favicons`) | Venue marks in the events list, via `filter.js` | Rows show without icons |
| ESPN CDN (`a.espncdn.com`) | Team crests for home games, via `filter.js` | Same |
| Instagram, Facebook, Yelp, GeekWire | Outbound links only | Nothing |

There is no analytics on this page. (fosdal.net's main pages carry a Google
Analytics tag from the Hugo config; it is not emitted for files under
`static/`.)

## 7. Ownership and accounts

State as of the date above:

- **Domain and hosting** are Steve Fosdal's (fosdal.net on his GitHub
  account). The bar does not yet own a domain for this site. Moving to a
  bar-owned domain means: register it, point it at whatever host you choose,
  copy the folder, fix the `/river/` paths noted in §3.
- **GitHub repo** is `sfosdal/sfosdal.github.io`. Transfer or fork it, or
  just copy the folder; there is nothing else in the repo the bar needs.
- **Instagram** (`streamlineseattle`) and **Facebook** (`streamlinetavern`)
  belong to the bar.
- **Google Business Profile** and **Yelp** listings are the bar's.
- **Photos:** see §4. Confirm rights before reuse.
- **Footer** still says "An unofficial tribute site built from neighborhood
  photos." Change it when the owners sign off.

## 8. Checklist for a new maintainer

1. Get push access to the repo (or a copy of `static/river/`).
2. Clone with the sparse checkout in §3 and open the local preview.
3. Make a trivial edit, push to `main`, and confirm it appears at
   https://fosdal.net/river/ within a couple of minutes.
4. Read the lqa-events README so you know how the feed is built and what
   to do when a scraper breaks.
5. Keep this file current when anything above changes.
