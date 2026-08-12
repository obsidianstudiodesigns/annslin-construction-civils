# Annslin Construction & Civils — website

**Live:** https://obsidianstudiodesigns.github.io/annslin-construction-civils/

Static site. No build step, no framework, no database. GitHub Pages serves it
from `main` at the repository root — pushing to `main` redeploys it.

```
index.html          the whole page
404.html
css/style.css       mobile-first; every breakpoint is min-width
js/main.js          nav, reveals, counters, filters, lightbox, quote form
assets/img/         logo, icons, OG image
assets/img/work/    26 project photos (webp + jpg, 800w and full)
assets/img/services/ 6 service-card photos (webp + jpg, 16:9)
assets/video/       hero video, desktop + mobile cuts, with posters
robots.txt  sitemap.xml  site.webmanifest  favicon.ico
```

## Before this goes to the client

**The canonical URL is currently the GitHub Pages address.** If the site moves to
a real domain (the client's email suggests `annslin-construction.co.za`), search
and replace `https://obsidianstudiodesigns.github.io/annslin-construction-civils/`
across `index.html`, `robots.txt` and `sitemap.xml`. It appears in the canonical
tag, the Open Graph tags, the JSON-LD and the sitemap.

**No social links are in the footer** because none were supplied. If the client
has Facebook/Instagram, add them to the footer and to `sameAs` in the JSON-LD —
`sameAs` is what ties the site to their social profiles for Google.

## Content — where every word came from

Everything is from the flyer, the logo, the cover image and the 15 supplied
photos. Nothing about the business was invented: no testimonials, no project
counts, no staff numbers, no service areas beyond "South Africa", no trading
hours, and no registrations (NHBRC, CIDB) — those need to come from the client.

Two things are worth flagging as **generic copy rather than supplied fact**:

- The **"How we work"** four stages (Consultation → Planning & costing →
  Construction → Handover). This is a standard contractor sequence, written to
  make no specific promises. Confirm it matches how they actually run a job.
- The short descriptions under each of the six services. The six service
  **names** are the client's; the sentences beneath them are written copy.

The "10 years", the six services, both taglines and all contact details are
lifted directly from the flyer.

## Google indexing / the favicon

The brief was that Google should show the logo, not a grey globe. That is driven
by the favicon, and Google is fussy about it:

- `favicon.ico` sits at the site root and is also declared with `<link rel="icon">`.
- It is **square** and multi-resolution (16 → 256). The supplied logo is a wide
  landscape lockup, so the icons use just the building mark, centred on the brand
  charcoal — a squashed full logo would be unreadable at 16px.
- PNG icons at 48/96/192 are declared too, since Google prefers a 48px multiple.
- `Organization` JSON-LD carries a 512×512 `logo`, which feeds the knowledge panel.

Google only refreshes favicons on its own recrawl schedule — expect days to
weeks after the site is first indexed, not minutes. Submit the sitemap in Google
Search Console to speed the first crawl up.

Also present: canonical URL, Open Graph and Twitter cards with a 1200×630 image,
`GeneralContractor` + `Organization` + `WebSite` JSON-LD with the postal address,
`robots.txt`, `sitemap.xml` (with image entries) and a web manifest.

## Assets — what was done to them

- **Hero video.** The supplied clips carry a white four-point AI watermark at a
  fixed position near the bottom right. Both were cropped past it:
  - desktop `Landing page.mp4` 1280×720 → **1120×720** (160px off the right; the
    star sat at x 1146–1192)
  - mobile `Landing page mobile.mp4` 720×1280 → **720×1104** (176px off the
    bottom; the star sat at y 1130–1188)

  Cropping the right on the landscape cut and the bottom on the portrait cut
  keeps each composition intact. Both were re-encoded to H.264 mp4 (faststart)
  and VP9 webm with the audio stripped, and posters were cut from the same
  cropped frames. Sampled frames across both outputs were checked and the
  watermark is gone.

- **Project photos.** 26 of the 39 images in `Our Work/` are used. Exported to
  webp with a jpg fallback at two widths (800w and up to 1600w) and served
  through `<picture>` + `srcset`. EXIF orientation is applied, then stripped.

  The 13 left out are near-duplicates of ones already shown (second angles of
  the same shopfront, slab, stack or dressing room) — the gallery reads better
  without them. They are all still in `Our Work/` if you want to swap any in;
  the build table lives in the project notes and is keyed by filename order.

- **Two images were deliberately excluded.** The aerial "house from above" and
  the garden-side house view are 3D architectural **renders**, not photographs
  of built work. Everything in the gallery is presented as completed or
  in-progress Annslin work, so a render would misrepresent it. If the client
  wants them shown, they should sit in a separate "design visualisation" strip
  rather than in Recent Projects.

- **Service-card photos.** All six now come from `Our Work/`. Earlier versions
  of the commercial and industrial cards borrowed images from the flyer because
  the old photo set was entirely residential; the new set covers both, so no
  flyer stock is used anywhere on the site.

## The mobile hero video

`js/main.js` picks the source at runtime: the portrait cut below 820px, the
landscape cut above. The sources are injected by JavaScript rather than written
into the HTML, so a phone never downloads the landscape file. If
`navigator.connection.saveData` is on, no video loads at all and the poster
carries the section. Without JavaScript the poster shows.

## How the quote form works

There is no server. The form validates in the browser, then opens WhatsApp with
a pre-filled message to **+27 69 644 7576**. It works on any static host with no
backend, and enquiries land where the client already works.

To switch to a real emailed form later, the submit handler in `js/main.js` (the
`#quoteForm` listener) is the only thing that changes.

## Third-party dependencies

**Google Fonts only** (Oswald + Inter). Nothing else — no CDN JavaScript, no
analytics, no trackers. If the fonts fail to load the page falls back to
Arial Narrow / system sans and stays intact.

## Accessibility / behaviour

- Mobile-first CSS. Real layouts at 480, 640, 900 and 1024px, plus a landscape-
  phone case so the hero doesn't force a full screen height.
- Contrast checked: body text 16.3:1, muted text 5.2:1, gold on charcoal 7.7:1,
  dark-on-gold buttons 7.7:1 — all above WCAG AA.
- Full keyboard support, visible focus rings, skip link. The drawer and the
  lightbox both trap focus and close on Escape; the lightbox takes arrow keys
  and swipes.
- `prefers-reduced-motion` is respected — reveals, counters, smooth scrolling
  and the hero video all stand down.
- Images carry width/height so the page doesn't shift while loading.
- Scroll reveals are applied only once JavaScript is running, so with JS off
  (or if `main.js` fails) all content is visible rather than stuck invisible.
- Form inputs are 16px so iOS doesn't zoom on focus.

### Opening it locally

Double-clicking `index.html` works. To serve it properly:

```bash
python -m http.server 5188 --directory site
```
