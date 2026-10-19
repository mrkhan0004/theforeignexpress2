# Design and asset sources

| Use | Specific source | Implementation note |
|---|---|---|
| Visual reference | https://www.roveia.com/ | The public homepage was reviewed for the large hero, proof/service strip, segmented audience cards, visual case/story blocks, services grid, three-step process, testimonials, FAQs and strong final CTA. The Foreign Express brand, information and routes remain in this build. |
| IELTS page design reference | https://www.roveia.com/ | The IELTS page uses the same broad editorial design language—large type, lime accent strip, card hierarchy, three-step process, FAQ and strong CTA—adapted for education tools. It does not reuse Roveia assets or copy its industry-specific content. |
| IELTS page feature illustration | `ielts.html` (CSS-drawn sample test UI) | A clearly labelled illustrative preview built from HTML/CSS; it is not a screenshot of official IELTS software. |
| Homepage hero photograph | `assets/images/campus-students.jpg` | AI-generated generic university-campus scene created for this project; bundled locally. It is not a Roveia image. |
| CTA/library photograph | `assets/images/library-study.jpg` | AI-generated generic university-library scene created for this project; bundled locally. It is not a Roveia image. |
| Destination card photography | `https://images.unsplash.com/photo-...` URLs assembled in `js/app.js` | Remote image CDN, not bundled. Internet access is needed and the current usage terms should be reviewed for the production context: https://unsplash.com/license |
| Fonts | https://fonts.google.com/ | Homepage uses DM Sans and Manrope via Google Fonts. Other supplied pages may retain references to Poppins/Inter; system fallbacks are available. |

No Roveia logos, photos, code, written health-brand case studies or health-marketing claims were copied into this package. The redesign follows the reference's broad visual structure and interaction patterns while using education-related content. The rebuilt IELTS page removes unsubstantiated usage counts and sample testimonials. Other legacy pages may still contain mock records or claims inherited from the original site; the site owner should verify those before production.

| IELTS functionality reference | https://ielts.lexiprep.com/ielts-online-test/cambridge-english-ielts-academic/ | Reviewed for Academic library organization, split-screen test practice, answer navigation, study modes and FAQ structure. This project uses original demo tasks and does not bundle reference-site question text/audio. |
| IELTS Actual Tests reference | https://ielts.lexiprep.com/ielts-online-test/actual-tests-academic/ | Reviewed for separate Actual Tests (Academic) collection. Listed cards remain disabled until authorised test content is supplied. |
| Academic skill-page references | https://ielts.lexiprep.com/ielts-online-test/listening-academic/ · https://ielts.lexiprep.com/ielts-online-test/reading-academic/ · https://ielts.lexiprep.com/ielts-online-test/writing-academic/ | Reviewed to map Listening, Reading, and Writing Academic entry points. |
| Speaking practice reference | https://www.lexibot.me/apps/speaking-practice/ | Reviewed for a separate Speaking-practice entry point. This build offers local browser recording and self-review, not an AI examiner. |
| External writing checker | https://www.lexibot.me/services/free-ielts-writing-score-checker/ | Linked as an external service; not reimplemented or represented as integrated into this static project. |
