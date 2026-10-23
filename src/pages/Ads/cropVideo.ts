// Crops and resizes a video in the browser with WebCodecs (through Mediabunny):
// the browser's own decoder and H.264 encoder do the work, often on the GPU, so
// no 32 MB ffmpeg.wasm download is needed. Mediabunny itself is loaded only when
// someone crops a video.

export interface CropRect {
  left: number;
  top: number;
  width: number;
  height: number;
}

/** Why a crop can't run here, or null when it can. */
export const cropUnsupportedReason = async (width: number, height: number): Promise<string | null> => {
  if (typeof VideoEncoder === "undefined") {
    return "This browser can't encode video. Use a current Chrome, Edge, Safari or Firefox.";
  }
  const { canEncodeVideo } = await import("mediabunny");
  return (await canEncodeVideo("avc", { width, height }))
    ? null
    : "This browser can't encode H.264 video at this size. Use a current Chrome, Edge or Safari.";
};

/**
 * `file` cropped to `crop` (in the video's display pixels) and scaled to exactly
 * width × height, as an H.264 MP4 without audio (ad slots play muted).
 */
export async function cropVideo(
  file: File,
  crop: CropRect,
  width: number,
  height: number,
  onProgress?: (percent: number) => void,
): Promise<Blob> {
  const { ALL_FORMATS, BlobSource, BufferTarget, Conversion, Input, Mp4OutputFormat, Output, QUALITY_HIGH } =
    await import("mediabunny");

  const input = new Input({ source: new BlobSource(file), formats: ALL_FORMATS });
  const target = new BufferTarget();
  // fastStart puts the index first, so the ad can start playing before it has fully downloaded.
  const output = new Output({ format: new Mp4OutputFormat({ fastStart: "in-memory" }), target });

  try {
    const conversion = await Conversion.init({
      input,
      output,
      video: {
        crop,
        width,
        height,
        fit: "fill", // the crop box already has the slot's aspect ratio
        codec: "avc",
        bitrate: QUALITY_HIGH,
        forceTranscode: true,
      },
      audio: { discard: true },
    });
    if (!conversion.isValid) {
      const reasons = conversion.discardedTracks.map((t) => t.reason).join(", ");
      throw new Error(`The video can't be converted here (${reasons || "no video track"}).`);
    }
    conversion.onProgress = (progress) => onProgress?.(Math.min(99, Math.round(progress * 100)));
    await conversion.execute();
  } finally {
    input.dispose();
  }

  if (!target.buffer) throw new Error("The conversion produced no file.");
  return new Blob([target.buffer], { type: "video/mp4" });
}
