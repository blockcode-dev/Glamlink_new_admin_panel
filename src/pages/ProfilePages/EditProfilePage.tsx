import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router";
import { Alert, Button, Empty, Form, Space, Spin, Tag, message } from "antd";
import { BarChartOutlined, ExportOutlined } from "@ant-design/icons";
import PageHeader, { Panel } from "../../components/PageHeader";
import { GetPage, UpdatePage } from "../../services/Api/ProfilesApi";
import { apiErrorCode, apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { PageView } from "../../types/profile";
import ClaimEmailButton from "./ClaimEmailButton";
import PageFields from "./PageFields";
import { fallbacksOf, toFormValues, toPageUpdate, type PageFormValues } from "./pageForm";
import {
  TYPE_COLOR,
  TYPE_LABEL,
  hiddenReasons,
  publicPageUrl,
  shortUrl,
  usePageRouteState,
  type PageRouteState,
} from "./pageStatus";
import styles from "./ProfilePages.module.scss";

/** Whether the page shows on the website, why not, and the links to it and its card. */
const PageStatus = ({ view }: { view: PageView }) => {
  const card = view.public.access_card;
  const notes: string[] = [];
  if (view.page.created_by_admin) notes.push("A brand page an admin made: it shows without an Access card.");
  if (view.public.listing) {
    notes.push("It has an approved directory listing, which fills in what the page and the card leave empty.");
  }
  const links = (
    <div className={styles.statusLinks}>
      {view.visible && view.slug && (
        <a href={publicPageUrl(view.slug)} target="_blank" rel="noopener noreferrer">
          {shortUrl(publicPageUrl(view.slug))} <ExportOutlined />
        </a>
      )}
      {card ? (
        <a href={card.url} target="_blank" rel="noopener noreferrer">
          Access card <ExportOutlined />
        </a>
      ) : (
        <span className={styles.muted}>No live Access card</span>
      )}
    </div>
  );
  const description = (
    <>
      {!view.visible && (
        <ul className={styles.reasons}>
          {hiddenReasons(view).map((reason) => (
            <li key={reason}>{reason}</li>
          ))}
        </ul>
      )}
      {notes.map((note) => (
        <div key={note}>{note}</div>
      ))}
      {links}
    </>
  );
  return (
    <Alert
      type={view.visible ? "success" : "warning"}
      showIcon
      title={view.visible ? "Shown on the website" : "Hidden from the website"}
      description={description}
      className={styles.block}
    />
  );
};

const PageScreen = ({ userId }: { userId: string }) => {
  const navigate = useNavigate();
  const routeState = usePageRouteState();
  const [form] = Form.useForm<PageFormValues>();
  const [view, setView] = useState<PageView | null>(null);
  const [problem, setProblem] = useState<"not_found" | "failed" | null>(() =>
    /^\d+$/.test(userId) ? null : "not_found",
  );
  const [saving, setSaving] = useState(false);
  // Whether the account has a password: only the list knows, so it's unknown when the page was opened directly.
  const [claimed, setClaimed] = useState(routeState.claimed);
  const back = routeState.from ?? "/pages";

  useEffect(() => {
    if (!/^\d+$/.test(userId)) return;
    let current = true;
    GetPage(userId)
      .then((res) => {
        if (current) setView(res.data.data);
      })
      .catch((err) => {
        if (!current) return;
        console.error("Error loading the page:", err);
        if (apiErrorStatus(err) === 404) setProblem("not_found");
        else {
          setProblem("failed");
          message.error(apiErrorMessage(err) || "Couldn't load the page");
        }
      });
    return () => {
      current = false;
    };
  }, [userId]);

  const save = async (values: PageFormValues) => {
    if (!view) return;
    setSaving(true);
    try {
      const res = await UpdatePage(view.user_id, toPageUpdate(values, view.slug ?? ""));
      setView(res.data.data);
      // The API cleans what it saves (links get https://, the address is written as a slug): show that.
      form.setFieldsValue(toFormValues(res.data.data));
      message.success("Page saved");
    } catch (err) {
      const fieldError = apiErrorCode(err) === "INVALID_PAGE" ? showFieldError(form, err) : null;
      message.error(fieldError || apiErrorMessage(err) || "Couldn't save the page");
    } finally {
      setSaving(false);
    }
  };

  if (problem || !view) {
    return (
      <div>
        <PageHeader title="Page" back={back} />
        <Panel>
          {problem === "not_found" ? (
            <Empty
              description="No page for this account. Only active professional and brand accounts have one: this one may have been deleted, merged into another or be a client's."
            />
          ) : problem === "failed" ? (
            <Empty description="The page couldn't be loaded. Try again in a moment." />
          ) : (
            <div className={styles.panelBody}>
              <Spin />
            </div>
          )}
        </Panel>
      </div>
    );
  }

  const { public: shown } = view;
  const nextState: PageRouteState = { claimed, from: routeState.from };
  const claimButton = (type?: "primary") => (
    <ClaimEmailButton userId={view.user_id} type={type} onClaimed={() => setClaimed(true)} />
  );

  return (
    <div>
      <PageHeader
        title={shown.name || `Account #${view.user_id}`}
        subtitle={
          <Space size={6} wrap>
            {shown.type && <Tag color={TYPE_COLOR[shown.type]}>{TYPE_LABEL[shown.type]}</Tag>}
            {claimed === false && <Tag color="gold">Unclaimed</Tag>}
            <span>Account #{view.user_id}</span>
          </Space>
        }
        back={back}
        extra={
          <>
            <Button
              icon={<BarChartOutlined />}
              onClick={() => navigate(`/pages/${view.user_id}/analytics`, { state: nextState })}
            >
              Analytics
            </Button>
            {view.visible && view.slug && (
              <Button icon={<ExportOutlined />} href={publicPageUrl(view.slug)} target="_blank" rel="noopener noreferrer">
                View on site
              </Button>
            )}
            {claimed !== true && !routeState.created && claimButton()}
          </>
        }
      />

      {routeState.created && claimed !== true && (
        <Alert
          type="success"
          showIcon
          title="Brand page created"
          description="It shows on the website without an Access card. When the brand is ready, send it a claim email so it can sign in and edit its page."
          action={claimButton("primary")}
          className={styles.block}
        />
      )}

      <PageStatus view={view} />

      <Panel>
        <Form<PageFormValues>
          form={form}
          layout="vertical"
          initialValues={toFormValues(view)}
          onFinish={save}
          scrollToFirstError
          className={styles.form}
        >
          <PageFields fallbacks={fallbacksOf(view)} savedSlug={view.slug ?? ""} />
          <div className={styles.formActions}>
            <Button type="primary" htmlType="submit" loading={saving}>
              Save page
            </Button>
            <Button onClick={() => form.resetFields()} disabled={saving}>
              Undo changes
            </Button>
          </div>
        </Form>
      </Panel>
    </div>
  );
};

/**
 * One page's screen (route /pages/:userId): how it stands, and the fields an admin sets on it. Another account's id
 * starts a fresh screen, so no form value carries over.
 */
const EditProfilePage = () => {
  const { userId = "" } = useParams();
  return <PageScreen key={userId} userId={userId} />;
};

export default EditProfilePage;
