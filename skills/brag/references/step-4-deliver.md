# Step 4: Validate, render, and deliver

## Validate

```bash
cd <output-dir>/composition
npx hyperframes check   # brag's single pre-render gate — fix every error it reports
```

Fix all errors. `check` is brag's single pre-render gate — run it and fix everything it reports, including WCAG contrast failures (they gate as errors, not warnings). Each contrast finding carries a suggested compliant color, so apply it or adjust within the palette family and re-run `check` — most fixes need no screenshot. There is no per-element contrast escape hatch for real text; the only bypass is `check --no-contrast`, which skips the entire WCAG pass (all-or-nothing), not a way to accept one borderline element. For exact contrast thresholds, layout escape hatches, and reporting details, follow the current hyperframes-cli `check` guidance. `check`'s layout pass backstops the "keep all text readable" creative law — fix any reported overflow.

For a visual gut-check before rendering, optionally capture key frames:

```bash
npx hyperframes snapshot   # PNG key frames
```

## Preview

```bash
npx hyperframes preview
```

Tell the user the preview is running and give them the localhost URL. Invite them to check it before rendering.

If the user approves or asks to render:

## Render

```bash
npx hyperframes render --output ../brag.mp4
```

This outputs to `<output-dir>/brag.mp4` (one level up from the composition directory).

For a faster iteration render:
```bash
npx hyperframes render --quality draft --output ../brag.mp4
```

For final delivery:
```bash
npx hyperframes render --quality high --output ../brag.mp4
```

## Pick the poster frame

The poster is the still shown before the video plays — the first thing anyone sees when it's idle or unplayed. Don't leave it to the raw first frame or an arbitrary timestamp; those land on fades, mid-transitions, blank intro backgrounds, or half-rendered text.

You built this composition, so you already know its strongest moment and exactly when it lands — the hook line, the hero reveal, or the final logo. Pick that beat at a **settled** point: text fully animated in, before it exits (the storyboard timings tell you the safe window). Then extract that one frame full-res with ffmpeg. From `<output-dir>/composition`:

```bash
# use the timestamp of your strongest settled beat, e.g. 3.2s
ffmpeg -ss 3.2 -i ../brag.mp4 -frames:v 1 -q:v 2 ../brag.jpg
```

Aim for a frame that's postable on its own (the "show the thing" law — any frozen frame should be shareable). If the pulled frame lands on a transition or mid-animation, nudge the timestamp a few tenths of a second and re-extract.

### Bake the poster as frame 0

A bare `.mp4` has no `poster` attribute — every player and platform picks its own idle thumbnail, and almost all of them grab **frame 0**. Slack, Twitter/X, and Discord regenerate thumbnails server-side and ignore embedded cover-art metadata, so the *only* reliable way to control the idle image everywhere is to make frame 0 *be* the poster.

Replace **only** the first frame's pixels with `brag.jpg`, leaving every other frame and all timing untouched — same duration, same frame count, audio copied through. At 30fps the poster shows for 1/30s before the intro rolls, so it's imperceptible on playback but it's what every thumbnail grabber sees. From `<output-dir>`:

```bash
ffmpeg -y -i brag.mp4 -i brag.jpg \
  -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a copy -movflags +faststart brag.poster.mp4 \
  && mv brag.poster.mp4 brag.mp4
```

