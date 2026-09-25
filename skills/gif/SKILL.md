---
name: gif
description: Turn the current project website or app into a looping GIF for your README using Hyperframes — the product visibly doing its thing, 6-10 seconds, sized to sit in a docs page. Optionally render the full launch video with music (--video). Use when someone says "/gif", "make a gif for my README", "gif this", "turn this into a gif", "screenshot but moving", or still says "/brag". Reads the project code directly — no live URL or screenshots needed.
---

# /gif

You built it. Now put it in the README — the product moving, not a frozen screenshot.

A GIF is the format a README actually plays: no controls, no sound, no click to start, and it loops forever in the middle of someone's documentation. That's the whole discipline of this skill — one beat, readable at a glance, small enough that nobody's page load suffers.

## Invocation dispatch (must happen first)

**Model check.** If you are Claude Opus 5.5 and the invocation doesn't ask for the full workflow (`--full`) or for voiceover (`--voice`, which gif-slim doesn't do), switch to gif-slim: read `<skill-dir>/slim.md` (the /gif-slim skill, bundled here) and follow it for the rest of this run instead of this file. Pass along the user's input, and pass any other options (`--video`, `--no-music`, `--title`, …) as plain-language direction. Tell the user in one line first, e.g. "You're on Opus 5.5, so I'm using /gif-slim: I build the whole loop myself. Say 'use the full workflow' to switch back." If you are any other model, or can't tell which model you are, skip this check.

**Legacy name.** If someone invokes `/brag`, run `/gif` and say so in the same breath — the video is a flag now, not the product.

Before inspecting the project, parse the complete invocation. If it contains `--voice`, set `voice.enabled = true` and enable it for that run only; never fall back to the no-voice workflow.

`/gif` turns the current project website or app into a looping GIF using Hyperframes. It is narrow, opinionated, and fun.

## What this skill does

1. Reads the current project code to understand the app.
2. Plans a short concept specific to this project — one beat that reads silently.
3. Scripts and storyboards the loop.
4. Hands a focused composition brief to Hyperframes.
5. Renders, encodes the GIF down to its size budget, and writes the caption.
6. With `--video`, also delivers the full launch video: poster frame baked as frame 0, music and SFX mixed in, share copy.

## Parsing the invocation

The user may invoke with natural language or flags:

```
/gif
/gif --tone chaotic
/gif --tone polished --duration 10
/gif --video                    (the GIF plus the 20s launch film)
/gif this. Make the loop feel like a ridiculous startup launch.
```

Parse these options:

| Option | Values | Default |
|---|---|---|
| `--tone` | preset or freeform description | inferred |
| `--format` | `landscape`, `vertical`, `square` | `landscape` |
| `--duration` | seconds of the loop | auto (6-10s) |
| `--width` | px of the encoded GIF | 640 |
| `--target-mb` | GIF size budget (MB) | 2 |
| `--video` | flag | off — render the launch video too |
| `--no-music` | flag | music on (`--video` only) |
| `--no-sfx` | flag | sfx on (`--video` only) |
| `--title` | string | inferred from project |
| `--voice` | flag | narration off (`--video` only) |

Tone can be a preset (`default`, `polished`, `yc-parody`, `chaotic`, `deadpan`, `cinematic`, `app-store`) or a creative direction such as "fake Series A launch from 2016", "museum exhibit", or "overproduced mobile game ad".

When the user gives freeform tone direction, map it to the nearest preset for pacing and structure, but preserve the user's direction in the plan and composition brief.

`--video` is the only route to audio: a GIF has no sound track, so music, SFX, and narration are all gated behind it. If the user asks for music, voiceover, or "the full thing" without the flag, enable `--video` and tell them in one line.

## The GIF is the deliverable

These rules outrank everything else in this file, and they are what makes the output different from a downscaled video:

- **One beat, 6–10 seconds.** Not the whole tour. Hook plus the moment the product actually does its thing. Length is the strongest lever on both file size and whether anyone watches to the end.
- **Silent.** Every idea has to land without sound, without a caption track, and without a second viewing.
- **Readable at 640px.** Anything you want read must survive that size — type one step bigger than you'd use in video.
- **Hard cuts, not dissolves.** A crossfade is 2–3 frames at 12fps: it reads as a rendering artifact, not a transition.
- **Design the loop.** The last frame should flow into the first. End on motion that returns to the opening, and the GIF reads as intentional instead of as a stutter.
- **Frame 0 is the still.** It's what paints before the animation rolls and what's left if the connection stalls. Start the loop on a settled frame of the strongest beat.
- **Flatten big gradients.** 256 colors on a slow dark ramp makes visible steps. A flat or textured background survives.
- **Stay under budget.** 2MB by default; ≤1MB if it's committed next to a README; 10MB is GitHub's ceiling for a pasted image. The encoder walks quality down until it fits — see `references/step-4-deliver.md`.

The video creative laws below still apply when `--video` is set.

## Output directory

By default, output goes to `gif-output/`. To avoid overwriting previous runs, use a timestamped directory:

```
gif-output-2026-05-04-143022/
```

Use a timestamp when:
- The user explicitly asks for a new run without overriding previous results
- A `gif-output/` directory already exists in the project

Generate the timestamp at the start of the run (`YYYY-MM-DD-HHmmss`) and use it consistently for all output paths in that run: plan, brief, composition, render, encode, and copy.

Everything intermediate — frames, the render, downloads, scripts, stems — goes in a `work/` subfolder inside the output directory, including `work/launch.mp4`, which is the source of the GIF and stays out of the way unless `--video` promotes it.

## Skill directory

