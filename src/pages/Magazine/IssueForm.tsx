import React, { useEffect, useState } from "react";
import {
  Button,
  Col,
  DatePicker,
  Empty,
  Form,
  Input,
  InputNumber,
  Radio,
  Row,
  Skeleton,
  Switch,
  message,
} from "antd";
import { ExportOutlined } from "@ant-design/icons";
import { useNavigate, useParams } from "react-router";
import dayjs, { type Dayjs } from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import ImageUploadField from "../../components/ImageUploadField";
import { CreateIssue, GetIssue, UpdateIssue } from "../../services/Api/MagazineApi";
import { apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import { websiteUrl } from "../../utils/website";
import IssueFeaturesForm from "./IssueFeaturesForm";
import styles from "./Magazine.module.scss";
import type { IssueFields, IssueStatus, MagazineIssue } from "../../types/magazine";

interface FormValues {
  title: string;
  slug: string;
  issue_number: number | null;
  publish_date: Dayjs | null;
  publuu_account_id: number | null;
  publuu_flipbook_id: number | null;
  flipbook_url: string;
  short_description: string;
  status: IssueStatus;
  sort_order: number | null;
  is_featured: boolean;
  /** The cover's link; "" for none. */
  cover_image: string;
}

const NEW_ISSUE: FormValues = {
  title: "",
  slug: "",
  issue_number: null,
  publish_date: null,
  publuu_account_id: null,
  publuu_flipbook_id: null,
  flipbook_url: "",
  short_description: "",
  status: "published",
  sort_order: null,
  is_featured: false,
  cover_image: "",
};

const valuesOf = (issue: MagazineIssue): FormValues => {
  // The API answers the flipbook the website shows rather than its fields: Publuu's ids, or a link.
  const book = issue.flipbook;
  const publuu = book && "publuu_account_id" in book ? book : null;
  return {
    title: issue.title,
    slug: issue.slug,
    issue_number: issue.issue_number,
    publish_date: issue.publish_date ? dayjs(issue.publish_date) : null,
    publuu_account_id: publuu?.publuu_account_id ?? null,
    publuu_flipbook_id: publuu?.publuu_flipbook_id ?? null,
    flipbook_url: book && !publuu ? book.url : "",
    short_description: issue.short_description ?? "",
    status: issue.status,
    sort_order: issue.sort_order,
    is_featured: issue.is_featured,
    cover_image: issue.cover_image ?? "",
  };
};

const STATUSES: { value: IssueStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

interface DetailsProps {
  /** null while adding one. */
  issue: MagazineIssue | null;
  onSaved: (issue: MagazineIssue) => void;
}

/** The issue's own fields. Keyed by the issue, so a new form starts from its values. */
const IssueDetails = ({ issue, onSaved }: DetailsProps) => {
  const [form] = Form.useForm<FormValues>();
  const [saving, setSaving] = useState(false);

  const save = async (values: FormValues) => {
    const fields: IssueFields & { title: string } = {
      title: values.title.trim(),
      // Blank: made from the title on a new issue, kept on one being edited (a slug can't be cleared).
      ...(values.slug?.trim() ? { slug: values.slug.trim() } : {}),
      issue_number: values.issue_number ?? null,
      publish_date: values.publish_date ? values.publish_date.format("YYYY-MM-DD") : null,
      publuu_account_id: values.publuu_account_id ?? null,
      publuu_flipbook_id: values.publuu_flipbook_id ?? null,
      flipbook_url: values.flipbook_url?.trim() ?? "",
      short_description: values.short_description?.trim() ?? "",
      status: values.status,
      // Blank: the issue number, as the API gives a new issue sent without one.
      sort_order: values.sort_order ?? values.issue_number ?? 0,
      is_featured: values.is_featured,
      // Only a new or removed cover: the issues loaded from the old website keep their covers on its host, and the API
      // takes back only images uploaded to it.
      ...(values.cover_image !== (issue?.cover_image ?? "") ? { cover_image: values.cover_image } : {}),
    };
    try {
      setSaving(true);
      const res = issue ? await UpdateIssue(issue.id, fields) : await CreateIssue(fields);
      const saved = res.data.data;
      if (issue) form.setFieldsValue(valuesOf(saved));
      message.success(issue ? "Issue saved" : "Issue added. Now add the people in it.");
      onSaved(saved);
    } catch (err) {
      message.error(showFieldError(form, err) || apiErrorMessage(err) || "Couldn't save the issue");
    } finally {
      setSaving(false);
    }
  };

  const numberInput = <InputNumber min={0} precision={0} controls={false} style={{ width: "100%" }} />;

  return (
    <Panel>
      <Form form={form} layout="vertical" initialValues={issue ? valuesOf(issue) : NEW_ISSUE} onFinish={save}>
        <Row gutter={24}>
          <Col xs={24} lg={16}>
            <Form.Item
              name="title"
              label="Title"
              rules={[
                { required: true, whitespace: true, message: "Give the issue a title" },
                { max: 150, message: "At most 150 characters" },
              ]}
            >
              <Input placeholder="e.g. Issue 118" />
            </Form.Item>
            <Form.Item
              name="slug"
              label="Slug"
              rules={[{ max: 100, message: "At most 100 characters" }]}
              extra={
                issue
                  ? "The issue's address: /magazine/<slug>. Links to the old address stop working when it changes."
                  : "The issue's address: /magazine/<slug>. Made from the title when left blank."
              }
            >
              <Input placeholder={issue ? undefined : "Made from the title"} />
            </Form.Item>
            <Row gutter={16}>
              <Col xs={24} sm={12}>
                <Form.Item name="issue_number" label="Issue number">
                  {numberInput}
                </Form.Item>
              </Col>
              <Col xs={24} sm={12}>
                <Form.Item name="publish_date" label="Publish date" extra="Shown on the issue's tile and page.">
                  <DatePicker format="MMM D, YYYY" style={{ width: "100%" }} />
                </Form.Item>
              </Col>
            </Row>
            <Form.Item
              name="short_description"
              label="Short description"
              extra="Shown under the cover on the issue's page."
            >
              <Input.TextArea autoSize={{ minRows: 3, maxRows: 8 }} />
            </Form.Item>
          </Col>
          <Col xs={24} lg={8}>
            <Form.Item name="cover_image" label="Cover" extra="The website shows covers 3:4; an upload is cropped to that.">
              <ImageUploadField aspect={3 / 4} previewWidth={180} />
            </Form.Item>
          </Col>
        </Row>

        <h4 className={styles.sectionTitle}>Flipbook</h4>
        <p className={styles.sectionHint}>
          What "Read the digital edition" opens: a Publuu flipbook (both ids are in its link,
          publuu.com/flip-book/&lt;account id&gt;/&lt;flipbook id&gt;), or a link of its own.
        </p>
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="publuu_account_id" label="Publuu account id">
              {numberInput}
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="publuu_flipbook_id" label="Publuu flipbook id">
              {numberInput}
            </Form.Item>
          </Col>
          <Col xs={24} lg={8}>
            <Form.Item
              name="flipbook_url"
              label="Flipbook link"
              extra="Used instead of the Publuu ids when given."
              rules={[{ pattern: /^https:\/\/\S+$/i, message: "An https:// link" }]}
            >
              <Input placeholder="https://" />
            </Form.Item>
          </Col>
        </Row>

        <h4 className={styles.sectionTitle}>On the website</h4>
        <Row gutter={16}>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item name="status" label="Status" extra="Drafts aren't on the site.">
              <Radio.Group optionType="button" options={STATUSES} />
            </Form.Item>
          </Col>
          <Col xs={24} sm={12} lg={8}>
            <Form.Item
              name="sort_order"
              label="Sort order"
              extra="The magazine lists issues highest first. Blank: the issue number."
            >
              {numberInput}
            </Form.Item>
          </Col>
          <Col xs={24} lg={8}>
            <Form.Item name="is_featured" label="Featured" valuePropName="checked">
              <Switch />
            </Form.Item>
          </Col>
        </Row>

        <div className={styles.actions}>
          <Button type="primary" htmlType="submit" loading={saving}>
            {issue ? "Save issue" : "Add issue"}
          </Button>
        </div>
      </Form>
    </Panel>
  );
};

type Load = "loading" | "ready" | "missing" | "failed";

/** Adding an issue (/magazine/add) or editing one (/magazine/edit/:id), with the people in it. */
const IssueForm = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [issue, setIssue] = useState<MagazineIssue | null>(null);
  const [load, setLoad] = useState<Load>(id ? "loading" : "ready");
  const [attempt, setAttempt] = useState(0);

  useEffect(() => {
    if (!id) {
      setIssue(null);
      setLoad("ready");
      return;
    }
    let current = true;
    setLoad("loading");
    GetIssue(id)
      .then((res) => {
        if (!current) return;
        setIssue(res.data.data);
        setLoad("ready");
      })
      .catch((err) => {
        if (!current) return;
        if (apiErrorStatus(err) === 404) {
          setLoad("missing");
          return;
        }
        console.error("Error loading the issue:", err);
        message.error(apiErrorMessage(err) || "Couldn't load the issue");
        setLoad("failed");
      });
    return () => {
      current = false;
    };
  }, [id, attempt]);

  const saved = (next: MagazineIssue) => {
    if (id) setIssue(next);
    // A new issue opens for editing, where its people are set.
    else navigate(`/magazine/edit/${next.id}`, { replace: true });
  };

  return (
    <div>
      <PageHeader
        title={id ? (issue?.title ?? "Issue") : "Add issue"}
        subtitle={id ? "The issue and the people in it." : "The people in it are set once it's added."}
        back="/magazine"
        extra={
          issue && (
            <Button
              icon={<ExportOutlined />}
              href={websiteUrl(`/magazine/${issue.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              disabled={issue.status !== "published"}
              title={issue.status === "published" ? undefined : "Drafts aren't on the site"}
            >
              View on site
            </Button>
          )
        }
      />
      {load === "loading" && (
        <Panel>
          <Skeleton active />
        </Panel>
      )}
      {load === "missing" && (
        <Panel>
          <Empty description="There's no such issue. It may have been deleted.">
            <Button onClick={() => navigate("/magazine")}>Back to the magazine</Button>
          </Empty>
        </Panel>
      )}
      {load === "failed" && (
        <Panel>
          <Empty description="Couldn't load the issue.">
            <Button onClick={() => setAttempt((n) => n + 1)}>Try again</Button>
          </Empty>
        </Panel>
      )}
      {load === "ready" && (
        <>
          <IssueDetails key={`details-${issue?.id ?? "new"}`} issue={issue} onSaved={saved} />
          {issue && <IssueFeaturesForm key={`people-${issue.id}`} issue={issue} onSaved={setIssue} />}
        </>
      )}
    </div>
  );
};

export default IssueForm;
