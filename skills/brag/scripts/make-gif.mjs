#!/usr/bin/env node

// /brag — README GIF encoder.
//
// Turns a rendered brag.mp4 into a looping GIF small enough to live in a
// project README. If the first encode is over the size budget it walks down a
// quality ladder (width, then frame rate) until it fits. Needs ffmpeg on PATH
// only — no ffprobe, no gifsicle, no dependencies. gifsicle, if present, is
// used as an extra shrink pass.
//
//   node make-gif.mjs <input.mp4> [options]
//   node make-gif.mjs --help

import { spawnSync } from "node:child_process";
import { existsSync, renameSync, rmSync, statSync } from "node:fs";
import path from "node:path";

const USAGE = `Usage: node make-gif.mjs <input.mp4> [options]

  --out <path>       Output GIF. Default: brag.gif next to the input
  --width <px>       Target width. Default: 640
  --fps <n>          Frames per second. Default: 12
  --start <s>        Trim start, in seconds. Default: 0
  --duration <s>     Trim length, in seconds. Default: to the end
  --target-mb <mb>   Size budget; the encoder steps down until it fits. Default: 2
  --colors <n>       Palette size, 2-256. Default: 256
  --dither <mode>    none | bayer | sierra2_4a | floyd_steinberg. Default: bayer
  --lossy <n>        gifsicle --lossy amount, 0 to disable. Default: 60
  --no-shrink        Encode once at --width/--fps; never step down
  --dry-run          Print the commands, write nothing

Examples:
  node make-gif.mjs brag.mp4 --start 8 --duration 7      # hook + first highlight
  node make-gif.mjs brag.mp4 --width 800 --target-mb 4   # bigger, looser budget
  node make-gif.mjs brag.mp4 --out ../docs/brag.gif      # straight into the repo
`;

// Ladder rungs, best quality first. The walk only ever moves down this list,
// so it terminates. Widths stay <= 900px: a GitHub README column is ~896px
// wide, so anything larger is paid for in bytes and shown at the same size.
const RUNGS = [
  { width: 900, fps: 15 },
  { width: 900, fps: 12 },
  { width: 800, fps: 15 },
  { width: 800, fps: 12 },
  { width: 800, fps: 10 },
  { width: 640, fps: 15 },
  { width: 640, fps: 12 },
  { width: 640, fps: 10 },
  { width: 640, fps: 8 },
  { width: 560, fps: 12 },
  { width: 560, fps: 10 },
  { width: 480, fps: 12 },
  { width: 480, fps: 10 },
  { width: 480, fps: 8 },
  { width: 400, fps: 10 },
  { width: 400, fps: 8 },
  { width: 320, fps: 8 },
];

const DITHER_MODES = new Set(["none", "bayer", "sierra2_4a", "floyd_steinberg"]);

const args = process.argv.slice(2);
if (args.length === 0 || args.includes("--help") || args.includes("-h")) {
  console.log(USAGE.trim());
  process.exit(args.length === 0 ? 1 : 0);
}

const opts = {
  out: null,
  width: 640,
  fps: 12,
  start: 0,
  duration: null,
  targetMb: 2,
  colors: 256,
  dither: "bayer",
  lossy: 60,
  shrink: true,
  dryRun: false,
};

let input = null;

for (let i = 0; i < args.length; i += 1) {
  const arg = args[i];
  if (!arg.startsWith("--")) {
    if (input !== null) fail(`Unexpected argument: ${arg}`);
    input = arg;
    continue;
  }
  const key = arg.slice(2);
  switch (key) {
    case "out":
      opts.out = need(args, ++i, key);
      break;
    case "width":
      opts.width = positiveInt(need(args, ++i, key), key);
      break;
    case "fps":
      opts.fps = positiveInt(need(args, ++i, key), key);
      break;
    case "start":
      opts.start = nonNegative(number(need(args, ++i, key), key), key);
      break;
    case "duration":
      opts.duration = positiveInt(need(args, ++i, key), key);
      break;
    case "target-mb":
      opts.targetMb = nonNegative(number(need(args, ++i, key), key), key);
      break;
    case "colors": {
      const n = positiveInt(need(args, ++i, key), key);
      if (n < 2 || n > 256) fail("--colors must be between 2 and 256 — a GIF palette holds 256 colors, no more.");
      opts.colors = n;
      break;
    }
    case "dither": {
      const v = need(args, ++i, key);
      if (!DITHER_MODES.has(v)) fail(`--dither must be one of: ${[...DITHER_MODES].join(", ")}`);
      opts.dither = v;
      break;
    }
    case "lossy":
      opts.lossy = nonNegative(number(need(args, ++i, key), key), key);
      break;
    case "no-shrink":
      opts.shrink = false;
      break;
    case "dry-run":
      opts.dryRun = true;
      break;
    default:
      fail(`Unknown option: --${key}`);
  }
}

if (!input) fail("No input video given. See: node make-gif.mjs --help");
input = path.resolve(input);
if (!existsSync(input)) fail(`No such file: ${input}`);

