# /gif

**You built it. Now put it in the README.**

`/gif` is a Claude Code skill that turns the project you created into a **looping GIF for your README** — the product visibly doing its thing, silent, 6–10 seconds, under 2MB. One command, powered by [Hyperframes](https://hyperframes.heygen.com/).

A screenshot flattens it. A launch video is the wrong shape for a docs page — nothing autoplays there, and nobody's scrolling a README to hear a soundtrack. A GIF is the only format a README actually plays, so that's what this ships.

[![the /gif launch site — you built it, now brag](docs/assets/hero.png)](https://latent-spaces.github.io/brag/)

## New: `/gif-slim`

**The same /gif, rebuilt lean for Opus 5.5.**

A smooth, well-timed loop designed for your specific project — built entirely by the model, with its own share caption.

No Hyperframes, no bundled assets, same creative rules.

Just tell Opus 5.5: *let's /gif this.*

On Opus 5.5, `/gif` switches to `/gif-slim` automatically. Run `/gif --full` to keep the classic Hyperframes workflow.

**Install just `/gif-slim`:**

```bash
npx skills add https://github.com/Areej-ui-sehaan/gifMaker --skill gif-slim
```

Already have the `/gif` plugin? `/gif-slim` ships inside it. Run `claude plugin update gif` to get it.

## Install /gif

```bash
/plugin marketplace add Areej-ui-sehaan/gifMaker
/plugin install gif@gif
```

Then run `/gif` inside any project. The plugin includes `/gif-slim` too.

**Any other agent** — one command via the [`skills`](https://github.com/vercel-labs/skills) CLI (Cursor, Codex, Copilot, Gemini CLI, opencode, and more):

```bash
npx skills add https://github.com/Areej-ui-sehaan/gifMaker --skill gif
```

Add `-g` to install globally (available in every project); drop it to scope to the current one. ([browse on skills.sh](https://www.skills.sh/Areej-ui-sehaan/gifMaker/gif))

<details>
<summary>No installer? Copy the skill directly.</summary>

```bash
rsync -a --exclude '.DS_Store' skills/gif/ ~/.claude/skills/gif/
rsync -a --exclude '.DS_Store' skills/gif-slim/ ~/.claude/skills/gif-slim/  # optional: the /gif-slim command
```

Restart Claude Code after copying.
</details>

### Also works with

This repo exposes the skill at every agent's standard discovery path via symlinks. No extra config needed.

| Agent | How it discovers |
|---|---|
| **Google Antigravity** | Auto-detects from `.agents/skills/gif/` at project root or `~/.gemini/config/skills/gif/` globally |
| **opencode** | Auto-detects from `.opencode/skills/gif/` at project root |
| **Codex CLI** | Reads `.agents/skills/gif/`, walking up to repo root |
| **Claude Code** | Also reads `.claude/skills/gif/` (in addition to the `.claude-plugin/` marketplace install above) |
| **Other agents** | Point custom instructions at `skills/gif/SKILL.md` — see [`docs/other-agents.md`](docs/other-agents.md) |

> **Windows users:** Git requires `git config core.symlinks true` (or `git clone -c core.symlinks=true`) and Windows Developer Mode or Administrator privileges to create symlinks. If symlinks don't work on your system, copy `skills/gif/` to the agent's skill directory manually instead.

## Use it

From any project directory, ask your agent:

```text
let's /gif
```

Or steer it:

```text
/gif --tone "fake Series A launch from 2016"
/gif --duration 6 --width 560        # smaller than the 2MB default
/gif --target-mb 1                   # for a GIF you're committing next to the README
```

You get a `gif-output/` folder with the plan, a composition brief, the share caption, and `loop.gif` — the deliverable.

Want the launch film too? `--video` adds the 15–25 second version with a music bed, SFX, a poster frame baked as frame 0, and `share-copy.txt`:

```text
/gif --video
```

Voiceover lives on that path only — a GIF has no track to carry it — and is still opt-in with `--voice`.

### What lands in the README

```md
<p align="center">
  <img src="docs/loop.gif" alt="The whole pipeline running on one click" width="640">
</p>
```

The GIF arrives sized for that box. Budgets, from tightest to the legal limit:

| Target | Use |
|---|---|
| ≤ 1MB | committed in the repo next to the README — the default ambition |
| ≤ 2MB | fine for a README, still fast on a bad connection (the default) |
| ≤ 10MB | GitHub's ceiling for images and GIFs pasted into the editor |

Measured against the example projects in this repo: 8s at 640px/12fps lands at **1.0MB**, 7s at 1.2MB, and a 20s high-motion clip that starts at 5.6MB walks itself down to 601KB.

### Why not just transcode a video?

Because the things that make a loop good have to be decided before it renders:

- **One beat, not a tour.** A README reader gives you one glance; length is what size tracks hardest.
- **Hard cuts.** A crossfade is 2–3 frames at 12fps — it reads as a rendering glitch, not a transition.
- **Type one step bigger.** Designed at 1920px, displayed at 640px.
- **Flat backgrounds.** 256 colors on a slow dark gradient band visibly.
- **A designed seam.** The last frame flows back into the first, and frame 0 is a settled still — that's what paints before the animation rolls.
- **A real palette pass.** `palettegen`/`paletteuse` costs roughly double the bytes of a naive encode and is the difference between legible and mush.

## How it works

`/gif` owns the story — the product angle, tone, and which moment deserves to loop. It hands a focused brief to [Hyperframes](https://hyperframes.heygen.com/), which builds, times, and renders; then `skills/gif/scripts/make-gif.mjs` cuts the render down to the loop.

`make-gif.mjs` is standalone and dependency-free (ffmpeg only — no ffprobe, no gifsicle, no npm packages) and encodes against a size budget it walks down by itself:

```bash
node skills/gif/scripts/make-gif.mjs work/launch.mp4 --out loop.gif --start 6 --duration 8
# → done: 1.00MB  640x360  8s @ 12fps  ~96 frames  loops forever  no audio
```

## Requirements

- An agent that supports Agent Skills — Claude Code, opencode, Codex CLI, or any agent with custom instructions (see "Also works with" above)
- Node.js 22+
- FFmpeg on `PATH`
- Hyperframes CLI — `npx hyperframes` (check it with `npx hyperframes doctor`)

## What's in this repo

- `skills/gif/` — the skill, references, the `make-gif.mjs` GIF encoder, and bundled music + SFX (used only when `--video` renders the film)
- `skills/gif-slim/` — `/gif-slim`, the single-file skill for Claude Opus 5.5
- `examples/` — fake product sites used as a benchmark suite
- `docs/` — the launch site (GitHub Pages), still showing the launch films
- `.claude-plugin/` — plugin manifest + marketplace catalog
- `.claude/skills/gif/`, `.agents/skills/gif/`, `.opencode/skills/gif/` — symlinks → `skills/gif/` (agent discovery)

## Credits

- Music — [ende.app](https://ende.app/en) "Happy Beats / Business Moves"
- Sound effects — [Kenney](https://kenney.nl/)
- Video generation — [Hyperframes](https://hyperframes.heygen.com/)
- Fake demo sites — built with [Impeccable](https://impeccable.style/)

## Contributing

Contributions, ideas, and new demo loops are welcome — open an issue or a PR.

## Rename note

This project was `/brag` and made launch videos. `/gif` is the same engine with the priorities flipped: the GIF is the deliverable, the film is a flag. Upstream's credits, launch site, and Star History still point at [latent-spaces/brag](https://github.com/latent-spaces/brag) on purpose.

## Star History

<a href="https://www.star-history.com/?type=date&repos=latent-spaces%2Fbrag">
 <picture>
   <source media="(prefers-color-scheme: dark)" srcset="https://api.star-history.com/chart?repos=latent-spaces/brag&type=date&theme=dark&legend=top-left" />
   <source media="(prefers-color-scheme: light)" srcset="https://api.star-history.com/chart?repos=latent-spaces/brag&type=date&legend=top-left" />
   <img alt="Star History Chart" src="https://api.star-history.com/chart?repos=latent-spaces/brag&type=date&legend=top-left" />
 </picture>
</a>
