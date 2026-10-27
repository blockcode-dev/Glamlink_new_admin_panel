import React from "react";
import { Form, InputNumber, Switch } from "antd";
import { HomeOutlined } from "@ant-design/icons";
import ImageUploadField from "../../components/ImageUploadField";
import styles from "./JournalTopics.module.scss";

/** The tile fields' form values; `appendTileFields` turns them into what the API takes. */
export interface TopicTileValues {
  is_featured?: boolean;
  featured_order?: number | null;
  tile_image?: string;
}

/** Adds the tile fields to a topic's create or update request. */
export const appendTileFields = (formData: FormData, values: TopicTileValues) => {
  formData.append("is_featured", values.is_featured ? "true" : "false");
  if (values.featured_order !== undefined && values.featured_order !== null) {
    formData.append("featured_order", String(values.featured_order));
  }
  // "" removes the tile image; the tile then shows the topic image.
  formData.append("tile_image", values.tile_image || "");
};

/** The "Explore Beauty + Wellness" tile on the website's home page: whether this topic is one, its order and image. */
const TopicTileFields = () => (
  <div className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <div className={styles.sectionIcon}>
        <HomeOutlined />
      </div>
      <div className={styles.sectionHeaderText}>
        <span className={styles.sectionTitle}>Home page tile</span>
        <span className={styles.sectionHint}>
          The home page's "Explore Beauty + Wellness" tiles are the topics shown there, in their order.
        </span>
      </div>
    </div>
    <div className={styles.sectionBody}>
      <Form.Item name="is_featured" label="Show on the home page" valuePropName="checked" initialValue={false}>
        <Switch />
      </Form.Item>
      <Form.Item
        name="featured_order"
        label="Tile order"
        extra="Lowest first; tiles with the same number go by name."
        rules={[{ type: "integer", message: "A whole number" }]}
      >
        <InputNumber precision={0} placeholder="0" style={{ width: 160 }} />
      </Form.Item>
      <Form.Item name="tile_image" label="Tile image" extra="Square. Without one, the tile shows the topic image.">
        <ImageUploadField aspect={1} />
      </Form.Item>
    </div>
  </div>
);

export default TopicTileFields;
