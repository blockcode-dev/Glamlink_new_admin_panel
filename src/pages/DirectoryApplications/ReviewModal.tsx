import React, { useRef, useState } from "react";
import { Alert, Form, Input, Modal, message } from "antd";
import { ReviewDirectoryApplication } from "../../services/Api/DirectoryApplicationsApi";
import { apiErrorMessage } from "../../utils/apiError";
import { showFieldError } from "../../utils/formErrors";
import type { DirectoryApplication, DirectoryApplicationReview } from "../../types/directoryApplication";
import { googleMapsUrl } from "./listing";
import styles from "./DirectoryApplications.module.scss";

/** The decisions an admin can make: approve (as a professional or a brand), reject, or move back to pending. */
export type ReviewAction = "approve" | "brand" | "reject" | "pending";

const REQUESTS: Record<ReviewAction, Omit<DirectoryApplicationReview, "note">> = {
  approve: { status: "approved" },
  brand: { status: "approved", professional_type: "brand" },
  reject: { status: "rejected" },
  pending: { status: "pending" },
};

const OK_TEXT: Record<ReviewAction, string> = {
  approve: "Approve",
  brand: "Approve as brand",
  reject: "Reject",
  pending: "Move back to pending",
};

/** What happened, for the message once it's saved. */
const doneText = (action: ReviewAction, application: DirectoryApplication, wasLinked: boolean) => {
  if (action === "reject") return "Rejected";
  if (action === "pending") return "Moved back to pending";
  const approved = action === "brand" ? "Approved as a brand" : "Approved";
  return wasLinked ? approved : `${approved}. ${application.email} was emailed how to sign in.`;
};

/** Approving a claim on a Google listing takes it out of Google's results: the handoff asks for a check first. */
export const GoogleClaimAlert = ({ placeId }: { placeId: string }) => (
  <Alert
    type="warning"
    showIcon
    className={styles.notice}
    title="This application claims a Google listing"
    description={
      <>
        Check that the claim is genuine before approving: compare the email and phone in the application with{" "}
        <a href={googleMapsUrl(placeId)} target="_blank" rel="noreferrer">
          the listing on Google Maps
        </a>
        . Once approved, the listing leaves the Google results on the directory and the applicant's profile shows
        instead.
      </>
    }
  />
);

const Explanation = ({ action, application }: { action: ReviewAction; application: DirectoryApplication }) => {
  const { name, email, user_id: linkedTo, status } = application;
  const wasApproved = status === "approved";
  const pageGoes =
    "the page made from it goes too unless the account has a live Access card. The account stays linked.";

  if (action === "reject") {
    return (
      <ul className={styles.explain}>
        <li>Only admins see the note; {name} isn't emailed.</li>
        {wasApproved && <li>The listing leaves the directory, and {pageGoes}</li>}
      </ul>
    );
  }
  if (action === "pending") {
    return (
      <ul className={styles.explain}>
        <li>It waits for review again; {name} isn't emailed.</li>
        {wasApproved && <li>Until it's approved again the listing is off the directory, and {pageGoes}</li>}
        {linkedTo !== null && <li>Approving it again sends no email: its account is already linked.</li>}
      </ul>
    );
  }
  return (
    <ul className={styles.explain}>
      <li>Lists {name} on the website's directory, and their account gets a public page made from this listing.</li>
      {linkedTo !== null ? (
        <li>It's already linked to account #{linkedTo}, which stays linked; no email is sent this time.</li>
      ) : (
        <>
          <li>
            Finds the Glamlink account for {email}, or makes one, and links it to this listing (an app account becomes a
            professional one).
          </li>
          <li>
            Emails {email} once: a link to set a password (valid 7 days), or to sign in if the account has one. From
            their dashboard they keep the listing up to date.
          </li>
        </>
      )}
      {action === "brand" && linkedTo === null && (
        <li>
          As a brand, a new or app account becomes a brand's, named after the business at the listing's main location
          {application.business_name ? (
            <>
              : <strong>{application.business_name}</strong>.
            </>
          ) : (
            `. None is given, so it goes by ${name}.`
          )}{" "}
          An account that is already a professional's keeps its type.
        </li>
      )}
      <li>
        Makes no Access card.
        {application.wants_access_card && " They asked for the free card: they can make it from their dashboard."}
      </li>
    </ul>
  );
};

interface ReviewModalProps {
  application: DirectoryApplication;
  /** The decision being confirmed; closed when null. */
  action: ReviewAction | null;
  onClose: () => void;
  /** Saved: the application as the API answered it. */
  onReviewed: (application: DirectoryApplication) => void;
  /** It failed, perhaps part-way (the status is saved before the account is made): reload to see where it stands. */
  onFailed: () => void;
}

/** Confirms a review decision, says what it will do, and takes a note (required to reject). */
const ReviewModal = ({ application, action, onClose, onReviewed, onFailed }: ReviewModalProps) => {
  const [form] = Form.useForm<{ note?: string }>();
  const [saving, setSaving] = useState(false);
  // Keeps the content while the dialog closes.
  const last = useRef<ReviewAction>("approve");
  if (action) last.current = action;
  const shown = action ?? last.current;
  const approving = shown === "approve" || shown === "brand";

  const submit = async () => {
    let note = "";
    try {
      note = (await form.validateFields()).note?.trim() ?? "";
    } catch {
      return; // the form shows what's missing
    }
    setSaving(true);
    try {
      const wasLinked = application.user_id !== null;
      const res = await ReviewDirectoryApplication(application.id, { ...REQUESTS[shown], ...(note ? { note } : {}) });
      message.success(doneText(shown, res.data.data, wasLinked));
      onReviewed(res.data.data);
    } catch (err) {
      message.error(showFieldError(form, err) ?? (apiErrorMessage(err) || "Couldn't update the application"));
      onFailed();
    } finally {
      setSaving(false);
    }
  };

  const title =
    shown === "brand"
      ? `Approve ${application.business_name || application.name} as a brand?`
      : shown === "approve"
        ? `Approve ${application.name}?`
        : shown === "reject"
          ? `Reject ${application.name}?`
          : `Move ${application.name} back to pending?`;

  return (
    <Modal
      open={action !== null}
      title={title}
      okText={OK_TEXT[shown]}
      okButtonProps={{ danger: shown === "reject" }}
      confirmLoading={saving}
      onOk={submit}
      onCancel={onClose}
      destroyOnHidden
      width={600}
    >
      <Explanation action={shown} application={application} />
      {approving && application.place_id && <GoogleClaimAlert placeId={application.place_id} />}
      <Form form={form} layout="vertical" preserve={false} style={{ marginTop: 16 }}>
        <Form.Item
          name="note"
          label={shown === "reject" ? "Why it's rejected (only admins see this)" : "Note (optional; only admins see it)"}
          extra={application.review_note ? "Replaces the current note." : undefined}
          rules={shown === "reject" ? [{ required: true, whitespace: true, message: "Say why it's rejected" }] : []}
        >
          <Input.TextArea rows={3} maxLength={500} showCount />
        </Form.Item>
      </Form>
    </Modal>
  );
};

export default ReviewModal;
