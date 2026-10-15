/** @format */

import React, { useEffect, useState } from "react";
import {
  Form,
  Input,
  Button,
  Upload,
  message,
  Select,
  Row,
  Col,
  InputNumber,
  DatePicker,
} from "antd";
import {
  UploadOutlined,
  ArrowLeftOutlined,
  PictureOutlined,
  FormOutlined,
} from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import ImgCrop from "antd-img-crop";
import VideoCropModal from "./VideoCropModal";
import { CreateAd, UpdateAd, GetAdById } from "../../services/Api/AdApi";
import styles from "./AddAd.module.scss";

const SectionCard = ({ icon, title, hint, children }) => (
  <div className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <div className={styles.sectionIcon}>{icon}</div>
      <div className={styles.sectionHeaderText}>
        <span className={styles.sectionTitle}>{title}</span>
        {hint && <span className={styles.sectionHint}>{hint}</span>}
      </div>
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </div>
);

// Fixed slot list — each slot has a LOCKED size, matching ads-config.example.json.
// `pages` on each slot is which page(s) that placement physically exists on —
// this is what drives the Page → Slot filtering below. Video versions are
// exactly HALF the image dimensions, keeping the same ratio while cutting
// file weight, since video files are much heavier than a static image at
// the same resolution.
// If you ever add a new placement on the website, add it here first.
export const SLOT_OPTIONS = [
  {
    value: "journal-top-banner",
    label: "Journal Top Banner",
    width: 728,
    height: 90,
    videoWidth: 364,
    videoHeight: 45,
    pages: ["journal-listing"],
  },
  {
    value: "journal-sidebar-left",
    label: "Journal Sidebar Left",
    width: 160,
    height: 600,
    videoWidth: 80,
    videoHeight: 300,
    pages: ["journal-listing", "journal-article"],
  },
  {
    value: "journal-sidebar-right",
    label: "Journal Sidebar Right",
    width: 160,
    height: 600,
    videoWidth: 80,
    videoHeight: 300,
    pages: ["journal-listing", "journal-article"],
  },
  {
    value: "journal-mobile-bottom",
    label: "Journal Mobile Bottom Bar",
    width: 320,
    height: 50,
    videoWidth: 160,
    videoHeight: 25,
    pages: ["journal-listing", "journal-article"],
  },
  {
    value: "journal-article-top",
    label: "Journal Article Top",
    width: 728,
    height: 90,
    videoWidth: 364,
    videoHeight: 45,
    pages: ["journal-article"],
  },
  {
    value: "journal-article-bottom",
    label: "Journal Article Bottom",
    width: 728,
    height: 90,
    videoWidth: 364,
    videoHeight: 45,
    pages: ["journal-article"],
  },
  {
    value: "journal-article-mid-rectangle",
    label: "Journal Article Mid Rectangle",
    width: 300,
    height: 250,
    videoWidth: 150,
    videoHeight: 125,
    pages: ["journal-article"],
  },
  {
    value: "journal-article-mid-square",
    label: "Journal Article Mid Square",
    width: 250,
    height: 250,
    videoWidth: 125,
    videoHeight: 125,
    pages: ["journal-article"],
  },
  {
    value: "journal-listing-in-feed",
    label: "Journal Listing In-Feed",
    width: 728,
    height: 90,
    videoWidth: 364,
    videoHeight: 45,
    pages: ["journal-listing"],
  },
  {
    value: "journal-listing-in-feed-2",
    label: "Journal Listing In-Feed 2",
    width: 600,
    height: null,
    videoWidth: 600,
    videoHeight: null,
    pages: ["journal-listing"],
  },
  {
    value: "journal-bottom",
    label: "Journal Bottom",
    width: 500,
    height: 300,
    videoWidth: 250,
    videoHeight: 150,
    pages: ["journal-listing"],
  },
];

const MAX_IMAGE_SIZE_MB = 2;
const MAX_VIDEO_SIZE_MB = 25;

