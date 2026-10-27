import React, { useState } from "react";
import { Button, Form, Select, message } from "antd";
import { DeleteOutlined, PlusOutlined } from "@ant-design/icons";
import { Panel } from "../../components/PageHeader";
import AccountSelect from "../../components/AccountSelect";
import { SetVideoPeople } from "../../services/Api/VideoApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import { ROLES } from "./youtube";
import styles from "./Watch.module.scss";
import type { Video, VideoPerson, VideoRole } from "../../types/video";

interface PersonRow {
  /** null until an account is picked. */
  user_id: number | null;
  role: VideoRole;
}

interface Values {
  people: PersonRow[];
}

interface VideoPeopleFormProps {
  video: Video;
  onSaved: (video: Video) => void;
}

/** The professionals and brands in a video, saved all at once. Keyed by the video. */
const VideoPeopleForm = ({ video, onSaved }: VideoPeopleFormProps) => {
  const [form] = Form.useForm<Values>();
  const [saving, setSaving] = useState(false);
  const rows = Form.useWatch("people", form);

  // An account can be in a video once: the API keeps only its first row.
  const pickedElsewhere = (index: number) =>
    (rows ?? []).flatMap((row, i) => (i !== index && typeof row?.user_id === "number" ? [row.user_id] : []));

  const save = async ({ people = [] }: Values) => {
    // Each row has an account: the form requires one.
    const picked: VideoPerson[] = people.flatMap((row) => (row.user_id ? [{ user_id: row.user_id, role: row.role }] : []));
    try {
      setSaving(true);
      const res = await SetVideoPeople(video.id, picked);
      form.setFieldsValue({ people: res.data.data.people });
      message.success("People saved");
      onSaved(res.data.data);
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the people in this video");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Panel>
      <h4 className={styles.sectionTitle}>People in this video</h4>
      <p className={styles.hint}>
        Professionals and brands, each once: its host, a guest, or someone it features. The video's page links to them,
        and their own pages list the video. Only those whose page is visible show.
      </p>
      <Form form={form} initialValues={{ people: video.people }} onFinish={save}>
        <Form.List name="people">
          {(fields, { add, remove }, { errors }) => (
            <>
              {fields.length > 0 && (
                <div className={styles.peopleHead}>
                  <span>Professional or brand</span>
                  <span>Part</span>
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
                onClick={() => add({ user_id: null, role: "guest" } satisfies PersonRow)}
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

export default VideoPeopleForm;