The poster (`brag.jpg`) matches the video's dimensions because it was pulled from the same render, so the overlay lines up exactly. Keep `brag.jpg` alongside — it's the custom-thumbnail asset for platforms that accept an upload (Instagram, TikTok, YouTube, Facebook, and the LinkedIn post editor) and the `poster="brag.jpg"` image for any `<video>` that embeds the brag (a gallery card, the user's site).

## Write share copy

Write `<output-dir>/share-copy.txt`.

The share copy should be:
- One to three sentences max
- Postable as-is to Twitter/X, LinkedIn, or Discord
- Specific to the project — no generic "excited to share" language
- Tone-matched to the brag video

`share-copy.txt` is the canonical single caption. Do not put multi-platform variants, long launch notes, or Product Hunt copy in this file.

If variants are useful, write them to a separate optional file:

```text
<output-dir>/share-copy-variants.md
```

### Share copy by tone

**`default`:**
```
Made [App Name]. It's [what it does, in the project's own absurd terms].
[The best line from the product.]
```

**`polished`:**
```
Introducing [App Name]: [clean one-liner from the site].
Built with [stack if notable].
```

**`yc-parody`:**
```
We built [App Name] to solve [problem stated completely seriously].
[Deadpan feature or stat.]
```

**`chaotic`:**
```
[ALL CAPS CLAIM].
[App Name] is [wildly overstated description].
Link below.
```

**`deadpan`:**
```
I made [App Name].
It [what it does].
```

**`cinematic`:**
```
[App Name].
[Tagline from the site, verbatim or lightly adapted.]
```

**`app-store`:**
```
[App Name] is now live.
[Feature 1], [Feature 2], and [Feature 3] — all in one place.
```

### Example: Taxi for Taxis

```
Every day, taxis carry us. But who carries the taxis?
Taxi for Taxis: the ride-hailing app for ride-hailing assets.
Available in 12 metros.
```

## README GIF (`--gif`)

A GIF is not a small video — it's a different deliverable with different physics: 256 colors, no audio, no seeking, no play button, and it loops forever in a page full of other people's text. `--gif` produces **both**: the `brag.mp4` (the real artifact) and `brag.gif` cut from it for the README. Never deliver only the GIF when the mp4 exists — the mp4 is what gets the link.

Do it after the render and poster steps, so the GIF is cut from the graded final.

### Cut a loop, not a summary

Don't downscale the whole 20 seconds. A README reader gives you one glance, so pick **one** beat — hook plus the single best highlight, or the moment the product actually does its thing — and cut 6–10 seconds of it. Length is the strongest lever on both file size and whether anyone watches to the end.

Pick the window from the storyboard timings: a settled start (no fade-in from black), running to just before the next cut, so the loop point lands on motion rather than on a jump.

### Encode

```bash
node <skill-dir>/scripts/make-gif.mjs <output-dir>/brag.mp4 \
  --out <output-dir>/brag.gif \
  --start <s> --duration 8
```

It defaults to 640px / 12fps / a 2MB budget and steps the quality down until it fits. Flags worth knowing: `--target-mb` (raise for a repo-committed asset you want bigger), `--width`, `--fps`, `--dry-run` to see the ffmpeg command, `--no-shrink` to force exact settings. It needs ffmpeg only — and uses gifsicle for an extra lossy pass if it's installed.

Budgets, from tightest to legal limit:

| Target | Use |
|---|---|
| ≤ 1MB | committed in the repo next to the README — the default ambition |
| ≤ 2MB | fine for a README, still fast on a bad connection |
| ≤ 10MB | GitHub's ceiling for images dragged into the editor |
| > 10MB | not a README asset; link to the video instead |

If the encoder walks the whole ladder and is still over budget, don't ship a blurry 320px GIF — shorten `--duration` or cut a flatter section.

Don't be tempted to skip the palette pass to save bytes: an undithered GIF of photo-heavy footage comes out about half the size and looks twice as broken (posterized darks, mottled gradients, mushy small type). The bytes are the price of the 256 colors being spent well.

### What to change in the edit for GIF

Tell Hyperframes these in the composition brief when `--gif` is set — they cost nothing in the mp4 and save the GIF:

- **Flatten big gradient areas.** A slow dark gradient is the classic GIF banding failure; 256 colors on a subtle ramp makes visible steps. A flat or noise-textured background survives.
- **Type one step bigger.** The GIF is displayed at 640px where the video was designed at 1920px: anything under ~18px at 640 is texture, not text. Keep the readable-copy law and scale it up.
- **Hard cuts over crossfades.** A crossfade is 2–3 frames at 12fps, which reads as a rendering artifact, not a transition. Cuts are free; dissolves look broken at low frame rates. (If a dissolve is essential, run it at 15fps.)
- **Higher contrast than you'd use in video.** GIF's limited palette eats soft grey-on-grey. The WCAG pass in `check` already protects you; don't undo it for the GIF.
- **Design the loop.** The last frame should flow into the first. The strongest README GIFs end where they began, so the loop reads as intentional rather than as a stutter.

### The GIF's first frame

The mp4 bakes a poster as frame 0 so platform thumbnails get it. A GIF needs the same thing for a different reason: the first frame is what's painted before the animation starts and what's left if the reader's connection stalls. So start the cut on a settled frame of the poster beat — usually the same timestamp you pulled `brag.jpg` at.

### Embed

Put the GIF where the README can find it, next to a link to the full version:

```md
<p align="center">
  <a href="<wherever the mp4 lives>" title="Watch the 20-second launch film">
    <img src="docs/brag.gif" alt="<one sentence describing what happens in the loop>" width="640">
  </a>
</p>
```

- The `alt` describes the motion, not the product ("The README rewriting itself in 4 seconds").
- `width` matters: the GIF is 640px wide, and without it a full-bleed image can dominate a README.
- Wrap it in a link to the mp4 or the live site — the GIF has no sound and the video is where the joke lands.

### GIF-mode delivery notes

- `share-copy.txt` is unchanged; a GIF caption is the same job.
- Tell the user the GIF's size alongside its path — "1.8MB, inside the 2MB README budget" is the number they care about.
- If they only want the GIF, still render the mp4: it's the source for the GIF, the poster, and the linked full version.

## Final output structure

After this step, `<output-dir>/` should contain:

```
<output-dir>/
  brag.mp4                — the rendered video
  brag.jpg                — the poster (best frame, for <video poster>)
  brag.gif                — README loop (only with --gif)
  brag-plan.md            — the plan and storyboard
  composition-brief.md    — the Hyperframes handoff brief
  share-copy.txt          — the share caption
  composition/            — the Hyperframes project
    index.html
    ...
```

## Telling the user

After everything is done, tell the user:
- Where the video is (`<output-dir>/brag.mp4`)
- With `--gif`: where the GIF is and how big it is (`<output-dir>/brag.gif`, e.g. 1.8MB), plus the paste-ready `<img>` line
- Where the share copy is
- One sentence on what the video does creatively
- Optionally: offer to re-roll a scene, change tone, or try a different angle
