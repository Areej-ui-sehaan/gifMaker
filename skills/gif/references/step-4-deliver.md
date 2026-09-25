# Step 4: Render, encode, and deliver

Everything here starts from one render. The GIF is the deliverable; the launch film is optional and lives behind `--video`.

## Validate

```bash
cd <output-dir>/composition
npx hyperframes check   # gif's single pre-render gate — fix every error it reports
```

Fix all errors. `check` is the single pre-render gate — run it and fix everything it reports, including WCAG contrast failures (they gate as errors, not warnings). Each contrast finding carries a suggested compliant color, so apply it or adjust within the palette family and re-run `check` — most fixes need no screenshot. There is no per-element contrast escape hatch for real text; the only bypass is `check --no-contrast`, which skips the entire WCAG pass (all-or-nothing), not a way to accept one borderline element. For exact contrast thresholds, layout escape hatches, and reporting details, follow the current hyperframes-cli `check` guidance. `check`'s layout pass backstops the "keep all text readable" creative law — fix any reported overflow.

Contrast matters twice over for a GIF: the 256-color encode eats soft grey-on-grey, so anything that squeaks past the WCAG pass at 1920px can turn unreadable at 640px.

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
npx hyperframes render --quality high --output ../work/launch.mp4
```

This writes `<output-dir>/work/launch.mp4` — the render that every deliverable is cut from. It stays in `work/` unless `--video` promotes it.

For a faster iteration render:
```bash
npx hyperframes render --quality draft --output ../work/launch.mp4
```

Do a draft pass first if you're unsure about the loop window — it's cheaper to judge a loop from a draft render than from stills.

## Encode the GIF

Cut the loop window planned in Step 2 out of the render:

```bash
node <skill-dir>/scripts/make-gif.mjs <output-dir>/work/launch.mp4 \
  --out <output-dir>/loop.gif \
  --start <s> --duration 8
```

It defaults to 640px / 12fps / a 2MB budget and steps the quality down (width, then frame rate) until the file fits. Flags worth knowing: `--target-mb` (raise for a repo-committed asset you want bigger), `--width`, `--fps`, `--colors`, `--dither`, `--dry-run` to print the ffmpeg command, `--no-shrink` to force exact settings. It needs ffmpeg only — and uses gifsicle for an extra lossy pass when that happens to be installed. Run `make-gif.mjs --help` for the full list.

Then look at it. Extract the first and last frames and check the seam:

```bash
ffmpeg -y -loglevel error -i <output-dir>/loop.gif -frames:v 1 /tmp/loop-first.png
```

If the seam jumps, move `--start` a few tenths and re-encode — don't ship a loop that stutters.

### Budgets, from tightest to legal limit

| Target | Use |
|---|---|
| ≤ 1MB | committed in the repo next to the README — the default ambition |
| ≤ 2MB | fine for a README, still fast on a bad connection |
| ≤ 10MB | GitHub's ceiling for images and GIFs pasted into the editor |
| > 10MB | not a README asset; link out instead |

If the encoder walks the whole ladder and is still over budget, don't ship a blurry 320px GIF — shorten `--duration` or cut a flatter section. Length is what GIF size tracks hardest.

Don't be tempted to skip the palette pass to save bytes: an undithered GIF of photo-heavy footage comes out about half the size and looks twice as broken (posterized darks, mottled gradients, mushy small type). `make-gif.mjs` runs `palettegen` and `paletteuse` for exactly this reason.

### What the GIF costs you, and how to plan around it

A GIF is not a small video: 256 colors, no audio, no seeking, no play button, and it loops forever in the middle of someone's documentation. What that means for the composition:

- **Flatten big gradient areas.** A slow dark gradient is the classic GIF banding failure. A flat or noise-textured background survives.
- **Type one step bigger.** The GIF is displayed at 640px where the video was designed at 1920px: anything under ~18px at 640 is texture, not text.
- **Hard cuts over crossfades.** A crossfade is 2–3 frames at 12fps, which reads as a rendering artifact, not a transition. Cuts are free; dissolves look broken at low frame rates. (If a dissolve is essential, run that encode at 15fps.)
- **Higher contrast than you'd use in video.** The WCAG pass in `check` already protects you; don't undo it for the GIF.
- **Design the loop.** The last frame should flow into the first. The strongest README loops end where they began, so the repetition reads as intentional.
- **Frame 0 is the still.** It's what paints before the animation rolls and what's left if the connection stalls. Start the cut on a settled frame of the poster beat — usually the same timestamp you'd pull `poster.jpg` at.

## Deliver the GIF

- Write `<output-dir>/share-copy.txt` (see below).
- Report the size alongside the path: "1.4MB, inside the 2MB README budget" is the number that matters here.
- Hand over the embed:

```md
<p align="center">
  <img src="docs/loop.gif" alt="<one sentence describing what happens in the loop>" width="640">
