---
name: gif-slim
description: Turn a project directory or a website URL into a looping GIF for your README — the product visibly doing its thing, silent, sized to fit a docs page. Built entirely by the model with the tools already on the machine; one file, no bundled assets. Optionally renders the full launch video with a soundtrack. Use when someone says "/gif-slim", "make a gif for my README", "gif this", "turn this into a gif", or wants to show off what they built. If the /gif skill is also installed, let /gif handle those phrases; it hands off here on Opus 5.5.
---

# /gif-slim

You built it. Now put it in the README — and make the whole loop yourself: story, visuals, encode, everything — with whatever tools are on the machine.

A GIF is the format a README actually plays: no controls, no sound, no click to start, and it loops forever in the middle of someone's docs. Whatever the tone, the result should look made, not generated: nothing on screen that doesn't earn its place.

Usage: `/gif-slim [input] [options]`. Options (flags or plain language):

| Option | Default |
|---|---|
| `--tone <preset or freeform>` | inferred; `default` if nothing clearly fits |
| `--format landscape\|vertical\|square` | landscape (encoded at 640px wide; vertical 1080×1920, square 1080×1080 sources) |
| `--duration <s>` | about 8s, the length of the loop |
| `--width <px>` | 640 |
| `--mb <n>` | 2 — the GIF's size budget |
| `--video` | off; with it, also deliver the full launch film with a soundtrack |

Write the deliverables to `gif-output/` in the current directory (timestamped `gif-output-YYYY-MM-DD-HHmmss/` if it already exists). Keep every intermediate file (frames, the render, downloads, scripts, stems) in a `work/` subfolder inside it.

## 1. Inspect

First decide what the input is, then gather material from it. Only the source changes; everything from the questions below onward is the same for every input.

| Input | How to recognize it | Where the material comes from |
|---|---|---|
| Project | No input given, and the current directory is a project | The code |
| Website | An `http(s)://` URL, or a bare domain like `example.com` | The live site |

If the input matches no type, or there's no input and the current directory isn't a project, ask the user what to make a loop of.

### Project

Read the code: the main page, styles (exact colors and fonts), README, routes and key components. The best material is the product **in use** — find the one beat worth looping: entry → key action → result, compressed.

You have the source, so use it directly: import or render the project's real components, stylesheets, fonts, images and animations in the loop instead of rebuilding them.

### Website

Get the site as a visitor sees it. Many sites build their page with JavaScript, so a plain download can come back as an almost empty shell. If it does, load the page in a headless browser to get the rendered result. Dismiss cookie banners and other overlays, and scroll section by section, since content that animates in on scroll stays blank in a single full-page capture.

- **Copy:** headline, tagline, section headings, feature names, calls to action, testimonials. Also check the title, meta description and social-preview tags.
- **Identity:** exact colors from the site's CSS and the fonts it loads.
- **Visuals:** the logo, product screenshots, hero images, demo videos. Download the ones you'll use into `work/`.
- **Screenshots:** capture the page at the loop's aspect ratio to understand the layout. In the GIF, reuse the site's real markup, CSS and assets and animate those, rather than panning over flat screenshots.
- **The product in use:** check the demo videos, how-it-works sections and linked docs for the entry → key action → result flow.

### Then, for every input

Before planning, answer: What is it (one sentence)? Who is it for, and what does it do for them? What sets it apart? What's the most impressive or funniest claim? What's the visual hook? Which single UI moment should loop? What tone fits? What's the one-line caption for the README?

## 2. Plan

Write `gif-plan.md`: the angle, the hook, the one beat that carries the loop, the punchline, tone, visual identity, and a scene-by-scene storyboard with durations that sum to the target. Name the loop window explicitly — which seconds, where each line settles, and what the last frame flows back into.

If the user points at one part — a new version, a new feature, one angle — make this the focus of the loop.

**Shape (loop):** Hook (2–3s) → the product doing its thing (3–5s) → a beat that returns to the start (1–2s). A starting shape, not a template.

**Shape (`--video`):** Hook (2–3s) → Reveal (2–4s) → 2–3 sharp highlights → Punchline/outro (2–4s), 15–25 seconds.

## Creative laws