`<skill-dir>` is the directory containing this `SKILL.md`. Claude Code prints it as "Base directory for this skill" when the skill loads; for other agents it's wherever the skill was installed. Bundled assets are under `<skill-dir>/assets/` and scripts under `<skill-dir>/scripts/`. Don't guess an install path: a plugin install, a `~/.claude/skills/` copy, and this repo all put it somewhere different.

---

## Step 1: Inspect the project

**Read:** [references/step-1-inspect.md](references/step-1-inspect.md)

Scan the project directory and extract the information needed to plan the loop.

**Gate:** You can answer all 9 questions in the planning rubric, and you can name the one beat worth looping.

---

## Step 2: Plan and storyboard

**Read:** [references/step-2-plan.md](references/step-2-plan.md)

Write `<output-dir>/gif-plan.md` (where `<output-dir>` is `gif-output/` or the timestamped variant chosen above). Answer the planning rubric. Commit to a creative angle. Write the beat-by-beat storyboard, including the loop window — the seconds that become the GIF — with its start and settle points marked.

When `--video` is set, also include a compact `Music cue guidance` section: read the bundled track's cue preset from `<skill-dir>/assets/music/cues/` if present, otherwise note cues will be detected at composition time (see `references/audio.md`). Cue metadata is optional timing guidance only: story, readability, pacing, and product clarity stay primary.

**Gate:** `<output-dir>/gif-plan.md` exists with a full storyboard and a named loop window. Loop 6–10 seconds; with `--video`, scenes sum to 15–25 seconds.

---

## Step 3: Hand off to Hyperframes

**Read:** The Hyperframes domain skills — `hyperframes-core`, `hyperframes-animation`, `hyperframes-creative`, `hyperframes-keyframes`, `hyperframes-cli`. /gif is its own workflow: do not enter the `hyperframes` entry-point intent interview or route into its generic promo / launch-video workflow.
**Read:** [references/step-3-compose.md](references/step-3-compose.md)
**Read:** [references/audio.md](references/audio.md) — only when `--video` is set.

Write the composition brief and use Hyperframes to create the composition implementation in `<output-dir>/composition/`.

`/gif` owns the product angle, source material, storyboard, tone, format, loop window, and delivery expectations. With `--video` it also owns audio selection and music cue guidance. Hyperframes owns the concrete composition structure, exact animation timing, animation mechanics, runtime choices, linting rules, and render workflow.

**Gate:** `npx hyperframes check` passes with zero errors inside `<output-dir>/composition/` (the single browser gate before render — see hyperframes-cli for what it audits).

---

## Step 4: Render, encode, and deliver

**Read:** [references/step-4-deliver.md](references/step-4-deliver.md)

Render to `<output-dir>/work/launch.mp4`, then cut the planned loop window out of it with `<skill-dir>/scripts/make-gif.mjs` into `<output-dir>/loop.gif`. Write `<output-dir>/share-copy.txt`.

With `--video`: also copy the render to `<output-dir>/launch.mp4`, pick the best poster frame into `<output-dir>/poster.jpg`, bake that poster as the video's frame 0 so it's the idle thumbnail everywhere, and keep the audio mix.

**Gate:** `<output-dir>/loop.gif` exists, is inside its size budget, and starts and ends on frames that loop cleanly. With `--video`: `<output-dir>/launch.mp4` exists, the best-frame poster `poster.jpg` is picked (not an arbitrary frame) and baked as frame 0. Share copy is written.

---

## Tone system

Seven tone presets ship with `/gif`. Each changes scripting energy, pacing, typography personality, and transition style. Presets are defaults, not limits.

Full definitions: [references/tones.md](references/tones.md)

| Tone | Energy | One-liner |
|---|---|---|
| `default` | Playful, clean, postable | The good-vibes default |
| `polished` | Serious, elegant | For projects that are not jokes |
| `yc-parody` | Deadpan startup energy | Fake seriousness applied to absurd projects |
| `chaotic` | Fast, loud, aggressive | Over-the-top and unhinged |
| `deadpan` | Calm, dry, understated | The joke is that nothing is a joke |
| `cinematic` | Dramatic, trailer-scale | Big motion, bigger claims |
| `app-store` | Smooth, feature-card clean | Corporate but not boring |

Always allow a freeform creative direction to refine or override the preset. In a 6–10 second loop, a tone is mostly pacing and transition style — there's no room for setup, so pick the tone by how the loop should *feel*, not how long it can talk.

---

## Creative laws

**Short.** The loop is 6–10 seconds. With `--video`, 15–25 seconds — not one second more without a reason.

**Readable.** Pace comes from motion and cuts, never from flashing text. Every line a viewer must read holds long enough to read it (short label ~0.8s settled; a sentence ~0.3s per word). Fast-in, then hold — never fast-in, then gone.

**Specific.** It must feel like it was made for this exact project, not any project.

**Show the thing.** At least one scene must display actual UI, copy, or a key visual from the product — and in a GIF, that scene is the loop. No abstract filler.

**No generic SaaS language.** "Streamline your workflow" is banned. Use the project's actual copy and claims.

**The hook is everything.** In a README you get one glance. Plan the first 2 seconds before anything else.

**Funny earns its place.** Humor comes from the project's absurdity, not from trying.

**Pattern (loop):**
```
Hook (2-3s) → the product doing its thing (3-5s) → a beat that returns to the start (1-2s)
```

**Pattern (--video):**
```
Hook (2-3s) → Reveal (2-4s) → 2-3 sharp highlights (5-12s) → Punchline/outro (2-4s)
```

Adapt these. Not every project needs exactly 3 highlights. The patterns are a starting shape, not a template.
