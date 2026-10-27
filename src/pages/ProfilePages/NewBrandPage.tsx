import React, { useState } from "react";
import { useNavigate } from "react-router";
import { Alert, Button, Form, Input, message } from "antd";
import PageHeader, { Panel } from "../../components/PageHeader";
import { CreateBrandPage } from "../../services/Api/ProfilesApi";
import { apiErrorBody, apiErrorCode, apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import PageFields from "./PageFields";
import { LIMITS, NEW_PAGE_VALUES, toPageUpdate, type PageFormValues } from "./pageForm";
import type { PageRouteState } from "./pageStatus";
import styles from "./ProfilePages.module.scss";

interface NewBrandValues extends PageFormValues {
  name: string;
  email: string;
}

const INITIAL_VALUES: NewBrandValues = { ...NEW_PAGE_VALUES, name: "", email: "" };

/**
 * "New brand page" (route /pages/new): a page for a brand with no Glamlink login yet. The API makes the brand's
 * account without a password; the page shows without an Access card, and the brand claims it from an email.
 */
const NewBrandPage = () => {
  const navigate = useNavigate();
  const [form] = Form.useForm<NewBrandValues>();
  const [saving, setSaving] = useState(false);
  // The account that already has the email given (409 ACCOUNT_EXISTS): edit its page instead.
  const [existingId, setExistingId] = useState<number | string | null>(null);

  const create = async ({ name, email, ...page }: NewBrandValues) => {
    setSaving(true);
    setExistingId(null);
    try {
      const res = await CreateBrandPage({ name: name.trim(), email: email.trim(), ...toPageUpdate(page, "") });
      message.success("Brand page created");
      // A new brand account has no password: the page's screen offers the claim email.
      const state: PageRouteState = { claimed: false, created: true };
      navigate(`/pages/${res.data.data.user_id}`, { state });
    } catch (err) {
      if (apiErrorCode(err) === "ACCOUNT_EXISTS") {
        setExistingId(apiErrorBody(err)?.details?.user_id ?? null);
        form.setFields([{ name: "email", errors: ["This email already has an account"] }]);
        form.scrollToField("email", { block: "center" });
        return;
      }
      const fieldError = apiErrorCode(err) === "INVALID_PAGE" ? showFieldError(form, err) : null;
      message.error(fieldError || apiErrorMessage(err) || "Couldn't create the brand page");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div>
      <PageHeader
        title="New brand page"
        subtitle="For a brand with no Glamlink login yet. Its page shows without an Access card; send it a claim email when it should sign in and edit the page itself."
        back="/pages"
      />
      <Panel>
        <Form<NewBrandValues>
          form={form}
          layout="vertical"
          initialValues={INITIAL_VALUES}
          onFinish={create}
          onValuesChange={(changed: Partial<NewBrandValues>) => {
            if ("email" in changed) setExistingId(null);
          }}
          scrollToFirstError
          className={styles.form}
        >
          <h4 className={styles.sectionTitle}>The brand</h4>
          <div className={styles.twoColumns}>
            <Form.Item
              name="name"
              label="Brand name"
              rules={[{ required: true, whitespace: true, message: "Enter the brand's name" }]}
              extra="The page's title. The brand's account gets this name too."
            >
              <Input maxLength={LIMITS.name} />
            </Form.Item>
            <Form.Item
              name="email"
              label="Email"
              rules={[
                { required: true, whitespace: true, message: "Enter the brand's email" },
                { type: "email", message: "Enter a valid email address" },
              ]}
              extra="The brand signs in with it, and the claim email goes there. It can't have a Glamlink account yet."
            >
              <Input type="email" />
            </Form.Item>
          </div>
          {existingId !== null && (
            <Alert
              type="warning"
              showIcon
              title="This email already has an account"
              description="A brand page is made with a new account, so this email can't be used. If that account is a professional or a brand, edit its page instead."
              action={<Button onClick={() => navigate(`/pages/${existingId}`)}>Open its page</Button>}
              className={styles.block}
            />
          )}

          <PageFields fallbacks={null} savedSlug="" creating />

          <div className={styles.formActions}>
            <Button type="primary" htmlType="submit" loading={saving}>
              Create brand page
            </Button>
            <Button onClick={() => navigate("/pages")} disabled={saving}>
              Cancel
            </Button>
          </div>
        </Form>
      </Panel>
    </div>
  );
};

export default NewBrandPage;
