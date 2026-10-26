/**
 * Video for the Studio's file picker: an uploaded MP4 is compressed on the way
 * in, so a screen recording of several hundred megabytes lands in public/ as a
 * few, and gets the poster frame the site shows in its gallery grid
 * (`<name>.mp4.jpg`, see lib/media.ts).
 *
 * ffmpeg comes from the `ffmpeg-static` dev dependency, loaded only when a
 * video is uploaded, so the Studio still starts without it.
 */

import { spawn } from "node:child_process";
import { stat, copyFile } from "node:fs/promises";

/** The widest a video is kept; a wider one is scaled down, a narrower one is left alone. */
const MAX_WIDTH = 1920;
/** H.264 quality: higher is smaller. 28 is a clear screen recording at a fraction of the size. */
const CRF = 28;

let ffmpegPath;

async function ffmpeg() {
  if (ffmpegPath === undefined) {
    try {
      ffmpegPath = (await import("ffmpeg-static")).default || null;
    } catch {
      ffmpegPath = null;
    }
  }
  if (!ffmpegPath) throw new Error("ffmpeg isn't installed. Run `npm install`, then restart the Studio.");
  return ffmpegPath;
}

function run(binary, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(binary, args, { windowsHide: true });
    let tail = "";
    child.stderr.on("data", (chunk) => { tail = (tail + chunk).slice(-1500); });
    child.on("error", reject);
    child.on("close", (code) => (code === 0 ? resolve() : reject(new Error(`ffmpeg stopped (${code}): ${tail.trim().split("\n").pop()}`))));
  });
}

/**
 * Compresses `input` into `output` (H.264 + AAC, at most 1920 wide, metadata
 * up front so it plays before it finishes downloading). When that somehow came
 * out no smaller, the original is kept as it was.
 */
export async function compressVideo(input, output) {
  const binary = await ffmpeg();
  await run(binary, [
    "-y", "-v", "error", "-i", input,
    "-vf", `scale='min(${MAX_WIDTH},iw)':-2`,
    "-c:v", "libx264", "-preset", "medium", "-crf", String(CRF), "-pix_fmt", "yuv420p",
    "-c:a", "aac", "-b:a", "96k",
    "-movflags", "+faststart",
    output
  ]);
  const [before, after] = await Promise.all([stat(input), stat(output)]);
  if (after.size >= before.size) await copyFile(input, output);
}

/** One frame, a few seconds in (or the first frame of a shorter clip), as a 1280-wide JPEG. */
export async function posterFrame(video, poster) {
  const binary = await ffmpeg();
  const grab = (seek) => run(binary, ["-y", "-v", "error", "-ss", seek, "-i", video, "-frames:v", "1", "-vf", "scale='min(1280,iw)':-2", poster]);
  try {
    await grab("3");
    await stat(poster);
  } catch {
    await grab("0");
  }
}
