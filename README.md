# The Foreign Express — Roveia-inspired rebuild

This build makes a substantial visual and layout change to the supplied static site. It uses the public Roveia Health homepage as a **design reference** for section hierarchy, typography scale, spacing, proof/service card patterns and motion—not as a source of copied brand assets or health-marketing copy.

## Run locally

From this directory:

```bash
python3 -m http.server 8080
```

Open <http://localhost:8080/>. A local static server is recommended instead of opening the HTML file directly.

## What changed

- Reworked the homepage into an editorial landing page with a large two-column hero, moving service strip, three audience/needs cards, destination imagery, student-story cards, six service tiles, a three-step journey, an interactive-looking IELTS preview, FAQ and lead-capture CTA.
- Replaced the previous orange/navy UI with a graphite, warm-white and lime palette; updated heading scale, page rhythm, card borders, button styling, controls, footer and page headers across the existing HTML pages.
- Reworked the shared navigation and footer in `js/app.js` to use a single-row, sticky navigation and responsive mobile panel while retaining the current routes and login-state link.
- Bundled generic AI-generated campus and library imagery in `assets/images/`; did not use Roveia's proprietary images, logos or written case studies.
- Added `js/roveia-motion.js` for scroll reveals, staggered entrance, FAQ single-open behaviour and accessible mobile navigation close behaviour. CSS respects `prefers-reduced-motion`.
- Homepage lead form still validates the required fields and uses the existing `FE.saveLead` mechanism. It displays an explicit demo notice because the code stores leads in browser `localStorage`, not in a server-side CRM/database.
- Rebuilt `ielts.html` to use the same graphite / warm-white / lime design system as the new homepage, including an editorial hero, sample computer-test visual, skill filters, paginated test groups, learning-mode cards, a three-step practice journey, FAQ and a clear final CTA. The page preserves existing test player routes and the three currently wired test IDs (`L-11-1`, `R-11-1`, `W-11-1`).
- Removed hard-coded IELTS user-count statistics and sample testimonials from the rebuilt IELTS page because they were not independently substantiated. Unavailable test sets are labelled as such instead of implying that they can be played.
- Kept the supplied IELTS, study-abroad, country, universities, scholarship, pricing, login, dashboard and admin routes in the package.

## IELTS page motion / transition count

The rebuilt IELTS page has **19 visible motion/interaction behaviour groups**. These are behaviour groups rather than a count of individual CSS declarations:

1. Sticky, blurred shared navigation.
2. Navigation underline animation for hover/active states.
3. Responsive mobile menu open/close motion, including Escape and link-close behaviour.
4. Continuously moving lime service strip that pauses on hover.
5. Slow hero photograph drift/zoom.
6. Sample interface card entrance animation.
7. Floating hero callout cards.
8. Scroll-triggered section reveals with staggered delays.
9. CTA/button lift and arrow movement.
10. Audience card lift, lime underline reveal and arrow movement.
11. Skill filter hover and active-state transitions.
12. Test card lift and lime underline reveal.
13. Saved-progress bar width transition.
14. Pagination hover and active-state styling.
15. Practice-interface perspective tilt on hover.
16. Practice-mode card lift and link-arrow movement.
17. Three-step process-line reveal on scroll.
18. FAQ icon rotation, single-open behaviour and answer entrance.
19. Final CTA link colour and arrow movement.

Reduced-motion preferences are respected by the shared theme and IELTS-specific CSS. These effects improve feedback and hierarchy, but they are not a substitute for testing on real devices.

## Academic IELTS player update

- Added Academic-only source tabs for Express demo content, Cambridge Academic (volumes 11–19) and Actual Tests (Academic). Cambridge/Actual entries are intentionally disabled until the owner supplies the underlying test data and has rights to use it.
- Added an original Express Academic Speaking practice session with three parts, cue-card preparation, browser microphone recording, playback/download, and autosaved self-review notes.
- Reworked the test player into a two-pane desktop layout for Reading, Listening, Writing Task 1/2, and Speaking. On narrow screens the panes stack vertically.
- Fixed True/False/Not Given options in the sample Reading set; answer navigation and objective answer review work against the bundled original questions.
- Writing Task 1 now has an original sample transport table and a separate Task 2 prompt. Text drafts are autosaved to this browser's local storage.
- Listening uses browser speech synthesis for the original demo script; it is not an official recording. Writing and Speaking do not return an automatic band estimate because no validated AI/scoring service is connected. Speaking audio remains in page memory unless the user downloads it.
- Updated `tests.html` and `speaking-ai.html` so their routes lead to the same Academic-only experience. Added a link to the external LexiBot Writing Checker.

## Validation performed

- `node --check js/app.js`
- `node --check js/roveia-motion.js`
- `node --check js/tests-data.js`
- `node --check js/ielts-player.js`
- Inline JavaScript syntax checks for the rebuilt IELTS page
- Checked the rebuilt IELTS page has one HTML root/head/body, no duplicate IDs, no legacy nested document, no old `lx-` page classes, and no missing relative links
- Verified all five available IELTS demo IDs exist in `js/tests-data.js`
- Checked `ielts.html`, `test.html`, `tests.html` and `speaking-ai.html` for a single document structure, duplicate IDs and unresolved local asset links
- Verified the IELTS routes contain no General Training links/cards
- Full browser screenshot and interaction testing was attempted, but Chromium navigation was blocked by the environment policy; this is not claimed as a browser-tested build

A real browser interaction screenshot pass could not run in this container because Chromium navigation was blocked by the environment's administrator policy. Please run the site locally and review the result at desktop, tablet and phone widths before deployment.

## Production limitations

This is still a static front-end demo, not a production backend or security review:

- Homepage leads and demo data are kept in the visitor's own browser and are not sent to your team.
- Login/session/admin controls in the original project are client-side, and demo credentials/data in browser JavaScript are not suitable for private student records.
- Destination-card photography uses remote Unsplash URLs in `js/app.js`; those cards need internet access. The hero and CTA photographs are bundled locally.
- Google Fonts is remotely loaded with system fallbacks. If full offline operation is needed, bundle properly licensed font files.
- Existing claims in legacy pages and sample datasets were inherited from the supplied project and have not been independently verified. Confirm them before publishing.

## Design/source notes

See [`SOURCES.md`](SOURCES.md) for specific design and image references. Reference site: <https://www.roveia.com/>.
