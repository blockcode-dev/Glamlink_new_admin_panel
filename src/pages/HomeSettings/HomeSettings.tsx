import React, { useCallback, useEffect, useState } from "react";
import { Alert, Button, Col, Form, Input, Row, Skeleton, Space, message } from "antd";
import { ArrowDownOutlined, ArrowUpOutlined, DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Link } from "react-router";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import ImageUploadField from "../../components/ImageUploadField";
import { GetHomeSettings, UpdateHomeSettings } from "../../services/Api/SiteApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import { websiteUrl } from "../../utils/website";
import type { HomeSettings as Settings } from "../../types/content";

const MAX_SEARCHES = 10;
const MAX_SEARCH_LENGTH = 60;

interface FormValues {
  hero_image: string;
  find_professional_image: string;
  popular_searches: string[];
}

const HomeSettings = () => {
  const [form] = Form.useForm<FormValues>();
  const [settings, setSettings] = useState<Settings | null>(null);
  const [saving, setSaving] = useState(false);

  const show = useCallback(
    (saved: Settings) => {
      setSettings(saved);
      form.setFieldsValue({
        hero_image: saved.hero_image ?? "",
        find_professional_image: saved.find_professional_image ?? "",
        popular_searches: saved.popular_searches,
      });
    },
    [form],
  );

  useEffect(() => {
    GetHomeSettings()
      .then((res) => show(res.data.data))
      .catch((err) => {
        console.error("Error loading the home page settings:", err);
        message.error("Couldn't load the home page settings");
      });
  }, [show]);

  const save = async (values: FormValues) => {
    try {
      setSaving(true);
      const res = await UpdateHomeSettings({
        hero_image: values.hero_image || "",
        find_professional_image: values.find_professional_image || "",
        popular_searches: (values.popular_searches || []).map((term) => term.trim()).filter(Boolean),
      });
      show(res.data.data);
      message.success("Home page saved. The website shows it within a few minutes.");
    } catch (err) {
      const text = showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the home page";
      message.error(text);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="Home Page"
        subtitle={
          <>
            The parts of <a href={websiteUrl("/")} target="_blank" rel="noopener noreferrer">the website's home page</a>{" "}
            set by hand.
            {settings?.updated_at && ` Last saved ${dayjs(settings.updated_at).format("MMM D, YYYY h:mm A")}.`}
          </>
        }
        extra={
          <Button type="primary" loading={saving} disabled={!settings} onClick={() => form.submit()}>
            Save
          </Button>
        }
      />

      {!settings ? (
        <Panel>
          <Skeleton active />
        </Panel>
      ) : (
        <Form form={form} layout="vertical" onFinish={save} requiredMark={false}>
          <Panel>
            <Row gutter={32}>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="hero_image"
                  label="Hero image"
                  extra="Beside the search box at the top. Phones show it 4:3; wide screens fill the hero's height. Empty: the website's own image."
                >
                  <ImageUploadField previewWidth={240} />
                </Form.Item>
              </Col>
              <Col xs={24} lg={12}>
                <Form.Item
                  name="find_professional_image"
                  label={`"Find a Professional" image`}
                  extra="The banner of the Find a Professional section: 16:9 on phones, 3:1 on wide screens, so keep the subject centred. Empty: the website's own image."
                >
                  <ImageUploadField previewWidth={240} />
                </Form.Item>
              </Col>
            </Row>
          </Panel>

          <Panel>
            <h4 style={{ marginTop: 0 }}>Popular searches</h4>
            <p style={{ color: "var(--color-text-secondary)", marginTop: 0 }}>
              The chips under the home page's search box, in this order (at most {MAX_SEARCHES}). With none, the website
              shows its own five. <Link to="/search-terms">Search Terms</Link> shows what people actually search for.
            </p>
            <Form.List name="popular_searches">
              {(fields, { add, remove, move }, { errors }) => (
                <>
                  {fields.map((field, index) => (
                    <Space key={field.key} align="baseline" style={{ display: "flex", marginBottom: 4 }}>
                      <Form.Item
                        name={field.name}
                        rules={[
                          { required: true, whitespace: true, message: "Type a search, or remove this row" },
                          { max: MAX_SEARCH_LENGTH, message: `At most ${MAX_SEARCH_LENGTH} characters` },
                        ]}
                        style={{ marginBottom: 8 }}
                      >
                        <Input placeholder="e.g. Facials" style={{ width: 320 }} />
                      </Form.Item>
                      <Button
                        icon={<ArrowUpOutlined />}
                        aria-label="Move up"
                        disabled={index === 0}
                        onClick={() => move(index, index - 1)}
                      />
                      <Button
                        icon={<ArrowDownOutlined />}
                        aria-label="Move down"
                        disabled={index === fields.length - 1}
                        onClick={() => move(index, index + 1)}
                      />
                      <Button danger icon={<DeleteOutlined />} aria-label="Remove" onClick={() => remove(field.name)} />
                    </Space>
                  ))}
                  <Button
                    type="dashed"
                    icon={<PlusOutlined />}
                    disabled={fields.length >= MAX_SEARCHES}
                    onClick={() => add("")}
                  >
                    Add a search
                  </Button>
                  <Form.ErrorList errors={errors} />
                </>
              )}
            </Form.List>
          </Panel>

          <Panel>
            <Alert
              type="info"
              showIcon
              title={
                <>
                  The "Explore Beauty + Wellness" tiles are journal topics marked "Show on the home page", with their
                  order and tile image: set them on <Link to="/journal-topics">Topics</Link>. Products in the Shop row
                  are set on <Link to="/shop">Shop</Link>.
                </>
              }
            />
          </Panel>
        </Form>
      )}
    </div>
  );
};

export default HomeSettings;
