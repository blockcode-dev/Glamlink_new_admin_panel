/** @format */

import React, { useEffect, useRef, useState } from "react";
import { Modal, Slider, message, Progress } from "antd";
import type { FFmpeg } from "@ffmpeg/ffmpeg";
// The ffmpeg core is a dependency, so it ships in our build instead of loading from a CDN
// at run time (its integrity is pinned by package-lock.json). These imports are only URLs.
import coreURL from "@ffmpeg/core?url";
import wasmURL from "@ffmpeg/core/wasm?url";

const DISPLAY_MAX_WIDTH = 480;
const MAX_OUTPUT_SIZE_MB = 25;

let ffmpegInstance: FFmpeg | null = null;
let ffmpegLoadPromise: Promise<FFmpeg> | null = null;

// ffmpeg.wasm (~25-30MB) is only fetched the first time someone actually
// crops a video — not on initial page load — and is cached in memory for
// the rest of the session after that.
async function getFFmpeg(onProgress?: (percent: number) => void): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;

  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");

      const ffmpeg = new FFmpeg();

      ffmpeg.on("progress", ({ progress }) => {
        if (onProgress) onProgress(Math.min(99, Math.round(progress * 100)));
      });

      // Vite runs ffmpeg's worker as a module worker; the "import" export of @ffmpeg/core is the ESM build it needs.
      await ffmpeg.load({ coreURL, wasmURL });

      ffmpegInstance = ffmpeg;
      return ffmpeg;
    })();
  }

  return ffmpegLoadPromise;
}

/**
 * VideoCropModal
 *
 * Admin drags/zooms a fixed-ratio crop box over the uploaded video, then
 * ffmpeg.wasm actually re-encodes just that cropped region into a real MP4
 * at the exact target size — this is a genuine video transcode running
 * entirely in the browser, not a canvas screen-recording trick.
 */
interface VideoCropModalProps {
  open: boolean;
  file: File | null;
  /** Output size in px; null/undefined until a slot with a fixed size is picked. */
  targetWidth?: number | null;
  targetHeight?: number | null;
  onCancel: () => void;
  onCropped: (file: File) => void;
}

interface VideoMeta {
  vw: number;
  vh: number;
  displayWidth: number;
  displayHeight: number;
  duration: number;
}

interface CropBox {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function VideoCropModal({
  open,
  file,
  targetWidth,
  targetHeight,
  onCancel,
  onCropped,
}: VideoCropModalProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [videoMeta, setVideoMeta] = useState<VideoMeta | null>(null);
  const [cropBox, setCropBox] = useState<CropBox | null>(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0 });
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(""); // "loading engine" | "processing"
  const [progress, setProgress] = useState(0);
  const [objectUrl, setObjectUrl] = useState<string | null>(null);

  const targetRatio = targetWidth && targetHeight ? targetWidth / targetHeight : 1;

  useEffect(() => {
    if (!open || !file) {
      setObjectUrl(null);
      return;
    }
    const url = URL.createObjectURL(file);
    setObjectUrl(url);
    return () => URL.revokeObjectURL(url);
  }, [open, file]);

  useEffect(() => {
    if (open) {
      setVideoMeta(null);
      setCropBox(null);
      setZoom(1);
      setProgress(0);
      setStage("");
    }
  }, [open, file]);

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    const vw = video.videoWidth;
    const vh = video.videoHeight;

    const displayScale = Math.min(DISPLAY_MAX_WIDTH / vw, 1);
    const displayWidth = vw * displayScale;
    const displayHeight = vh * displayScale;

    let boxW = displayWidth;
    let boxH = boxW / targetRatio;
    if (boxH > displayHeight) {
      boxH = displayHeight;
      boxW = boxH * targetRatio;
    }

