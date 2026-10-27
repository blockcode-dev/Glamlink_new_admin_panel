import React from "react";
import { Button, Form, Image, Input, InputNumber, Switch } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import ImageUploadField from "../../components/ImageUploadField";
import RichTextEditor from "../../components/RichTextEditor";
import SafeHtml from "../../components/SafeHtml";
import { htmlToText } from "../../utils/sanitizeHtml";
import {
  LIMITS,
  aboutRule,
  normalizeSlug,
  slugRules,
  webLinkRule,
  type PageFallbacks,
  type PageFormValues,
} from "./pageForm";
import { publicPageUrl, shortUrl } from "./pageStatus";
import styles from "./ProfilePages.module.scss";

interface PageFieldsProps {
  /** What the page shows where a field is empty; null for a new brand page (nothing behind it yet). */
  fallbacks: PageFallbacks | null;
  /** The address saved now, "" for none: it is checked only once changed. */
  savedSlug: string;
  /** A new brand page: an empty address is made from the name. */
  creating?: boolean;
}

/** What a fallback looks like now, under its field. */
const Fallback = ({ children }: { children: React.ReactNode }) => (
  <div className={styles.fallback}>
    <span className={styles.fallbackLabel}>Showing now</span>
    {children}
  </div>
);

/**
 * The fields an admin sets on a page (PUT /profiles/admin/:userId), shared by the page screen and "New brand page".
 * Goes inside a Form whose values are PageFormValues.
 */
const PageFields = ({ fallbacks, savedSlug, creating = false }: PageFieldsProps) => {
  const form = Form.useFormInstance<PageFormValues>();
  const featured = Form.useWatch("is_featured", form);
  const about = Form.useWatch("about", form) ?? "";
  const image = Form.useWatch("image", form) ?? "";

  const source = fallbacks?.source;
  const whenEmpty = (what: string) => (source ? ` Empty: the ${source}'s ${what} shows.` : "");

  const slugHint = creating
    ? "Empty: made from the name."
    : fallbacks?.addressFromCard
      ? "Now the Access card's handle: change it to give the page an address of its own."
      : "";

  const socialHint = (count: number) => {
    if (count) return source ? `Up to ${LIMITS.social}. They replace the ${source}'s links.` : `Up to ${LIMITS.social}.`;
    if (!source) return "None.";
    const shown = fallbacks?.social;
    if (!shown) return `None of its own: the ${source}'s links show.`;
    return shown.length
      ? `None of its own: the ${source}'s links show (${shown.map((link) => link.title).join(", ")}).`
      : `None of its own: the ${source}'s links show, and it has none.`;
  };

  return (
    <>
      <h4 className={styles.sectionTitle}>Address and visibility</h4>
      <Form.Item
        name="slug"
        label="Address"
        normalize={normalizeSlug}
        rules={slugRules(savedSlug)}
        extra={[
          `The page's address on the website: 3 to ${LIMITS.slugMax} lower-case letters, digits and dashes, not used by any other page or card.`,
          slugHint,
        ]
          .filter(Boolean)
          .join(" ")}
      >
        <Input prefix={shortUrl(publicPageUrl(""))} maxLength={LIMITS.slugMax} />
      </Form.Item>
      <Form.Item
        name="is_listed"
        label="Listed on the website"
        valuePropName="checked"
        extra="Off: the page is hidden everywhere on the website, even with a live Access card."
      >
        <Switch />
      </Form.Item>
      <div className={styles.inlineFields}>
        <Form.Item
          name="is_featured"
          label="Featured"
          valuePropName="checked"
          extra="Featured pages show in the home page's rows."
        >
          <Switch />
        </Form.Item>
        <Form.Item name="featured_order" label="Featured order" extra="Lowest first, then by name.">
          <InputNumber min={0} precision={0} disabled={!featured} />
        </Form.Item>
      </div>

      <h4 className={styles.sectionTitle}>What the page shows</h4>
      <Form.Item
        name="tagline"
        label="Tagline"
        extra={`A line under the name.${whenEmpty("title")}`}
      >
        <Input maxLength={LIMITS.tagline} showCount placeholder={fallbacks?.tagline ?? undefined} />
      </Form.Item>
      <Form.Item
        name="about"
        label="About"
        rules={[aboutRule]}
        extra={
          <>
            {`The website's formatting only, at most 2,000 characters.${whenEmpty("bio")}`}
            {fallbacks?.about && !htmlToText(about).trim() && (
              <Fallback>
                <SafeHtml html={fallbacks.about} />
              </Fallback>
            )}
          </>
        }
      >
        <RichTextEditor simple maxLength={LIMITS.about} height={160} />
      </Form.Item>
      <Form.Item
        name="website"
        label="Website"
        rules={[webLinkRule]}
        extra={`A link like example.com (https:// is added).${whenEmpty("website")}`}
      >
        <Input maxLength={LIMITS.link} placeholder={fallbacks?.website ?? "example.com"} />
      </Form.Item>
      <Form.Item label="Social links">
        <Form.List name="social">
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.map(({ key, name }) => (
                <div key={key} className={styles.socialRow}>
                  <Form.Item
                    name={[name, "title"]}
                    rules={[{ required: true, whitespace: true, message: "Name the link" }]}
                  >
                    <Input maxLength={LIMITS.socialTitle} placeholder="Instagram" aria-label="Link name" />
                  </Form.Item>
                  <Form.Item
                    name={[name, "url"]}
                    rules={[{ required: true, whitespace: true, message: "Enter the link" }, webLinkRule]}
                  >
                    <Input maxLength={LIMITS.link} placeholder="instagram.com/…" aria-label="Link" />
                  </Form.Item>
                  <Button icon={<DeleteOutlined />} aria-label="Remove link" onClick={() => remove(name)} />
                </div>
              ))}
              <Button
                icon={<PlusOutlined />}
                onClick={() => add({ title: "", url: "" })}
                disabled={fields.length >= LIMITS.social}
              >
                Add link
              </Button>
              <Form.ErrorList errors={errors} />
              <div className={styles.hint}>{socialHint(fields.length)}</div>
            </>
          )}
        </Form.List>
      </Form.Item>

      <h4 className={styles.sectionTitle}>Images</h4>
      <div className={styles.twoColumns}>
        <Form.Item
          name="image"
          label="Image"
          extra={
            <>
              {`A logo or photo, cropped square.${whenEmpty("photo")}`}
              {fallbacks?.image && !image && (
                <Fallback>
                  <Image src={fallbacks.image} width={72} height={72} alt="" className={styles.fallbackImage} />
                </Fallback>
              )}
            </>
          }
        >
          <ImageUploadField aspect={1} previewWidth={120} />
        </Form.Item>
        <Form.Item
          name="cover_image"
          label="Cover image"
          extra="A wide picture across the top of the page, cropped 3:1. Empty: no cover."
        >
          <ImageUploadField aspect={3} previewWidth={300} />
        </Form.Item>
      </div>
    </>
  );
};

export default PageFields;
