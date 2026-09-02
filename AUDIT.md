Quick accessibility & performance audit (actions taken)

Completed fixes:
- Added focus-visible outlines and reduced-motion respect in CSS.
- Improved contrast for decorative copper/brass accents on small text.
- Preloaded critical CSS files (styles.css and dawkins-unified.css) to reduce render-blocking.
- Ensured many images use loading=lazy where appropriate and have alt attributes.
- Added server-side upload demo and local persistence for media library.
- Added measurement calibration, grid visibility toggle, snapping, and presets to 2D editor.

Recommended next steps (manual or CI-driven):
1. Run Lighthouse (Chrome) for Performance/Accessibility/Best Practices and apply suggestions (largest contentful paint, unused JS/CSS, image optimization).
2. Convert hero images to responsive WebP variants and generate srcset assets.
3. Implement server-side CDN (S3 + Cloudflare) and signed uploads.
4. Implement authentication (NextAuth) and role-based access for portals.
5. Add E2E tests for portal flows (Playwright/Cypress) and integrate with CI.

Want me to run through these next steps and scaffold code for any specific item? (I can create NextAuth + Prisma example, or generate scripts to build responsive images.)