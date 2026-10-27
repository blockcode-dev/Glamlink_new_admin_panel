import React, { useState } from "react";
import { Button, Image, Space, Upload, message } from "antd";
import ImgCrop from "antd-img-crop";
import { DeleteOutlined, UploadOutlined } from "@ant-design/icons";
import { UploadJournalMedia } from "../services/Api/JournalApi";
import { compressImage } from "../utils/compressImage";
import { apiErrorMessage } from "../utils/apiError";

interface ImageUploadFieldProps {
  /** The image's link (an upload on the API's host), or empty. */
  value?: string | null;
  /** Gets the new link, or "" once removed. */
  onChange?: (value: string) => void;
  /** Crop to this width / height before uploading; no crop without it. */
  aspect?: number;
  /** Preview width in px. */
  previewWidth?: number;
  disabled?: boolean;
}

/**
 * A form control for one image: it uploads the file (POST /journal/upload) and holds the link the API answers, which
 * is how the API takes page, tile, hero and cover images (it refuses links to other sites). Remove sets "".
 */
const ImageUploadField = ({ value, onChange, aspect, previewWidth = 160, disabled }: ImageUploadFieldProps) => {
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);

  const upload = async (file: File) => {
    setUploading(true);
    setProgress(0);
    try {
      // A cropped file was already shrunk before cropping.
      const ready = aspect ? file : await compressImage(file);
      onChange?.(await UploadJournalMedia(ready, { onProgress: setProgress }));
    } catch (err) {
      message.error(apiErrorMessage(err) || "Couldn't upload the image");
    } finally {
      setUploading(false);
    }
  };

  const picker = (
    <Upload
      accept=".jpg,.jpeg,.png,.webp"
      showUploadList={false}
      disabled={disabled || uploading}
      beforeUpload={(file) => {
        void upload(file);
        return Upload.LIST_IGNORE;
      }}
    >
      <Button icon={<UploadOutlined />} loading={uploading} disabled={disabled}>
        {uploading ? `Uploading ${progress}%` : value ? "Replace" : "Upload image"}
      </Button>
    </Upload>
  );

  return (
    <Space align="start" size={12} wrap>
      {value && (
        <Image src={value} width={previewWidth} alt="" style={{ borderRadius: 8, objectFit: "cover" }} />
      )}
      <Space orientation="vertical" size={8}>
        {aspect ? (
          <ImgCrop
            aspect={aspect}
            quality={0.95}
            rotationSlider
            modalTitle="Crop Image"
            modalOk="Crop & Upload"
            beforeCrop={compressImage}
          >
            {picker}
          </ImgCrop>
        ) : (
          picker
        )}
        {value && (
          <Button icon={<DeleteOutlined />} danger disabled={disabled || uploading} onClick={() => onChange?.("")}>
            Remove
          </Button>
        )}
      </Space>
    </Space>
  );
};

export default ImageUploadField;