const out = path.resolve(opts.out ?? path.join(path.dirname(input), "brag.gif"));
if (out === input) fail("--out must differ from the input video.");

const ffmpeg = process.env.FFMPEG || "ffmpeg";
if (!run(ffmpeg, ["-version"]).ok) {
  fail(
    `ffmpeg not found (tried "${ffmpeg}"). /brag needs FFmpeg on PATH:\n` +
      "  macOS: brew install ffmpeg     Debian/Ubuntu: sudo apt install ffmpeg\n" +
      "  Or point FFMPEG at a binary: FFMPEG=/path/to/ffmpeg node make-gif.mjs ...",
  );
}

const probe = probeVideo(input);
const gifsicle = findGifsicle();

if (opts.duration === null) {
  opts.duration = Math.max(1, Math.round(probe.duration - opts.start));
}
if (opts.start >= probe.duration) {
  fail(`--start ${opts.start}s is past the end of this ${fmt(probe.duration)}s video.`);
}
if (opts.start + opts.duration > probe.duration + 0.5) {
  const clamped = Math.max(1, Math.floor(probe.duration - opts.start));
  console.log(`note: --start ${opts.start}s + --duration ${opts.duration}s runs past the ${fmt(probe.duration)}s video — encoding ${clamped}s.`);
  opts.duration = clamped;
}

const budget = Math.round(opts.targetMb * 1024 * 1024);
const sourceSize = statSync(input).size;

console.log(
  `${path.basename(input)}  ${probe.width || "?"}x${probe.height || "?"}  ${fmt(probe.duration)}s  ${mb(sourceSize)}`,
);
console.log(
  `→ ${out}\n  trim: ${opts.start}s for ${opts.duration}s   budget: ${opts.targetMb}MB   shrink ladder: ${opts.shrink ? "on" : "off"}` +
    (gifsicle ? "" : "   (gifsicle not found — ffmpeg alone)"),
);

// Start at the best rung that is no larger than what was asked for, so the
// first encode honors --width/--fps and the walk only ever reduces.
let rung = opts.shrink ? startRung(opts.width, opts.fps) : { width: opts.width, fps: opts.fps };
if (opts.shrink && (rung.width !== opts.width || rung.fps !== opts.fps)) {
  console.log(
    `note: --width ${opts.width} / --fps ${opts.fps} is off the ladder — starting at ${rung.width}px / ${rung.fps}fps. Use --no-shrink for exact settings.`,
  );
}
let result = null;
let attempt = 0;

for (;;) {
  attempt += 1;
  if (attempt > 1) console.log(`  over budget — stepping down to ${rung.width}px / ${rung.fps}fps`);
  result = encode(rung);
  if (opts.dryRun) break;
  if (result.bytes <= budget) break;
  if (!opts.shrink) {
    console.log(
      `note: ${mb(result.bytes)} is over the ${opts.targetMb}MB budget. Drop --no-shrink to let it step down, or shorten --duration: length is what GIF size tracks hardest.`,
    );
    break;
  }
  const next = below(rung);
  if (!next) {
    console.log(
      `note: out of ladder at ${mb(result.bytes)}. A GIF this size means the clip is long or high-motion — the two things that fix it are a shorter --duration and a flatter background.`,
    );
    break;
  }
  rung = next;
}

if (opts.dryRun) process.exit(0);

const height = probe.width ? Math.round(((rung.width * probe.height) / probe.width) / 2) * 2 : 0;
const frames = Math.round(opts.duration * rung.fps);

console.log(
  `\ndone: ${mb(result.bytes)}   ${rung.width}x${height || "?"}   ${opts.duration}s @ ${rung.fps}fps   ~${frames} frames   loops forever   no audio`,
);
console.log(`\npaste into README.md:\n\n  ![<one-line description of what's on screen>](${displayPath(out)})\n`);
if (probe.hasAudio) {
  console.log(
    `tip: this clip has a soundtrack the GIF drops — wrap the image in a link to ${path.basename(input)} (or wherever it's hosted) so the sound is one click away.`,
  );
}

// ------------------------------------------------------------------ helpers

