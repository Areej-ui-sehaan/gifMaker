# Using /gif with other AI coding agents

Agents like **Cursor**, **Aider**, or any LLM with custom instructions don't have native `SKILL.md` discovery. Use one of these methods:

## Option 1: Paste into custom instructions

Open your agent's custom instructions or system prompt settings and paste the full contents of [`skills/gif/SKILL.md`](../skills/gif/SKILL.md).

## Option 2: Reference as a file path

If your agent supports loading instructions from a file, point it at:

```
path/to/skills/gif/SKILL.md
```

## Option 3: Copy the skill folder

Copy `skills/gif/` into wherever your agent looks for skill files:

```bash
cp -r skills/gif/ ~/.your-agent/skills/gif/
```

## Google Antigravity (AGY)

Antigravity natively discovers skills without manual pasting:
- **Project-level**: Symlink or copy `skills/gif/` to `.agents/skills/gif/` (or declare in `.agents/skills.json`).
- **Global-level**: Copy `skills/gif/` to `~/.gemini/config/skills/gif/` to make `/gif` accessible across all your projects.
- **Hyperframes companion skills**: Run `npx hyperframes skills` to ensure Hyperframes helper skills are installed to `~/.agents/skills` / `~/.gemini/config/skills`.

## Prerequisites

Regardless of method, the environment needs:
- **Node.js 22+**
- **FFmpeg** on `PATH`
- **Hyperframes CLI** — `npx hyperframes doctor` to verify
- **This repo cloned** (or `skills/gif/` accessible) for assets (reference docs, plus the music + SFX library the `--video` path scores from)
