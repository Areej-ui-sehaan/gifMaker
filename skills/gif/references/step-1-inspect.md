# Step 1: Inspect the project

Read the project directory to understand what you're making a loop of.

## What to look for

Read these in priority order:

1. **`index.html`** — the primary source. Read the full file. Extract: page title, hero headline, tagline, all section headings, CTA text, testimonial copy, nav items. This is the voice and story of the app.

2. **`styles.css`** or equivalent — extract: primary color palette (look for CSS custom properties / `:root` vars), font families, background colors, accent colors. These become the visual identity of the loop.

3. **`README.md`** — if present, extract: project name, one-line description, any listed features.

4. **`package.json`** — if present, extract: `name`, `description`.

5. **Subdirectory files** — if this is a multi-page app, scan route files, component files, or page files. Extract key feature names and screen descriptions.

6. **The user flow / happy path** — scan beyond marketing pages. The GIF's strongest material is the product *in use*, not the product's marketing of itself. Look at:
   - **Routes** (`app/`, `pages/`, route files) — the screens beyond the landing page.
   - **Key feature components** — the upload form, the editor, the result view, the dashboard.
   - **State machines, stores, or step components** — how a session progresses.
   - **README "how it works" or "usage" sections** — the project's own description of the flow.
   - **Example or demo folders** — sample inputs and outputs the team tested with.

   Identify the 2–3 beats of *using* the product: **entry → key action → result.**

7. **`public/` or `assets/`** — note any images, logos, icons. These can be referenced in the composition.

## The 9-question rubric

After reading, answer all nine. Write these down before moving to Step 2.

```
1. What is the app?
   One sentence. What does it actually do (or claim to do)?

2. What is the funniest or most impressive claim?
   The one line from the site that earns a reaction.

3. What is the visual hook?
   The strongest CSS visual: a color palette moment, a UI element, a diagram, a card.

4. What should be shown from the actual UI?
   Which section of the site has the most loop-worthy content?
   (Hero? Feature section? The UI mockup? The working flow?)

5. Which one beat carries the loop?
   The GIF is 6-10 seconds: hook plus one thing the product does. Pick the
   beat that reads silently, in one pass, at 640px — and name roughly where it
   starts and settles. Anything that only works with a sting or narration is
   the wrong beat. With --video, this becomes "what's the shortest satisfying
   film?" (15s? 20?) and the extra beats come from Q9.

   (Audio direction is decided in Step 2, and only exists with --video.)

6. What tone fits best?
   If the user specified a preset, use it.
   If the user gave freeform direction, preserve it and map it to the nearest preset.
   If the user did not specify, infer both:
   - Tone preset: one of the known presets
   - Creative direction: a short custom phrase for this project
   Examples:
   - Absurd product → preset: yc-parody; direction: fake startup launch
   - Earnest product → preset: polished; direction: quiet premium product film
   - Chaotic product → preset: chaotic; direction: overproduced social ad

7. How does the loop get back to where it started?
   A GIF replays with no pause, so the seam is part of the design. Name the
   motion that can carry the last frame into the first — a cursor returning, a
   card sliding off the same edge it came from, a counter resetting. If the only
   available ending is a hard cut to black, say so: the plan then ends the
   window before it.

   Tone (Q6) decides pacing and transition style; in a 6-10 second loop pick it
   by how the loop should feel, not by how long it can talk. With --video, also
   decide the audio role here — bias toward a polished layer, music plus
   tasteful SFX, unless the user disabled them, assets are missing, or silence
   is the strongest choice (see audio.md).

8. What should the share caption say?
   Draft one sentence. This becomes share-copy.txt.

9. What's the user flow worth showing?
   The 2–3 beats a real user goes through: entry → key action → result.
   Not the landing page's section list — the working app.
   Examples:
   - Upload long video → see it processing with progress → see 3 vertical clips ready
   - Type a message → assistant types back → user clicks "mark resolved"
   - Swipe right on Thunder's profile → match animation → chat opens
   If the project is a landing-page-only static site with no app, write
   "none — landing-page only" and rely on the strongest visual (Q3) instead.
```

## Color extraction

When reading CSS, look for custom properties like:

```css
:root {
  --primary: oklch(...);
  --bg: oklch(...);
  --accent: ...;
}
```

If no custom properties exist, scan for the most-used colors in background, color, and border rules.

Write down:
- Background color (exact value)
- Primary text color
- Accent/brand color
- Any gradient or special treatment

These colors are recorded in `composition-brief.md` and carry into the design spec the current hyperframes-creative workflow scaffolds.

## Font extraction

Look for:
- `font-family` declarations in `:root` or `body`
- Google Fonts `<link>` in `<head>` (the font families are in the URL query string)
- `@import` statements

Write down the display font (used for headings) and the body font separately.

## What to skip

Don't read:
- Generated build artifacts (`dist/`, `.next/`, `build/`)
- Lock files (`package-lock.json`, `yarn.lock`)
- Test files
- `.git/`
- Environment and secret files (`.env`, `.env.*`)
- Credential and key material (`.pem`, `.key`, `id_rsa`, service-account JSON, anything under a `secrets/` or `credentials/` directory)
- Local config that commonly holds tokens
- Any file the project's `.gitignore` excludes for the reasons above

## Rule: nothing secret leaves this step

Everything read in this step can end up on screen in a GIF pasted into a public README. Never carry secrets, API keys, tokens, internal hostnames or URLs, real customer or user names, email addresses, or any personal data into `gif-plan.md`, `composition-brief.md`, the composition, the rendered film, the GIF, or share copy. If the product's real UI contains such data, substitute plausible fictional stand-ins and say so in the plan.

