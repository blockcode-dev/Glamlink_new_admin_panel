/** @format */

import React, { useRef } from "react";
import ImgCrop from "antd-img-crop";
import { Upload, type UploadFile, type UploadProps } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import compressionLibPath from "browser-image-compression/dist/browser-image-compression.js?url";

// The compression worker loads the library with importScripts(), by default from the
// jsdelivr CDN. Point it at the copy in our build instead; a blob worker needs an absolute URL.
const compressionLibURL = new URL(compressionLibPath, window.location.href).href;

interface ImageCropModalProps {
  aspect?: number;
  fileList?: UploadFile[];
  /** Receives the whole new list after each add or remove. */
  setFileList?: (files: UploadFile[]) => void;
  maxCount?: number;
  multiple?: boolean;
  accept?: string;
  listType?: UploadProps["listType"];
  uploadText?: string;
}

// Upload + crop built on antd-img-crop (the app's single cropping library).
// Each picked image is compressed, cropped, then appended to `fileList` as
// { uid, name, status, url, originFileObj }.
const ImageCropModal = ({
  aspect = 1,
  fileList = [],
  setFileList,
  maxCount = 1,
  multiple = false,
  accept = ".jpg,.jpeg,.png,.webp",
  listType = "picture-card",
  uploadText = "Upload",
}: ImageCropModalProps) => {
  // Latest list, updated eagerly so several crops in a row each append
  // to the previous result even before the parent re-renders.
  const latest = useRef(fileList);
  latest.current = fileList;

  const compress = (file: File) =>
    imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
      libURL: compressionLibURL,
    });

  const addCropped: NonNullable<UploadProps["beforeUpload"]> = (file) => {
    const entry: UploadFile = {
      uid: Date.now().toString(),
      name: file.name,
      status: "done",
      url: URL.createObjectURL(file),
      originFileObj: file,
    };
    latest.current = multiple ? [...(latest.current || []), entry] : [entry];
    setFileList?.(latest.current);
    return Upload.LIST_IGNORE;
  };

  return (
    <ImgCrop
      aspect={aspect}
      quality={0.95}
      rotationSlider
      modalTitle="Crop Image"
      modalOk="Crop & Save"
      beforeCrop={compress}
    >
      {/* One image per pick: the crop modal handles a single file at a time. */}
      <Upload
        accept={accept}
        beforeUpload={addCropped}
        fileList={fileList || []}
        listType={listType}
        maxCount={maxCount}
        onRemove={(file) => {
          setFileList?.(
            (fileList || []).filter((item) => item.uid !== file.uid),
          );
        }}
      >
        {(maxCount > 1 || (fileList || []).length < maxCount) && (
          <div>
            <PlusOutlined />
            <div style={{ marginTop: 8 }}>{uploadText}</div>
          </div>
        )}
      </Upload>
    </ImgCrop>
  );
};

export default ImageCropModal;
