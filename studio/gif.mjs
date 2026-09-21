/**
 * GIF playback timing, without decoding a single pixel.
 *
 * A GIF's speed is baked into the file: every frame carries its own delay, in
 * hundredths of a second, in a Graphic Control Extension, and whether it loops
 * is a NETSCAPE2.0 application extension. Both live outside the compressed
 * pixel data, so a 15 MB screen recording is retimed by rewriting a few
 * hundred bytes and copying the rest through untouched — which is also why
 * the browser can't do this: an <img> plays a GIF at the file's own pace.
 *
 * The first time a file is retimed, the recording's original delays are
 * written into a comment extension. Every later speed is computed from those,
 * not from the current delays, so 2× then 3× then back to 1× lands on exactly
 * the bytes the recording had. The Studio keeps the chosen speed in the JSON
 * (`speed` beside the image's `src`) and asks `retimeGif` to make the file
 * match on every save; a file that already matches is left alone.
 */

/** Marks the comment that holds the original delays. */
const COMMENT_TAG = "rb-gif-timing v1";

/**
 * Browsers substitute 10 cs for any delay of 0 or 1 cs (Chromium, Gecko and
 * WebKit all do), so 2 cs is the fastest a frame can really be shown, and a
 * recording that says 0 or 1 actually plays at 10.
 */
export const MIN_DELAY_CS = 2;
const SLOW_SUBSTITUTE_CS = 10;
const MAX_DELAY_CS = 0xffff;

/** Loop forever is what "GIFs loop on the site" means in NETSCAPE2.0 terms. */
const LOOP_FOREVER = 0;

const NETSCAPE_ID = Buffer.from("NETSCAPE2.0", "ascii");

/* ------------------------------------------------------------ parsing --- */

/** The delay a browser actually uses for a frame the file times at `raw`. */
export function effectiveDelay(raw) {
  return raw < MIN_DELAY_CS ? SLOW_SUBSTITUTE_CS : raw;
}

/** The delay to write so a frame recorded at `raw` plays `speed` times faster. */
export function delayAt(raw, speed) {
  if (speed === 1) return raw; // byte-for-byte what the recording had
  const scaled = Math.round(effectiveDelay(raw) / speed);
  return Math.min(MAX_DELAY_CS, Math.max(MIN_DELAY_CS, scaled));
}

function colorTableBytes(packed) {
  return packed & 0x80 ? 3 * (1 << ((packed & 7) + 1)) : 0;
}

/** Concatenates a run of data sub-blocks starting at `p`; returns the bytes and where the run ends. */
function readSubBlocks(buf, p) {
  const parts = [];
  while (p < buf.length && buf[p] !== 0) {
    parts.push(buf.subarray(p + 1, p + 1 + buf[p]));
    p += buf[p] + 1;
  }
  return { data: Buffer.concat(parts), end: p + 1 };
}

/** Splits `data` into ≤255-byte sub-blocks and terminates the run. */
function writeSubBlocks(data) {
  const parts = [];
  for (let at = 0; at < data.length; at += 255) {
    const chunk = data.subarray(at, at + 255);
    parts.push(Buffer.from([chunk.length]), chunk);
  }
  parts.push(Buffer.from([0]));
  return Buffer.concat(parts);
}

/**
 * Walks the file once into a flat list of blocks, each with its byte range,
 * so a rewrite can copy every block it does not touch. Throws on anything
 * that is not a well-formed GIF.
 */
function parseGif(buf) {
  if (buf.length < 13 || buf.toString("ascii", 0, 3) !== "GIF") throw new Error("Not a GIF file.");
  const width = buf.readUInt16LE(6);
  const height = buf.readUInt16LE(8);

  let p = 13 + colorTableBytes(buf[10]);
  const headerEnd = p;
  const blocks = [];

  while (p < buf.length) {
    const start = p;
    const id = buf[p];

    if (id === 0x3b) {
      blocks.push({ type: "trailer", start, end: p + 1 });
      break;
    }

    if (id === 0x21) {
      const label = buf[p + 1];
      // Graphic Control Extension: fixed 4-byte block — packed, delay (LE16), transparent index — then a terminator.
      if (label === 0xf9 && buf[p + 2] === 4) {
        blocks.push({ type: "gce", start, end: p + 8, delay: buf.readUInt16LE(p + 4) });
        p += 8;
        continue;
      }
      const { data, end } = readSubBlocks(buf, p + 2);
      const block = { type: "extension", label, start, end };
      if (label === 0xff && data.subarray(0, 11).equals(NETSCAPE_ID)) {
        // Decoders only honour the loop when it is laid out exactly as the
        // spec has it: an 11-byte identifier block, then a 3-byte data block
        // (sub-id 1, count). Anything else is a loop block in name only.
        const wellFormed = buf[p + 2] === 11 && buf[p + 14] === 3 && data.length === 14 && data[11] === 1;
        block.type = "netscape";
        block.loop = wellFormed ? data.readUInt16LE(12) : null;
      } else if (label === 0xfe) {
        block.type = "comment";
        block.text = data.toString("latin1");
      }
      blocks.push(block);
      p = end;
      continue;
    }

    if (id === 0x2c) {
      p += 10 + colorTableBytes(buf[p + 9]) + 1; // descriptor, local colour table, LZW minimum code size
      p = readSubBlocks(buf, p).end;
      blocks.push({ type: "image", start, end: p });
      continue;
    }

    throw new Error(`Unexpected block 0x${id.toString(16)} at byte ${start}.`);
  }

  return { width, height, headerEnd, blocks };
}

