/** @format */

import React, { useEffect, useRef, useState } from "react";
import { Modal, Slider, message, Progress } from "antd";

const DISPLAY_MAX_WIDTH = 480;
const MAX_OUTPUT_SIZE_MB = 25;

let ffmpegInstance = null;
let ffmpegLoadPromise = null;

// ffmpeg.wasm (~25-30MB) is only fetched the first time someone actually
// crops a video — not on initial page load — and is cached in memory for
// the rest of the session after that.
async function getFFmpeg(onProgress) {
  if (ffmpegInstance) return ffmpegInstance;

  if (!ffmpegLoadPromise) {
    ffmpegLoadPromise = (async () => {
      const { FFmpeg } = await import("@ffmpeg/ffmpeg");
      const { toBlobURL } = await import("@ffmpeg/util");

      const ffmpeg = new FFmpeg();
      const CORE_VERSION = "0.12.6";
      const baseURL = `https://unpkg.com/@ffmpeg/core@${CORE_VERSION}/dist/umd`;

      ffmpeg.on("progress", ({ progress }) => {
        if (onProgress) onProgress(Math.min(99, Math.round(progress * 100)));
      });

      await ffmpeg.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, "text/javascript"),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, "application/wasm"),
      });

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
export default function VideoCropModal({
  open,
  file,
  targetWidth,
  targetHeight,
  onCancel,
  onCropped,
}) {
  const videoRef = useRef(null);
  const [videoMeta, setVideoMeta] = useState(null);
  const [cropBox, setCropBox] = useState(null);
  const [zoom, setZoom] = useState(1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef({ x: 0, y: 0, boxX: 0, boxY: 0 });
  const [processing, setProcessing] = useState(false);
  const [stage, setStage] = useState(""); // "loading engine" | "processing"
  const [progress, setProgress] = useState(0);
  const [objectUrl, setObjectUrl] = useState(null);

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

  const handleZoomChange = (value) => {
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

  const handlePointerDown = (e) => {
    if (!cropBox) return;
    setDragging(true);
    const point = e.touches ? e.touches[0] : e;
    dragStart.current = { x: point.clientX, y: point.clientY, boxX: cropBox.x, boxY: cropBox.y };
  };

  const handlePointerMove = (e) => {
    if (!dragging || !cropBox || !videoMeta) return;
    const point = e.touches ? e.touches[0] : e;
    const dx = point.clientX - dragStart.current.x;
    const dy = point.clientY - dragStart.current.y;

    let x = dragStart.current.boxX + dx;
    let y = dragStart.current.boxY + dy;

    x = Math.max(0, Math.min(x, videoMeta.displayWidth - cropBox.width));
    y = Math.max(0, Math.min(y, videoMeta.displayHeight - cropBox.height));

    setCropBox((prev) => ({ ...prev, x, y }));
  };

  const handlePointerUp = () => setDragging(false);

  const handleApply = async () => {
    if (!cropBox || !videoMeta) return;

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

      if (!data || data.byteLength === 0) {
        message.error("Cropping produced an empty file — try a different video");
        setProcessing(false);
        return;
      }

      const blob = new Blob([data.buffer], { type: "video/mp4" });

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
      const isPlayable = await new Promise((resolve) => {
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
      destroyOnClose
      maskClosable={false}
    >
      {objectUrl && (
        <>
          <div
            style={{
              position: "relative",
              width: videoMeta?.displayWidth || DISPLAY_MAX_WIDTH,
              height: videoMeta?.displayHeight || 270,
              margin: "0 auto",
              background: "#000",
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
                  border: "2px solid #fff",
                  boxShadow: "0 0 0 2000px rgba(0,0,0,0.55)",
                  cursor: dragging ? "grabbing" : "grab",
                }}
              />
            )}
          </div>

          {videoMeta && !processing && (
            <div style={{ marginTop: 16, padding: "0 4px" }}>
              <span style={{ fontSize: 12, color: "#64748b" }}>Zoom</span>
              <Slider min={1} max={3} step={0.05} value={zoom} onChange={handleZoomChange} />
            </div>
          )}

          {processing && (
            <div style={{ marginTop: 16, padding: "0 4px" }}>
              <Progress percent={progress} status="active" />
              <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>{stage}</p>
            </div>
          )}

          {!processing && (
            <p style={{ fontSize: 12, color: "#94a3b8", marginTop: 8 }}>
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