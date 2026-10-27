import React, { useEffect, useRef, useState } from "react";
import { Button, Image, Input, Space, Tag, Upload, message } from "antd";
import { DeleteOutlined, PictureOutlined, PlusOutlined, RollbackOutlined, UploadOutlined } from "@ant-design/icons";
import { compressImage } from "../../utils/compressImage";
import type { GalleryPhoto } from "../../types/directoryApplication";
import { galleryOf, type GalleryChanges, type PickedPhoto } from "./listing";
import styles from "./DirectoryApplications.module.scss";

// Photos go up with the listing when it's saved (multipart `profile_image` and `images`), not one by one.

/** A gallery holds this many photos at most; the API refuses more. */
export const MAX_PHOTOS = 10;

// The types the API takes: by extension, and an image MIME type.
const ACCEPT = ".jpg,.jpeg,.png,.webp,.avif,.gif";

// Phone photos are large: JPEG, PNG and WebP are shrunk first. Others (an animated GIF) go as they are.
const shrink = async (file: File): Promise<File> => {
  if (!/^image\/(jpeg|png|webp)$/.test(file.type)) return file;
  try {
    return await compressImage(file);
  } catch {
    return file;
  }
};

const Placeholder = () => (
  <div className={styles.photoPlaceholder}>
    <PictureOutlined />
  </div>
);

interface ProfilePhotoFieldProps {
  /** The saved photo's link. */
  current: string | null;
  /** Unchanged when undefined; a new photo, or "" to remove the saved one. */
  value?: File | "";
  onChange?: (value: File | "" | undefined) => void;
}

/** The profile photo: keep, replace or remove it. A form control. */
export const ProfilePhotoField = ({ current, value, onChange }: ProfilePhotoFieldProps) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (!(value instanceof File)) {
      setPreview(null);
      return;
    }
    const url = URL.createObjectURL(value);
    setPreview(url);
    return () => URL.revokeObjectURL(url);
  }, [value]);

  const pick = async (file: File) => {
    setBusy(true);
    try {
      onChange?.(await shrink(file));
    } finally {
      setBusy(false);
    }
  };

  const shown = value instanceof File ? preview : value === "" ? null : current;

  return (
    <div className={styles.profilePhoto}>
      {shown ? (
        <Image src={shown} width={96} height={96} style={{ objectFit: "cover", borderRadius: 8 }} alt="Profile photo" />
      ) : (
        <Placeholder />
      )}
      <Space orientation="vertical" size={6}>
        <Space wrap>
          <Upload
            accept={ACCEPT}
            showUploadList={false}
            beforeUpload={(file) => {
              void pick(file);
              return Upload.LIST_IGNORE;
            }}
          >
            <Button icon={<UploadOutlined />} loading={busy}>
              {shown ? "Replace" : "Upload photo"}
            </Button>
          </Upload>
          {(value instanceof File || (current && value !== "")) && (
            <Button danger icon={<DeleteOutlined />} onClick={() => onChange?.(current ? "" : undefined)}>
              Remove
            </Button>
          )}
          {current && value !== undefined && (
            <Button icon={<RollbackOutlined />} onClick={() => onChange?.(undefined)}>
              Keep the saved photo
            </Button>
          )}
        </Space>
        {value instanceof File && <span className={styles.muted}>New photo: it's uploaded when you save.</span>}
        {value === "" && <span className={styles.muted}>The photo is removed when you save.</span>}
      </Space>
    </div>
  );
};

let lastUid = 0;

const NO_CHANGES: GalleryChanges = { remove: [], add: [] };

interface GalleryFieldProps {
  /** The saved photos. */
  saved: GalleryPhoto[] | null;
  value?: GalleryChanges;
  onChange?: (value: GalleryChanges) => void;
}

/**
 * The gallery: take saved photos out, add new ones with a caption, and choose the cover. A form control. The API
 * keeps a saved photo's caption and cover as they are, so a new photo can be the cover only once no saved one is.
 */
