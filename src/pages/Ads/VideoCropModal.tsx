/** @format */

import React, { useEffect, useRef, useState } from "react";
import { Modal, Slider, message, Progress } from "antd";
import { cropUnsupportedReason, cropVideo } from "./cropVideo";

const DISPLAY_MAX_WIDTH = 480;
const MAX_OUTPUT_SIZE_MB = 25;

/**
 * VideoCropModal
 *
 * Admin drags/zooms a fixed-ratio crop box over the uploaded video, then the
 * browser's own video encoder (WebCodecs, see cropVideo.ts) re-encodes just
 * that region into a real MP4 at the exact target size.
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
  const [stage, setStage] = useState("");
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
      // e.g. "Journal Listing In-Feed 2" has no fixed height, so there is no size to scale to.
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

    // H.264 (yuv420p) needs even dimensions; an odd one silently produces a broken
    // video. Round up by 1px when needed: imperceptible, and the ad record still
    // stores the slot's intended size.
    const encodeWidth = targetWidth % 2 === 0 ? targetWidth : targetWidth + 1;
    const encodeHeight = targetHeight % 2 === 0 ? targetHeight : targetHeight + 1;

    const unsupported = await cropUnsupportedReason(encodeWidth, encodeHeight);
    if (unsupported) {
      message.error(unsupported);
      return;
    }

    setProcessing(true);
    setStage("Cropping video...");
    setProgress(0);

    try {
      const scaleToVideo = videoMeta.vw / videoMeta.displayWidth;
      const blob = await cropVideo(
        file,
        {
          left: Math.round(cropBox.x * scaleToVideo),
          top: Math.round(cropBox.y * scaleToVideo),
          width: Math.round(cropBox.width * scaleToVideo),
          height: Math.round(cropBox.height * scaleToVideo),
        },
        encodeWidth,
        encodeHeight,
        setProgress,
      );

      if (blob.size === 0) {
        message.error("Cropping produced an empty file — try a different video");
        return;
      }

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
            </p>
          )}
        </>
      )}
    </Modal>
  );
}