- **Short.** 6–10 seconds for the loop; 15–25 for a video. Length is the strongest lever on both file size and whether anyone watches to the end.
- **Silent.** Every idea has to land without sound and without a second viewing. If a beat only works with a music sting or narration, it's the wrong beat.
- **Clear to a stranger.** After one pass, someone who's never heard of it knows what it does, who it's for, and how to get it. Lead with that, not with how it's built.
- **The hook is everything.** You get one glance in a README. The first 2 seconds decide whether anyone stays. Plan it first.
- **Show the thing.** Reuse the real thing from the source — its UI, components, copy, images and animations — rather than re-creating it. Rebuild only what you can't reuse. Prefer the working app doing its job over a landing page describing it. Small illustrative UI text is fine (a filename, an "Exported" toast); invented claims, numbers, or testimonials are not. Never abstract filler.
- **Specific.** It must feel made for this exact project. Use its own copy and claims; no generic SaaS language ("streamline your workflow" is banned).
- **Readable at 640px.** Type one step bigger than you'd use in video. Any line the viewer is meant to read stays fully visible and settled long enough to read it (roughly 0.3s per word), counted from when the whole line is on screen. Text that's only texture doesn't need to be read.
- **Make it alive.** Things that appear one by one, simulated clicks, swipes, and typing beat static slides.
- **Hard cuts.** A crossfade is 2–3 frames at 12fps and reads as a rendering glitch, not a transition.
- **Design the loop.** End on motion that flows back into the first frame, and start on a settled frame — frame 0 is the still that paints before the GIF animates.
- **Flatten big gradients.** 256 colors on a slow dark ramp bands visibly. A flat or textured background survives.
- **Funny earns its place.** Humor comes from the project's own absurdity, not from trying.
- **Every frame postable.** Any frozen frame should be worth sharing.

## Tones

Presets are defaults; freeform direction ("fake Series A launch from 2016") refines or overrides them. In a short loop a tone is mostly pacing, type personality, and transition style — there's no room for setup.

| Tone | Feel | Pacing / transitions |
|---|---|---|
| `default` | Punchy, playful, clean | 2–3 beats in the loop; quick, clean cuts |
| `polished` | Serious, elegant, restrained | 1–2 beats, long holds; cuts through the background |
| `yc-parody` | Deadpan startup launch, played straight | 2–3 beats, one claim each; hard cuts |
| `chaotic` | FAST, LOUD, ALL CAPS | 4–5 beats, some under 1.5s; flash/zoom cuts |
| `deadpan` | Calm, dry, nothing is a joke | 1–2 beats, big empty space; slow, deliberate cuts |
| `cinematic` | Trailer-scale, epic claims | 2–3 beats, big type; dramatic wipes |
| `app-store` | Clean feature cards | 2–4 beats; smooth slides |

## Sound (`--video` only)

A GIF has no track, so audio exists here only when the launch film is requested. Write the music and sound effects as one piece: effects in the same key and the same space as the music, blended in rather than laid on top. Give it a basic, proper mix, the way a real track is mixed: effects sit softly under the music, nothing harsh or spiky, and repeated little sounds stay in the background.

## 3. Build, check, render

Build it with whatever works on this machine. If you draw the loop in a browser, make every frame a pure function of time and wait for fonts and images to load before capturing each one.

Before the full render, look at stills from every beat *and* from the loop point — first frame, last frame, side by side — and fix overflow, collisions, low contrast, and anything that makes the seam obvious. A plain crossfade between two busy layouts makes a muddy double exposure; stagger it (old content out, then new content in) or dip through the background. Then render to `work/launch.mp4`.

## 4. Deliver

- **Encode the GIF** from that render, cutting the planned window out of it:

  ```bash
  ffmpeg -y -ss <start> -t 8 -i work/launch.mp4 -filter_complex "[0:v]fps=12,scale=640:-2:flags=lanczos,split[s0][s1];[s0]palettegen=max_colors=256:stats_mode=full[p];[s1][p]paletteuse=dither=bayer:bayer_scale=5:diff_mode=rectangle[v]" -map "[v]" -loop 0 loop.gif
  ```

  Two passes in one command: `palettegen` reads the whole trimmed clip and builds the best 256-color palette, `paletteuse` applies it. Skip it and ffmpeg keeps the first 256 colors it happens to see: dark areas posterize, gradients go mottled, and small type turns to mush. The dithering costs bytes — expect roughly double a naive encode — and it is always worth it.

- **Land it under 2MB** (≤1MB if it's committed next to the README; 10MB is GitHub's ceiling). Over budget: shorten the clip first, then drop to `fps=10` or `scale=560`. Length is what GIF size tracks hardest.
- **`share-copy.txt`:** 1–3 sentences, postable as-is, specific, matching the tone. No "excited to share."
- **With `--video`:** copy the render to `launch.mp4`, pull the strongest *settled* frame (text fully in, not mid-transition) to `poster.jpg`, and bake it in as frame 0 of `launch.mp4` so every platform's thumbnail shows it. Replace frame 0 rather than adding a frame, so the duration and audio sync stay the same.
- **Tell the user** where `loop.gif` is and how big it is — "1.4MB, inside the 2MB README budget" is the number they care about — give one sentence on the creative angle, offer to re-roll a beat or try another tone, and hand them the embed:

  ```md
  <p align="center">
    <img src="docs/loop.gif" alt="<what happens in the loop>" width="640">
  </p>
  ```
