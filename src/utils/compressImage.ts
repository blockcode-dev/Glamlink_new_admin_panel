import imageCompression from "browser-image-compression";
import compressionLibPath from "browser-image-compression/dist/browser-image-compression.js?url";

// The compression worker loads the library with importScripts(), by default from the
// jsdelivr CDN. Point it at the copy in our build instead; a blob worker needs an absolute URL.
const compressionLibURL = new URL(compressionLibPath, window.location.href).href;

/** Shrinks a photo to at most 2000 px and about 2 MB before it is cropped or uploaded. */
export const compressImage = (file: File) =>
  imageCompression(file, {
    maxSizeMB: 2,
    maxWidthOrHeight: 2000,
    useWebWorker: true,
    libURL: compressionLibURL,
  });