const behaviourOptions = [
  { value: "static", label: "Static — scrolls normally with the page" },
  { value: "sticky", label: "Sticky — stays visible while scrolling" },
  {
    value: "fixed-overlay",
    label: "Fixed overlay — always pinned (e.g. mobile bottom bar)",
  },
];

const pageOptions = [
  { value: "journal-listing", label: "Journal Listing Page" },
  { value: "journal-article", label: "Journal Inner/Article Page" },
];

const AddAd = () => {
  const [form] = Form.useForm();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = !!id;

  const [fileList, setFileList] = useState([]);
  const [existingImage, setExistingImage] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSize, setSelectedSize] = useState(null); // { width, height }
  const [mediaType, setMediaType] = useState("image"); // "image" | "video"
  const [rawVideoFile, setRawVideoFile] = useState(null);
  const [cropModalOpen, setCropModalOpen] = useState(false);
  const [selectedPages, setSelectedPages] = useState([]);

  useEffect(() => {
    if (isEditMode) {
      fetchAd();
    }
  }, [id]);

  const fetchAd = async () => {
    try {
      const res = await GetAdById(id);
      const ad = res.data.data || res.data;

      form.setFieldsValue({
        slot_id: ad.slot_id,
        link_url: ad.link_url,
        behaviour: ad.behaviour,
        pages: ad.pages || [],
        status: ad.status,
        start_date: ad.start_date ? dayjs(ad.start_date) : null,
        end_date: ad.end_date ? dayjs(ad.end_date) : null,
      });

      const resolvedMediaType = ad.media_type || "image";

      // Always trust the CURRENT slot config for size, not whatever was
      // saved on this ad when it was created — that way, if a slot's fixed
      // size is ever changed later, every ad using that slot picks up the
      // new size automatically instead of quietly staying stale.
      const slotMeta = SLOT_OPTIONS.find((s) => s.value === ad.slot_id);
      const resolvedSize = slotMeta
        ? {
            width:
              resolvedMediaType === "video"
                ? slotMeta.videoWidth
                : slotMeta.width,
            height:
              resolvedMediaType === "video"
                ? slotMeta.videoHeight
                : slotMeta.height,
          }
        : { width: ad.width, height: ad.height }; // fallback if the slot was since removed

      setSelectedSize(resolvedSize);
      setMediaType(resolvedMediaType);
      setExistingImage(ad.image_url);
      setSelectedPages(ad.pages || []);
    } catch (err) {
      message.error("Failed to load ad");
    } finally {
    }
  };

  // When the admin picks a slot, its size is locked automatically —
  // this is what keeps every ad graphic a fixed, predictable size.
  // The exact size used depends on whether Image or Video is selected.
  const applySlotSize = (slotValue, type) => {
    const slot = SLOT_OPTIONS.find((s) => s.value === slotValue);
    if (!slot) return;

    if (type === "video") {
      setSelectedSize({ width: slot.videoWidth, height: slot.videoHeight });
    } else {
      setSelectedSize({ width: slot.width, height: slot.height });
    }
  };

  const handleSlotChange = (value) => {
    applySlotSize(value, mediaType);
  };

  // Pages are picked FIRST, and they decide which slots are even valid —
  // e.g. picking both "journal-listing" and "journal-article" only leaves
  // slots that exist on both pages (like the sidebars), while picking just
  // one page opens up every slot that lives on that page.
  const getSlotsForPages = (pages) => {
    if (!pages || pages.length === 0) return [];
    return SLOT_OPTIONS.filter((slot) =>
      pages.every((page) => slot.pages.includes(page)),
    );
  };

  const handlePagesChange = (values) => {
    setSelectedPages(values);

    const currentSlotId = form.getFieldValue("slot_id");
    const stillValid =
      currentSlotId &&
      getSlotsForPages(values).some((slot) => slot.value === currentSlotId);

    if (!stillValid) {
      form.setFieldValue("slot_id", undefined);
      setSelectedSize(null);
    }
  };

  const handleMediaTypeChange = (value) => {
    setMediaType(value);
    // Clear any already-picked file since the required size just changed
    setFileList([]);
    const slotValue = form.getFieldValue("slot_id");
    if (slotValue) {
      applySlotSize(slotValue, value);
    }
  };

  // IMAGE upload — the crop tool below already forces the exact ratio,
  // so by the time this runs the file is guaranteed to match.
  const handleImageBeforeUpload = (file) => {
    if (!file.type.startsWith("image/")) {
      message.error("Please upload an image file");
      return Upload.LIST_IGNORE;
    }

    if (file.size / 1024 / 1024 > MAX_IMAGE_SIZE_MB) {
      message.error(
        `Keep the image under ${MAX_IMAGE_SIZE_MB}MB so the page stays fast`,
      );
      return Upload.LIST_IGNORE;
    }

    setFileList([
      { uid: file.uid, name: file.name, status: "done", originFileObj: file },
    ]);
    return false;
  };

  // VIDEO upload — type/size are checked up front, then the crop modal opens
  // (which also enforces the 60-second limit before it lets you apply the
  // crop). ffmpeg.wasm inside the modal re-encodes the cropped region into a
  // real MP4 at the slot's exact size, so the ratio is always guaranteed.
  const handleVideoBeforeUpload = (file) => {
    if (!file.type.startsWith("video/")) {
      message.error("Please upload a video file");
      return Upload.LIST_IGNORE;
    }

    if (file.size / 1024 / 1024 > MAX_VIDEO_SIZE_MB) {
      message.error(
        `Keep the video under ${MAX_VIDEO_SIZE_MB}MB so the page stays fast`,
      );
      return Upload.LIST_IGNORE;
    }

    setRawVideoFile(file);
    setCropModalOpen(true);
    return Upload.LIST_IGNORE; // we handle the file ourselves via the crop modal
  };

  const handleVideoCropped = (croppedFile) => {
    setFileList([
      {
        uid: croppedFile.name + Date.now(),
        name: croppedFile.name,
        status: "done",
        originFileObj: croppedFile,
      },
    ]);
    setCropModalOpen(false);
    setRawVideoFile(null);
    message.success("Video cropped to MP4 and ready to save");
  };

  const handleSubmit = async () => {
    try {
      setSubmitting(true);
      const values = await form.validateFields();

      if (!selectedSize) {
        message.error("Select a slot to lock in the ad size");
        setSubmitting(false);
        return;
      }

      const formData = new FormData();

      // Alt text is never asked from the admin — it's generated silently
      // from the slot's plain-English name so the image still has proper
      // accessibility text without the admin needing to know what "alt" is.
      const slotMeta = SLOT_OPTIONS.find((s) => s.value === values.slot_id);
      const autoAltText = slotMeta
        ? `${slotMeta.label} advertisement`
        : "Advertisement";

      formData.append("slot_id", values.slot_id);
      formData.append("link_url", values.link_url);
      formData.append("alt_text", autoAltText);
      formData.append("media_type", mediaType);
      formData.append("width", selectedSize.width);
      formData.append("height", selectedSize.height);
      formData.append("behaviour", values.behaviour);
      formData.append("status", values.status || "active");
      formData.append("pages", JSON.stringify(values.pages || []));

      if (values.start_date) {
        formData.append(
          "start_date",
          dayjs(values.start_date).format("YYYY-MM-DD HH:mm:ss"),
        );
      }

      if (values.end_date) {
        formData.append(
          "end_date",
          dayjs(values.end_date).format("YYYY-MM-DD HH:mm:ss"),
        );
      }

      if (fileList.length > 0) {
        // Videos go under the "videos" field, images under "images" — this
        // keeps them landing in the correct upload folders on the backend.
        formData.append(
          mediaType === "video" ? "videos" : "images",
          fileList[0].originFileObj,
        );
      } else if (!isEditMode) {
        message.error("Ad image is required");
        setSubmitting(false);
        return;
      }

      if (isEditMode) {
        await UpdateAd(id, formData);
        message.success("Ad updated successfully");
      } else {
        await CreateAd(formData);
        message.success("Ad created successfully");
      }

      navigate("/ads");
    } catch (err) {
      console.error(err);
      message.error("Failed");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Box className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>
            {isEditMode ? "Edit Ad" : "Add Ad"}
          </h3>
          <p className={styles.headerSubtitle}>
            Upload the ad graphic and choose where and how it should appear.
          </p>
        </div>

        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate("/ads")}>
          Return to Ads
        </Button>
      </div>

      <Form
        form={form}
        layout="vertical"
        initialValues={{ status: "active", behaviour: "static" }}
      >
        {/* AD DETAILS */}
        <SectionCard
          icon={<FormOutlined />}
          title="Ad details"
          hint="Slot, behaviour, pages and schedule"
        >
          <Row gutter={20}>
            <Col xs={24} md={16}>
              <Form.Item
                name="pages"
                label="Show on pages"
                tooltip="Pick the page(s) first — the Slot options below will filter to match"
                rules={[
                  { required: true, message: "Select at least one page" },
                ]}
              >
                <Select
                  mode="multiple"
                  options={pageOptions}
                  placeholder="Select pages"
                  allowClear
                  onChange={handlePagesChange}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="slot_id"
                label="Slot"
                tooltip="Only slots available on the page(s) selected above are shown — the size is fixed per slot"
                rules={[{ required: true, message: "Select a slot" }]}
              >
                <Select
                  placeholder={
                    selectedPages.length === 0
                      ? "Select pages first"
                      : "Select where this ad will appear"
                  }
                  disabled={selectedPages.length === 0}
                  onChange={handleSlotChange}
                  options={getSlotsForPages(selectedPages).map((slot) => ({
                    value: slot.value,
                    label: `${slot.label} (${slot.width} x ${slot.height ?? "auto"})`,
                  }))}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                label="Ad type"
                tooltip="Video ads use a smaller, lighter-weight size than images — same shape, less file weight"
              >
                <Select
                  value={mediaType}
                  onChange={handleMediaTypeChange}
                  options={[
                    { value: "image", label: "Image" },
                    { value: "video", label: "Video" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="link_url"
                label="Link URL"
                rules={[
                  { required: true, message: "Link URL is required" },
                  { type: "url", message: "Enter a valid URL" },
                ]}
              >
                <Input placeholder="https://example.com" />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Width (px)">
                <InputNumber
                  value={selectedSize?.width}
                  disabled
                  style={{ width: "100%" }}
                  placeholder="Auto-set by slot"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item label="Height (px)">
                <InputNumber
                  value={selectedSize?.height}
                  disabled
                  style={{ width: "100%" }}
                  placeholder="Auto-set by slot"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="behaviour"
                label="Behaviour"
                rules={[{ required: true, message: "Select a behaviour" }]}
              >
                <Select
                  options={behaviourOptions}
                  placeholder="Select behaviour"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={8}>
              <Form.Item
                name="status"
                label="Status"
                rules={[{ required: true, message: "Select a status" }]}
              >
                <Select
                  options={[
                    { value: "active", label: "Active" },
                    { value: "inactive", label: "Inactive" },
                  ]}
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="start_date"
                label="Start date & time"
                tooltip="Optional — leave blank to start immediately"
              >
                <DatePicker
                  showTime={{ use12Hours: true, format: "hh:mm A" }}
                  format="DD/MM/YYYY hh:mm A"
                  style={{ width: "100%" }}
                  placeholder="Select start date & time"
                />
              </Form.Item>
            </Col>

            <Col xs={24} md={12}>
              <Form.Item
                name="end_date"
                label="End date & time"
                tooltip="Optional — leave blank to run indefinitely"
              >
                <DatePicker
                  showTime={{ use12Hours: true, format: "hh:mm A" }}
                  format="DD/MM/YYYY hh:mm A"
                  style={{ width: "100%" }}
                  placeholder="Select end date & time"
                />
              </Form.Item>
            </Col>
          </Row>
        </SectionCard>

        {/* AD MEDIA */}
        <SectionCard
          icon={<PictureOutlined />}
          title="Ad graphic"
          hint={
            selectedSize
              ? `This slot requires ${mediaType === "video" ? "a video" : "an image"} of exactly ${selectedSize.width} x ${selectedSize.height}px`
              : "Select a slot above first to see the required size"
          }
        >
          <div className={styles.coverUploadArea}>
            <div className={styles.coverPreview}>
              {fileList.length > 0 ? (
                mediaType === "video" ? (
                  <video
                    src={URL.createObjectURL(fileList[0].originFileObj)}
                    controls
                    muted
                  />
                ) : (
                  <img
                    src={URL.createObjectURL(fileList[0].originFileObj)}
                    alt="Ad preview"
                  />
                )
              ) : existingImage ? (
                mediaType === "video" ? (
                  <video src={existingImage} controls muted />
                ) : (
                  <img src={existingImage} alt="Ad preview" />
                )
              ) : (
                <div className={styles.coverEmpty}>
                  <PictureOutlined style={{ fontSize: 22 }} />
                  <span>
                    No {mediaType === "video" ? "video" : "image"} selected
                  </span>
                </div>
              )}
            </div>

            <div className={styles.coverActions}>
              {mediaType === "video" ? (
                <Upload
                  accept="video/*"
                  beforeUpload={handleVideoBeforeUpload}
                  fileList={[]}
                  showUploadList={false}
                  maxCount={1}
                  disabled={!selectedSize}
                >
                  <Button icon={<UploadOutlined />} disabled={!selectedSize}>
                    {fileList.length > 0 || existingImage
                      ? "Replace video"
                      : "Upload video"}
                  </Button>
                </Upload>
              ) : (
                <ImgCrop
                  aspect={
                    selectedSize ? selectedSize.width / selectedSize.height : 1
                  }
                  quality={1}
                  showGrid
                  modalTitle="Crop ad image"
                  modalOk="Apply crop"
                  modalCancel="Cancel"
                >
                  <Upload
                    accept="image/*"
                    beforeUpload={handleImageBeforeUpload}
                    fileList={[]}
                    showUploadList={false}
                    maxCount={1}
                    disabled={!selectedSize}
                  >
                    <Button icon={<UploadOutlined />} disabled={!selectedSize}>
                      {fileList.length > 0 || existingImage
                        ? "Replace image"
                        : "Upload image"}
                    </Button>
                  </Upload>
                </ImgCrop>
              )}

              {(fileList.length > 0 || existingImage) && (
                <Button
                  danger
                  type="text"
                  onClick={() => {
                    setFileList([]);
                    setExistingImage(null);
                  }}
                >
                  Remove {mediaType}
                </Button>
              )}

              <span className={styles.coverHelp}>
                {mediaType === "video"
                  ? `Any video works (under ${MAX_VIDEO_SIZE_MB}MB, under 60s) — you'll get a crop screen and it'll be saved as MP4 at ${selectedSize ? `${selectedSize.width}x${selectedSize.height}` : "the slot's size"}.`
                  : `JPG or PNG, under ${MAX_IMAGE_SIZE_MB}MB — you'll get a crop screen to fit it to the exact ratio needed.`}
              </span>
            </div>
          </div>
        </SectionCard>

        {/* ACTIONS */}
        <div className={styles.sectionCard}>
          <div className={styles.footerBar}>
            <span className={styles.footerHint}>
              {isEditMode
                ? "Update the ad details and save your changes."
                : "Fill in the details and save the ad."}
            </span>

            <Button onClick={() => navigate("/ads")}>Cancel</Button>

            <Button type="primary" onClick={handleSubmit} loading={submitting}>
              {isEditMode ? "Save changes" : "Save ad"}
            </Button>
          </div>
        </div>
      </Form>

      <VideoCropModal
        open={cropModalOpen}
        file={rawVideoFile}
        targetWidth={selectedSize?.width}
        targetHeight={selectedSize?.height}
        onCancel={() => {
          setCropModalOpen(false);
          setRawVideoFile(null);
        }}
        onCropped={handleVideoCropped}
      />
    </Box>
  );
};

export default AddAd;