</p>
```

  - The `alt` describes the motion, not the product ("The README rewriting itself in 4 seconds").
  - `width` matters: the GIF is 640px wide, and without it a full-bleed image can dominate a README.
  - If the run used `--video`, wrap the image in a link to the film — the GIF has no sound, and the punchline often lands with it.

## With `--video`: the launch film

Only when the flag is set. This is the full-video delivery: poster, frame-0 bake, audio.

### Pick the poster frame

The poster is the still shown before the video plays — the first thing anyone sees when it's idle or unplayed. Don't leave it to the raw first frame or an arbitrary timestamp; those land on fades, mid-transitions, blank intro backgrounds, or half-rendered text.

You built this composition, so you already know its strongest moment and exactly when it lands — the hook line, the hero reveal, or the final logo. Pick that beat at a **settled** point: text fully animated in, before it exits (the storyboard timings tell you the safe window). Then extract that one frame full-res with ffmpeg. From `<output-dir>/composition`:

```bash
# use the timestamp of your strongest settled beat, e.g. 3.2s
ffmpeg -ss 3.2 -i ../work/launch.mp4 -frames:v 1 -q:v 2 ../poster.jpg
```

Aim for a frame that's postable on its own (the "show the thing" law — any frozen frame should be shareable). If the pulled frame lands on a transition or mid-animation, nudge the timestamp a few tenths of a second and re-extract.

### Bake the poster as frame 0

Promote the render to the output root, then replace **only** the first frame's pixels with `poster.jpg`, leaving every other frame and all timing untouched — same duration, same frame count, audio copied through. At 30fps the poster shows for 1/30s before the intro rolls, so it's imperceptible on playback but it's what every thumbnail grabber sees. From `<output-dir>`:

```bash
cp work/launch.mp4 launch.mp4
ffmpeg -y -i launch.mp4 -i poster.jpg \
  -filter_complex "[0:v][1:v]overlay=0:0:enable='eq(n,0)'[v]" \
  -map "[v]" -map 0:a? -c:v libx264 -crf 18 -preset slow -pix_fmt yuv420p \
  -c:a copy -movflags +faststart launch.poster.mp4 \
  && mv launch.poster.mp4 launch.mp4
```

A bare `.mp4` has no `poster` attribute — every player and platform picks its own idle thumbnail, and almost all of them grab **frame 0**. Slack, Twitter/X, and Discord regenerate thumbnails server-side and ignore embedded cover-art metadata, so the *only* reliable way to control the idle image everywhere is to make frame 0 *be* the poster.

Keep `poster.jpg` alongside — it's the custom-thumbnail asset for platforms that accept an upload (Instagram, TikTok, YouTube, Facebook, and the LinkedIn post editor) and the `poster="poster.jpg"` image for any `<video>` that embeds the film.

The audio rules in [audio.md](audio.md) apply to this file only; the GIF drops the mix whether it's good or not.

## Write share copy

Write `<output-dir>/share-copy.txt`.

The share copy should be:
- One to three sentences max
- Postable as-is to Twitter/X, LinkedIn, or Discord
- Specific to the project — no generic "excited to share" language
- Tone-matched to the loop

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

## Final output structure

After this step, `<output-dir>/` should contain:

```
<output-dir>/
  loop.gif                — the deliverable: the README loop
  share-copy.txt          — the share caption
  gif-plan.md             — the plan and storyboard
  composition-brief.md    — the Hyperframes handoff brief
  work/
    launch.mp4            — the render the GIF was cut from
  composition/            — the Hyperframes project
    index.html
    ...
```

With `--video`, add:

```
  launch.mp4              — the full launch film, poster baked as frame 0
  poster.jpg              — the poster (best frame, for <video poster>)
```

## Telling the user

After everything is done, tell the user:
- Where the GIF is (`<output-dir>/loop.gif`) and how big it is — the size is the result, not a footnote
- The `![...]()` line they can paste, with the path they'd actually commit
- With `--video`: where the film and poster are (`<output-dir>/launch.mp4`, `poster.jpg`)
- Where the share copy is
- One sentence on what the loop does creatively
- Optionally: offer to re-roll a beat, change tone, or move the loop window