/* ------------------------------------------------- the timing comment --- */

/** "8x369" for a steady recording, "8x10,12,8x5" when the delays vary. */
function encodeDelays(delays) {
  const runs = [];
  for (const delay of delays) {
    const last = runs[runs.length - 1];
    if (last && last.delay === delay) last.count += 1;
    else runs.push({ delay, count: 1 });
  }
  return runs.map((run) => (run.count === 1 ? `${run.delay}` : `${run.delay}x${run.count}`)).join(",");
}

function decodeDelays(text) {
  const delays = [];
  for (const run of text.split(",")) {
    const [delay, count = "1"] = run.split("x").map(Number);
    if (!Number.isInteger(delay) || !Number.isInteger(count) || count < 1) return null;
    for (let i = 0; i < count; i += 1) delays.push(delay);
  }
  return delays;
}

/** The original delays and the speed last applied, if this file has been retimed before. */
function readTiming(blocks) {
  for (const block of blocks) {
    if (block.type !== "comment" || !block.text.startsWith(COMMENT_TAG)) continue;
    const fields = Object.fromEntries(block.text.split(";").slice(1).map((pair) => pair.split("=")));
    const delays = fields.delays ? decodeDelays(fields.delays) : null;
    const speed = Number(fields.speed);
    if (delays && Number.isFinite(speed) && speed > 0) return { delays, speed };
  }
  return null;
}

function timingComment(delays, speed) {
  const text = `${COMMENT_TAG};speed=${speed};delays=${encodeDelays(delays)}`;
  return Buffer.concat([Buffer.from([0x21, 0xfe]), writeSubBlocks(Buffer.from(text, "latin1"))]);
}

/** Two sub-blocks, as the spec lays it out — decoders match on the 11-byte identifier block. */
function netscapeLoop(loop) {
  const data = Buffer.alloc(3);
  data[0] = 1;
  data.writeUInt16LE(loop, 1);
  return Buffer.concat([
    Buffer.from([0x21, 0xff, NETSCAPE_ID.length]), NETSCAPE_ID,
    Buffer.from([data.length]), data,
    Buffer.from([0])
  ]);
}

/* ---------------------------------------------------------------- api --- */

/**
 * Reads the file's shape and timing. `original` are the recording's delays
 * (from the comment when the file has been retimed, else the frames as they
 * are); `speed` is what was last applied to it.
 */
export function inspectGif(buf) {
  const { width, height, blocks } = parseGif(buf);
  const frames = blocks.filter((block) => block.type === "gce").map((block) => block.delay);
  const stored = readTiming(blocks);
  const original = stored && stored.delays.length === frames.length ? stored.delays : frames;
  const loop = blocks.find((block) => block.type === "netscape")?.loop ?? null;
  const fastest = Math.min(...original.map(effectiveDelay));

  return {
    width,
    height,
    frames: blocks.filter((block) => block.type === "image").length,
    loop,
    loops: loop === LOOP_FOREVER,
    speed: stored?.speed ?? 1,
    original,
    /** Past this the shortest frame would drop under the 2 cs the browser honours. */
    maxSpeed: original.length === 0 ? 1 : Math.max(1, Math.floor((fastest / MIN_DELAY_CS) * 4) / 4)
  };
}

/** The whole clip's length and frame rate once every frame is timed for `speed`. */
export function timingAt(original, speed) {
  const durationCs = original.reduce((sum, raw) => sum + effectiveDelay(delayAt(raw, speed)), 0);
  return {
    speed,
    durationCs,
    fps: original.length > 0 && durationCs > 0 ? (original.length * 100) / durationCs : 0
  };
}

/**
 * Returns the bytes of `buf` retimed to play `speed` times faster than the
 * recording and looping forever, plus whether anything actually changed. When
 * the file already reads that way the original buffer comes back untouched,
 * so a save that didn't move the slider never rewrites a 15 MB file.
 */
export function retimeGif(buf, speed) {
  if (!Number.isFinite(speed) || speed <= 0) throw new Error("Speed must be a positive number.");
  const { headerEnd, blocks } = parseGif(buf);

  const gces = blocks.filter((block) => block.type === "gce");
  const stored = readTiming(blocks);
  const original = stored && stored.delays.length === gces.length ? stored.delays : gces.map((block) => block.delay);
  const target = original.map((raw) => delayAt(raw, speed));

  const timed = gces.every((block, index) => block.delay === target[index]);
  const loops = blocks.some((block) => block.type === "netscape" && block.loop === LOOP_FOREVER);
  const tagged = stored ? stored.speed === speed : speed === 1; // an untouched 1× file needs no comment
  if (timed && loops && tagged) return { buffer: buf, changed: false };

  // Header and global colour table, then one loop extension and the timing
  // comment ahead of the first frame, then every block in its original order
  // — minus any loop extension or timing comment that was already there.
  const parts = [buf.subarray(0, headerEnd), netscapeLoop(LOOP_FOREVER), timingComment(original, speed)];
  let frame = 0;
  for (const block of blocks) {
    if (block.type === "netscape") continue;
    if (block.type === "comment" && block.text.startsWith(COMMENT_TAG)) continue;
    if (block.type === "gce") {
      const gce = Buffer.from(buf.subarray(block.start, block.end));
      gce.writeUInt16LE(target[frame], 4);
      frame += 1;
      parts.push(gce);
      continue;
    }
    parts.push(buf.subarray(block.start, block.end));
  }

  return { buffer: Buffer.concat(parts), changed: true };
}
