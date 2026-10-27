import React, { useState } from "react";
import { Button, Form, InputNumber, Select, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Panel } from "../../components/PageHeader";
import AccountSelect from "../../components/AccountSelect";
import { SetIssueFeatures } from "../../services/Api/MagazineApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import styles from "./Magazine.module.scss";
import type { IssueFeature, IssueRole, MagazineIssue } from "../../types/magazine";

// The website's words for each part ("On the cover, page 1").
const ROLES: { value: IssueRole; label: string }[] = [
  { value: "cover", label: "On the cover" },
  { value: "featured", label: "Featured" },
  { value: "mentioned", label: "Mentioned" },
];

interface PersonRow {
  /** null until an account is picked. */
  user_id: number | null;
  role: IssueRole;
  page_number: number | null;
}

interface Values {
  features: PersonRow[];
}

interface IssueFeaturesFormProps {
  issue: MagazineIssue;
  onSaved: (issue: MagazineIssue) => void;
}

/** The professionals and brands in an issue, saved all at once. Keyed by the issue. */
const IssueFeaturesForm = ({ issue, onSaved }: IssueFeaturesFormProps) => {
  const [form] = Form.useForm<Values>();
  const [saving, setSaving] = useState(false);
  const rows = Form.useWatch("features", form);

  // An account can be in an issue once: the API keeps only its first row.
  const pickedElsewhere = (index: number) =>
    (rows ?? []).flatMap((row, i) => (i !== index && typeof row?.user_id === "number" ? [row.user_id] : []));

  const save = async ({ features = [] }: Values) => {
    // Each row has an account: the form requires one.
    const people: IssueFeature[] = features.flatMap((row) =>
      row.user_id ? [{ user_id: row.user_id, role: row.role, page_number: row.page_number ?? null }] : [],
    );
    try {
      setSaving(true);
      const res = await SetIssueFeatures(issue.id, people);
      form.setFieldsValue({ features: res.data.data.features });
      message.success("People saved");
      onSaved(res.data.data);
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the people in this issue");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <h4 className={styles.sectionTitle}>People in this issue</h4>
      <p className={styles.sectionHint}>
        Professionals and brands, each once. The issue's page lists them under "In this issue", cover first, and their
        own pages list the issue with their part and page. Only those whose page is visible show.
      </p>
      <ul className={styles.roles}>
        <li>On the cover: they're on the issue's cover.</li>
        <li>Featured: the issue features them.</li>
        <li>Mentioned: the issue names them.</li>
      </ul>
      <Form form={form} initialValues={{ features: issue.features }} onFinish={save}>
        <Form.List name="features">
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.length > 0 && (
                <div className={styles.peopleHead}>
                  <span>Professional or brand</span>
                  <span>Part</span>
                  <span>Page (optional)</span>
                  <span />
                </div>
              )}
              {fields.map((field, index) => (
                <div key={field.key} className={styles.personRow}>
                  <Form.Item
                    name={[field.name, "user_id"]}
                    rules={[{ required: true, message: "Pick a professional or brand, or remove this row" }]}
                  >
                    <AccountSelect exclude={pickedElsewhere(index)} />
                  </Form.Item>
                  <Form.Item name={[field.name, "role"]}>
                    <Select options={ROLES} aria-label={`Part of person ${index + 1}`} />
                  </Form.Item>
                  <Form.Item name={[field.name, "page_number"]}>
                    <InputNumber
                      min={1}
                      precision={0}
                      placeholder="Page"
                      aria-label={`Page of person ${index + 1}`}
                      style={{ width: "100%" }}
                    />
                  </Form.Item>
                  <Button
                    type="text"
                    danger
                    icon={<DeleteOutlined />}
                    aria-label={`Remove person ${index + 1}`}
                    onClick={() => remove(field.name)}
                  />
                </div>
              ))}
              {!fields.length && <p className={styles.muted}>No one yet.</p>}
              <Button
                type="dashed"
                icon={<PlusOutlined />}
                onClick={() => add({ user_id: null, role: "featured", page_number: null } satisfies PersonRow)}
              >
                Add a person
              </Button>
              <Form.ErrorList errors={errors} />
            </>
          )}
        </Form.List>
        <div className={styles.actions}>
          <Button type="primary" htmlType="submit" loading={saving}>
            Save people
          </Button>
        </div>
      </Form>
    </Panel>
  );
};

export default IssueFeaturesForm;