export const GalleryField = ({ saved, value = NO_CHANGES, onChange }: GalleryFieldProps) => {
  const photos = galleryOf(saved);
  const [adding, setAdding] = useState(false);
  // Photos picked while others were being shrunk add to the latest value, not the one this render saw.
  const latest = useRef(value);
  latest.current = value;

  // Previews are object URLs: free them when the form goes.
  useEffect(() => () => latest.current.add.forEach((photo) => URL.revokeObjectURL(photo.preview)), []);

  const kept = photos.filter((photo) => !value.remove.includes(photo.url));
  const savedCover = kept.some((photo) => photo.is_thumbnail);
  const count = kept.length + value.add.length;

  // One cover at most. A saved cover that stays wins; else the new photo chosen, else the first new one when the
  // cover was removed or no saved photo stays.
  const change = (next: GalleryChanges) => {
    const stays = photos.filter((photo) => !next.remove.includes(photo.url));
    const keepsCover = stays.some((photo) => photo.is_thumbnail);
    const chosen = next.add.findIndex((photo) => photo.is_thumbnail);
    const lostCover = photos.some((photo) => photo.is_thumbnail) && !keepsCover;
    const cover = keepsCover ? -1 : chosen >= 0 ? chosen : lostCover || !stays.length ? 0 : -1;
    onChange?.({ ...next, add: next.add.map((photo, i) => ({ ...photo, is_thumbnail: i === cover })) });
  };

  const addFiles = async (files: File[]) => {
    const room = MAX_PHOTOS - count;
    if (files.length > room) {
      message.warning(
        room > 0
          ? `A listing holds ${MAX_PHOTOS} photos at most: the first ${room} were added.`
          : `A listing holds ${MAX_PHOTOS} photos at most.`,
      );
    }
    const taking = files.slice(0, Math.max(0, room));
    if (!taking.length) return;
    setAdding(true);
    try {
      const ready = await Promise.all(taking.map(shrink));
      const picked = ready.map(
        (file): PickedPhoto => ({
          uid: `photo-${++lastUid}`,
          file,
          preview: URL.createObjectURL(file),
          caption: "",
          is_thumbnail: false,
        }),
      );
      change({ ...latest.current, add: [...latest.current.add, ...picked] });
    } finally {
      setAdding(false);
    }
  };

  const setAdded = (add: PickedPhoto[]) => change({ ...value, add });

  return (
    <div>
      {(photos.length > 0 || value.add.length > 0) && (
        <Image.PreviewGroup>
          <div className={styles.photoGrid}>
            {photos.map((photo) => {
              const removing = value.remove.includes(photo.url);
              return (
                <div key={photo.url} className={`${styles.photoTile} ${removing ? styles.removed : ""}`}>
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    classNames={{ root: styles.photoRoot, image: styles.photoImage }}
                  />
                  <div className={styles.photoMeta}>
                    {(photo.is_thumbnail || removing) && (
                      <span>
                        {photo.is_thumbnail && <Tag color="blue">Cover</Tag>}
                        {removing && <Tag color="red">Removed on save</Tag>}
                      </span>
                    )}
                    <span className={styles.photoCaption}>{photo.caption || "No caption"}</span>
                    <div className={styles.photoActions}>
                      {removing ? (
                        <Button
                          size="small"
                          icon={<RollbackOutlined />}
                          onClick={() => change({ ...value, remove: value.remove.filter((url) => url !== photo.url) })}
                        >
                          Keep
                        </Button>
                      ) : (
                        <Button
                          size="small"
                          danger
                          icon={<DeleteOutlined />}
                          onClick={() => change({ ...value, remove: [...value.remove, photo.url] })}
                        >
                          Remove
                        </Button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
            {value.add.map((photo, index) => (
              <div key={photo.uid} className={styles.photoTile}>
                <Image src={photo.preview} alt="" classNames={{ root: styles.photoRoot, image: styles.photoImage }} />
                <div className={styles.photoMeta}>
                  <span>
                    <Tag color="green">New</Tag>
                    {photo.is_thumbnail && <Tag color="blue">Cover</Tag>}
                  </span>
                  <Input
                    size="small"
                    placeholder="Caption"
                    maxLength={200}
                    value={photo.caption}
                    aria-label={`Caption for new photo ${index + 1}`}
                    onChange={(e) =>
                      setAdded(value.add.map((p, i) => (i === index ? { ...p, caption: e.target.value } : p)))
                    }
                  />
                  <div className={styles.photoActions}>
                    {!savedCover && !photo.is_thumbnail && (
                      <Button
                        size="small"
                        onClick={() => setAdded(value.add.map((p, i) => ({ ...p, is_thumbnail: i === index })))}
                      >
                        Make cover
                      </Button>
                    )}
                    <Button
                      size="small"
                      danger
                      icon={<DeleteOutlined />}
                      onClick={() => {
                        URL.revokeObjectURL(photo.preview);
                        setAdded(value.add.filter((p) => p.uid !== photo.uid));
                      }}
                    >
                      Remove
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Image.PreviewGroup>
      )}
      <Space wrap style={{ marginTop: photos.length || value.add.length ? 12 : 0 }}>
        <Upload
          accept={ACCEPT}
          multiple
          showUploadList={false}
          disabled={count >= MAX_PHOTOS || adding}
          beforeUpload={(file, batch) => {
            // Called once per file with the whole batch: add the batch once.
            if (file.uid === batch[0]?.uid) void addFiles(batch);
            return Upload.LIST_IGNORE;
          }}
        >
          <Button icon={<PlusOutlined />} loading={adding} disabled={count >= MAX_PHOTOS}>
            Add photos
          </Button>
        </Upload>
        <span className={styles.muted}>
          {count} of {MAX_PHOTOS}
          {savedCover && value.add.length > 0 ? ". To make a new photo the cover, remove the saved cover first." : ""}
        </span>
      </Space>
    </div>
  );
};