    setVideoMeta({ vw, vh, displayWidth, displayHeight, duration: video.duration });
    setCropBox({
      x: (displayWidth - boxW) / 2,
      y: (displayHeight - boxH) / 2,
      width: boxW,
      height: boxH,
    });
    setZoom(1);
  };

  const handleZoomChange = (value: number) => {
    if (!videoMeta) return;
    setZoom(value);

    const maxBoxW = videoMeta.displayWidth;
    let boxW = maxBoxW / value;
    let boxH = boxW / targetRatio;
    if (boxH > videoMeta.displayHeight) {
      boxH = videoMeta.displayHeight;
      boxW = boxH * targetRatio;
    }

    setCropBox((prev) => {
      if (!prev) return prev;
      let x = prev.x + (prev.width - boxW) / 2;
      let y = prev.y + (prev.height - boxH) / 2;
      x = Math.max(0, Math.min(x, videoMeta.displayWidth - boxW));
      y = Math.max(0, Math.min(y, videoMeta.displayHeight - boxH));
      return { x, y, width: boxW, height: boxH };
    });
  };

  const handlePointerDown = (e: React.MouseEvent | React.TouchEvent) => {
    if (!cropBox) return;
    setDragging(true);
    const point = "touches" in e ? e.touches[0] : e;
    dragStart.current = { x: point.clientX, y: point.clientY, boxX: cropBox.x, boxY: cropBox.y };
  };

  const handlePointerMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!dragging || !cropBox || !videoMeta) return;
    const point = "touches" in e ? e.touches[0] : e;
    const dx = point.clientX - dragStart.current.x;
    const dy = point.clientY - dragStart.current.y;

    let x = dragStart.current.boxX + dx;
    let y = dragStart.current.boxY + dy;

    x = Math.max(0, Math.min(x, videoMeta.displayWidth - cropBox.width));
    y = Math.max(0, Math.min(y, videoMeta.displayHeight - cropBox.height));

    setCropBox((prev) => prev && { ...prev, x, y });
  };

  const handlePointerUp = () => setDragging(false);

  const handleApply = async () => {
    if (!cropBox || !videoMeta || !file) return;
    if (!targetWidth || !targetHeight) {
      // e.g. "Journal Listing In-Feed 2" has no fixed height, and ffmpeg can't scale to "null".
      message.error("This slot has no fixed video size to crop to");
      return;
    }

    // Hard rule: source video must not be longer than 60 seconds.
    if (videoMeta.duration > 60) {
      message.error(
        `Video must be under 60 seconds — yours is ${Math.round(videoMeta.duration)}s. Trim it first and try again.`,
      );
      return;
    }

    setProcessing(true);
    setStage("Loading video engine...");
    setProgress(0);

    try {
      const ffmpeg = await getFFmpeg((pct) => {
        setStage("Cropping video...");
        setProgress(pct);
      });

      const { fetchFile } = await import("@ffmpeg/util");

      const scaleToVideo = videoMeta.vw / videoMeta.displayWidth;
      // ffmpeg's crop filter needs even numbers for some encoders — round safely.
      const sx = Math.round(cropBox.x * scaleToVideo);
      const sy = Math.round(cropBox.y * scaleToVideo);
      const sWidth = Math.round(cropBox.width * scaleToVideo);
      const sHeight = Math.round(cropBox.height * scaleToVideo);

      // H.264's default pixel format (yuv420p) REQUIRES even width/height —
      // an odd dimension like 45px silently produces a broken/empty video
      // instead of a clear error. Round up by 1px when needed; this is the
      // actual encoded video's size (imperceptible), while the ad record
      // still stores the slot's intended target size.
      const encodeWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth + 1;
      const encodeHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight + 1;

      const inputName = "input" + (file.name.match(/\.[^.]+$/)?.[0] || ".mp4");
      const outputName = "output.mp4";

      await ffmpeg.writeFile(inputName, await fetchFile(file));

      setStage("Cropping video...");

      await ffmpeg.exec([
        "-i",
        inputName,
        "-vf",
        `crop=${sWidth}:${sHeight}:${sx}:${sy},scale=${encodeWidth}:${encodeHeight}`,
        "-an", // ad videos don't need audio; also keeps file size down
        "-c:v",
        "libx264",
        "-pix_fmt",
        "yuv420p",
        "-preset",
        "veryfast",
        "-movflags",
        "+faststart",
        outputName,
      ]);

      const data = await ffmpeg.readFile(outputName);

      if (!data || typeof data === "string" || data.byteLength === 0) {
        message.error("Cropping produced an empty file — try a different video");
        setProcessing(false);
        return;
      }

      // ffmpeg's worker transfers a plain ArrayBuffer back, never a SharedArrayBuffer.
      const blob = new Blob([data.buffer as ArrayBuffer], { type: "video/mp4" });

      if (blob.size / 1024 / 1024 > MAX_OUTPUT_SIZE_MB) {
        message.error(
          `The cropped video is still over ${MAX_OUTPUT_SIZE_MB}MB — try a shorter source clip.`,
        );
        setProcessing(false);
        return;
      }

      // Verify the output is actually a playable video before handing it
      // off — this is what catches a silent bad encode instead of passing
      // a broken file forward to be uploaded.
      const isPlayable = await new Promise<boolean>((resolve) => {
        const testUrl = URL.createObjectURL(blob);
        const testVideo = document.createElement("video");
        testVideo.preload = "metadata";
        testVideo.onloadedmetadata = () => {
          URL.revokeObjectURL(testUrl);
          resolve(testVideo.duration > 0 && !isNaN(testVideo.duration));
        };
        testVideo.onerror = () => {
          URL.revokeObjectURL(testUrl);
          resolve(false);
        };
        testVideo.src = testUrl;
      });

      if (!isPlayable) {
        message.error("The crop didn't produce a valid video — please try again or use a different source video");
        setProcessing(false);
        return;
      }

      const croppedFile = new File(
        [blob],
        (file.name || "ad-video").replace(/\.[^.]+$/, "") + "-cropped.mp4",
        { type: "video/mp4" },
      );

      // Clean up ffmpeg's virtual filesystem
      await ffmpeg.deleteFile(inputName).catch(() => {});
      await ffmpeg.deleteFile(outputName).catch(() => {});

      onCropped(croppedFile);
    } catch (err) {
      console.error(err);
      message.error("Couldn't crop the video — try a different file");
    } finally {
      setProcessing(false);
      setStage("");
      setProgress(0);
    }
  };

  return (
    <Modal
      title="Crop ad video"
      open={open}
      onCancel={onCancel}
      okText={processing ? "Processing..." : "Apply crop"}
      onOk={handleApply}
      okButtonProps={{ disabled: !cropBox || processing, loading: processing }}
      cancelButtonProps={{ disabled: processing }}
      width={560}
      destroyOnHidden
      mask={{ closable: false }}
    >
      {objectUrl && (
        <>
          <div
            style={{
              position: "relative",
              width: videoMeta?.displayWidth || DISPLAY_MAX_WIDTH,
              height: videoMeta?.displayHeight || 270,
              margin: "0 auto",
              background: "var(--color-media-bg)",
              userSelect: "none",
            }}
            onMouseMove={handlePointerMove}
            onMouseUp={handlePointerUp}
            onMouseLeave={handlePointerUp}
            onTouchMove={handlePointerMove}
            onTouchEnd={handlePointerUp}
          >
            <video
              ref={videoRef}
              src={objectUrl}
              onLoadedMetadata={handleLoadedMetadata}
              muted
              playsInline
              style={{ width: "100%", height: "100%", display: "block" }}
            />

            {cropBox && !processing && (
              <div
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
                style={{
                  position: "absolute",
                  left: cropBox.x,
                  top: cropBox.y,
                  width: cropBox.width,
                  height: cropBox.height,
                  border: "2px solid var(--color-surface)",
                  boxShadow: "0 0 0 2000px var(--color-shadow-strong)",
                  cursor: dragging ? "grabbing" : "grab",
                }}
              />
            )}
          </div>

          {videoMeta && !processing && (
            <div style={{ marginTop: 16, padding: "0 4px" }}>
              <span style={{ fontSize: 12, color: "var(--color-text-secondary)" }}>Zoom</span>
              <Slider min={1} max={3} step={0.05} value={zoom} onChange={handleZoomChange} />
            </div>
          )}

          {processing && (
            <div style={{ marginTop: 16, padding: "0 4px" }}>
              <Progress percent={progress} status="active" />
              <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 4 }}>{stage}</p>
            </div>
          )}

          {!processing && (
            <p style={{ fontSize: 12, color: "var(--color-text-tertiary)", marginTop: 8 }}>
              Drag the box to choose which part of the video to keep. Output
              will be an MP4 at exactly {targetWidth} x {targetHeight}px.
              First-time cropping loads a video engine (~25MB) and may take a
              little longer.
            </p>
          )}
        </>
      )}
    </Modal>
  );
}