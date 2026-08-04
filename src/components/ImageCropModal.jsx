/** @format */

import React, { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import { Modal, Upload, Slider, Button, Space } from "antd";
import { PlusOutlined } from "@ant-design/icons";
import imageCompression from "browser-image-compression";
import { getCroppedImg } from "../utils/getCroppedImg";

const ImageCropModal = ({
  aspect = 1,
  fileList = [],
  setFileList,
  maxCount = 1,
  multiple = false,
  accept = ".jpg,.jpeg,.png,.webp",
  listType = "picture-card",
  uploadText = "Upload",
}) => {
  const [open, setOpen] = useState(false);

  const [imageSrc, setImageSrc] = useState(null);

  const [crop, setCrop] = useState({
    x: 0,
    y: 0,
  });

  const [zoom, setZoom] = useState(1);

  const [rotation, setRotation] = useState(0);

  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);

  const [currentFileName, setCurrentFileName] = useState("image.jpg");

  const [loading, setLoading] = useState(false);

  const onCropComplete = useCallback((_, croppedPixels) => {
    setCroppedAreaPixels(croppedPixels);
  }, []);

  const beforeUpload = async (file) => {
    const compressed = await imageCompression(file, {
      maxSizeMB: 2,
      maxWidthOrHeight: 2000,
      useWebWorker: true,
    });

    setCurrentFileName(compressed.name);

    const reader = new FileReader();

    reader.onload = () => {
      setImageSrc(reader.result);
      setCrop({ x: 0, y: 0 });
      setZoom(1);
      setRotation(0);
      setOpen(true);
    };

    reader.readAsDataURL(compressed);

    return Upload.LIST_IGNORE;
  };

  const handleCrop = async () => {
    try {
      setLoading(true);

      const cropped = await getCroppedImg(
        imageSrc,
        croppedAreaPixels,
        rotation,
        currentFileName,
      );

      if (multiple) {
        setFileList?.((prev) => [...prev, cropped]);
      } else {
        setFileList?.([cropped]);
      }

      setOpen(false);
      setImageSrc(null);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Upload
        showUploadList={true}
        accept={accept}
        beforeUpload={beforeUpload}
        fileList={fileList || []}
        listType={listType}
        maxCount={maxCount}
        multiple={multiple}
        onRemove={(file) => {
          setFileList?.(
            (fileList || []).filter((item) => item.uid !== file.uid),
          );
        }}
      >
        {(maxCount > 1 || fileList.length < maxCount) && (
          <div>
            <PlusOutlined />
            <div
              style={{
                marginTop: 8,
              }}
            >
              {uploadText}
            </div>
          </div>
        )}
      </Upload>

      <Modal
        open={open}
        width={700}
        destroyOnClose
        title="Crop Image"
        onCancel={() => {
          setOpen(false);
          setImageSrc(null);
        }}
        footer={null}
      >
        <div
          style={{
            position: "relative",
            width: "100%",
            height: 420,
            background: "#222",
            borderRadius: 8,
            overflow: "hidden",
          }}
        >
          <Cropper
            image={imageSrc}
            crop={crop}
            zoom={zoom}
            rotation={rotation}
            aspect={aspect}
            onCropChange={setCrop}
            onZoomChange={setZoom}
            onRotationChange={setRotation}
            onCropComplete={onCropComplete}
          />
        </div>

        <div
          style={{
            marginTop: 24,
          }}
        >
          <div
            style={{
              marginBottom: 18,
            }}
          >
            <strong>Zoom</strong>

            <Slider
              min={1}
              max={3}
              step={0.1}
              value={zoom}
              onChange={setZoom}
            />
          </div>

          <div
            style={{
              marginBottom: 24,
            }}
          >
            <strong>Rotate</strong>

            <Slider
              min={0}
              max={360}
              step={1}
              value={rotation}
              onChange={setRotation}
            />
          </div>

          <Space
            style={{
              width: "100%",
              justifyContent: "flex-end",
            }}
          >
            <Button
              onClick={() => {
                setOpen(false);
                setImageSrc(null);
              }}
            >
              Cancel
            </Button>

            <Button type="primary" loading={loading} onClick={handleCrop}>
              Crop & Save
            </Button>
          </Space>
        </div>
      </Modal>
    </>
  );
};

export default ImageCropModal;
