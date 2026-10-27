import React from "react";
import { Card, Col, Form, Input, InputNumber, Row, Switch } from "antd";
import AccountSelect from "../../../../components/AccountSelect";
import { websiteUrl } from "../../../../utils/website";
import type { Shop } from "../../../../types/journal";

/** The form values of the fields below. */
export interface ProductSiteValues {
  slug?: string;
  description?: string;
  owner_id?: number | null;
  brand_id?: number | null;
  is_featured?: boolean;
  featured_order?: number | null;
}

/** A loaded product's values for these fields. */
export const productSiteValues = (shop: Shop): ProductSiteValues => ({
  slug: shop.slug ?? "",
  description: shop.description ?? "",
  owner_id: shop.owner_id ?? null,
  brand_id: shop.brand_id ?? null,
  is_featured: Boolean(shop.is_featured),
  featured_order: shop.featured_order ?? null,
});

/** Adds these fields to a product's create or update request. */
export const appendProductSiteFields = (formData: FormData, values: ProductSiteValues) => {
  // Without a slug the API keeps the product's own (or makes one from the title for a new product).
  if (values.slug?.trim()) formData.append("slug", values.slug.trim());
  formData.append("description", values.description ?? "");
  // "" clears the owner or brand.
  formData.append("owner_id", values.owner_id ? String(values.owner_id) : "");
  formData.append("brand_id", values.brand_id ? String(values.brand_id) : "");
  formData.append("is_featured", values.is_featured ? "true" : "false");
  if (values.featured_order !== undefined && values.featured_order !== null) {
    formData.append("featured_order", String(values.featured_order));
  }
};

/** The website's side of a product: its address, its page's text, whose page it shows on, and the home page row. */
const ProductSiteFields = ({ isNew }: { isNew: boolean }) => {
  const slug = Form.useWatch<string | undefined>("slug");
  return (
    <Card title="On the website" size="small" style={{ marginBottom: 24 }}>
      <Form.Item
        name="slug"
        label="Slug"
        extra={
          slug
            ? `The product's address: ${websiteUrl(`/shop/${slug}`)}`
            : isNew
              ? "The product's address. Leave it blank to make one from the title."
              : "The product's address. Leave it blank to keep the current one."
        }
      >
        <Input placeholder="e.g. glow-serum" />
      </Form.Item>

      <Form.Item
        name="description"
        label="Description"
        extra="The product page's longer text; a blank line starts a new paragraph. Without it, the page shows the short description."
      >
        <Input.TextArea rows={5} />
      </Form.Item>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="owner_id"
            label="Put up by"
            extra="The professional or brand whose page lists this product. Empty: Glamlink's own pick."
          >
            <AccountSelect placeholder="Search professionals and brands" />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="brand_id"
            label="Brand page"
            extra="The brand account that makes it; its page lists the product too. The Brand field above is still the name shown."
          >
            <AccountSelect type="brand" placeholder="Search brands" />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col xs={24} md={12}>
          <Form.Item
            name="is_featured"
            label="Featured on the home page"
            valuePropName="checked"
            initialValue={false}
            extra="The home page's Shop Products row."
          >
            <Switch />
          </Form.Item>
        </Col>
        <Col xs={24} md={12}>
          <Form.Item
            name="featured_order"
            label="Order in that row"
            extra="Lowest first."
            rules={[{ type: "integer", message: "A whole number" }]}
          >
            <InputNumber precision={0} placeholder="0" style={{ width: 160 }} />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

export default ProductSiteFields;