function encode(dimensions) {
  const { width, fps } = dimensions;
  // Two passes in one command: palettegen builds a palette from the whole
  // trimmed clip, paletteuse applies it. -2 keeps the height even so the
  // scaled image stays pixel-aligned.
  const filter = [
    `[0:v]fps=${fps},scale=${width}:-2:flags=lanczos,split[s0][s1]`,
    `[s0]palettegen=max_colors=${opts.colors}:stats_mode=full[p]`,
    `[s1][p]paletteuse=dither=${opts.dither}${opts.dither === "bayer" ? ":bayer_scale=5" : ""}:diff_mode=rectangle[v]`,
  ].join(";");

  const argv = [
    "-y",
    "-loglevel",
    "error",
    "-ss",
    String(opts.start),
    "-i",
    input,
    "-t",
    String(opts.duration),
    "-filter_complex",
    filter,
    "-map",
    "[v]",
    "-loop",
    "0",
    out,
  ];

  if (opts.dryRun) {
    console.log(`\n${[ffmpeg, ...argv].map(shellQuote).join(" ")}`);
    if (gifsicle && opts.lossy > 0) {
      console.log(`${gifsicle} -O3 --lossy=${opts.lossy} ${shellQuote(out)} -o ${shellQuote(out)}`);
    }
    return { bytes: 0 };
  }

  const enc = run(ffmpeg, argv);
  if (!enc.ok) fail(`ffmpeg failed while encoding:\n${enc.stderr.trim().slice(-2000)}`);
  if (!existsSync(out)) fail("ffmpeg exited cleanly but wrote no GIF.");

  let bytes = statSync(out).size;

  // Lossy GIF optimization, if gifsicle happens to be installed. Only keep the
  // result if it's actually smaller, so a bad run can never damage the output.
  if (gifsicle && opts.lossy > 0) {
    const tmp = `${out}.opt`;
    const shrink = run(gifsicle, ["-O3", `--lossy=${opts.lossy}`, out, "-o", tmp]);
    if (shrink.ok && existsSync(tmp) && statSync(tmp).size < bytes) {
      renameSync(tmp, out);
      bytes = statSync(out).size;
    } else if (existsSync(tmp)) {
      rmSync(tmp, { force: true });
    }
  }

  return { bytes };
}

function probeVideo(file) {
  // `ffmpeg -i` prints media info on stderr and exits non-zero; that's fine here.
  const text = run(ffmpeg, ["-i", file]).stderr;
  const duration = /Duration:\s*(\d+):(\d+):(\d+(?:\.\d+)?)/.exec(text);
  if (!duration) fail(`Could not read a duration from ${path.basename(file)}. Is it a video ffmpeg can open?`);
  // ffprobe isn't guaranteed to ship alongside ffmpeg, so the stream info is
  // read off this line instead. Only used for reporting and the height maths.
  const line = text.split("\n").find((l) => /:\s*Video:/.test(l));
  const dims = line ? /(\d{2,5})x(\d{2,5})/.exec(line) : null;
  const fps = line ? /(\d+(?:\.\d+)?)\s*fps/.exec(line) : null;
  return {
    hasAudio: /:\s*Audio:/.test(text),
    duration: Number(duration[1]) * 3600 + Number(duration[2]) * 60 + Number(duration[3]),
    width: dims ? Number(dims[1]) : 0,
    height: dims ? Number(dims[2]) : 0,
    fps: fps ? Number(fps[1]) : 0,
  };
}

function findGifsicle() {
  return run("gifsicle", ["--version"]).ok ? "gifsicle" : null;
}

function run(bin, argv) {
  const r = spawnSync(bin, argv, { encoding: "utf8", maxBuffer: 64 * 1024 * 1024 });
  if (r.error && r.error.code === "ENOENT") return { ok: false, stdout: "", stderr: "" };
  return { ok: r.status === 0, stdout: r.stdout ?? "", stderr: r.stderr ?? "" };
}

function startRung(width, fps) {
  const fits = RUNGS.filter((r) => r.width <= width && r.fps <= fps);
  if (fits.length) return fits[0];
  const byWidth = RUNGS.filter((r) => r.width <= width);
  if (byWidth.length) return byWidth[byWidth.length - 1];
  return RUNGS[RUNGS.length - 1];
}

function below(current) {
  const index = RUNGS.findIndex((r) => r.width === current.width && r.fps === current.fps);
  if (index === -1) return RUNGS[RUNGS.length - 1];
  return index < RUNGS.length - 1 ? RUNGS[index + 1] : null;
}

function displayPath(file) {
  const rel = path.relative(process.cwd(), file);
  if (rel && !rel.startsWith("..") && !path.isAbsolute(rel)) return rel.split(path.sep).join("/");
  return file.split(path.sep).join("/");
}

function mb(bytes) {
  if (bytes >= 1024 * 1024) return `${(bytes / 1048576).toFixed(2)}MB`;
  return `${Math.max(1, Math.round(bytes / 1024))}KB`;
}

function fmt(seconds) {
  return Number(seconds).toFixed(seconds >= 10 ? 1 : 2);
}

function shellQuote(value) {
  const s = String(value);
  return /[^A-Za-z0-9_@%+=:,./-]/.test(s) ? `'${s.replace(/'/g, `'\\''`)}'` : s;
}

function need(list, i, key) {
  const value = list[i];
  if (value === undefined || value.startsWith("--")) fail(`--${key} needs a value.`);
  return value;
}

function number(value, key) {
  const n = Number(value);
  if (!Number.isFinite(n)) fail(`--${key} must be a number.`);
  return n;
}

function positiveInt(value, key) {
  const n = Number(value);
  if (!Number.isFinite(n) || n <= 0) fail(`--${key} must be a positive number.`);
  return Math.round(n);
}

function nonNegative(value, key) {
  if (value < 0) fail(`--${key} must be 0 or greater.`);
  return value;
}

function fail(message) {
  console.error(`error: ${message}`);
  process.exit(1);
}
