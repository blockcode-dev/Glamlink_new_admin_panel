import React, { useCallback, useEffect, useState } from "react";
import { Button, Descriptions, Image, Modal, Result, Spin, Tag, message, type DescriptionsProps } from "antd";
import {
  CheckOutlined,
  CloseOutlined,
  DeleteOutlined,
  EditOutlined,
  ExportOutlined,
  RollbackOutlined,
  ShopOutlined,
} from "@ant-design/icons";
import { Link, useLocation, useNavigate } from "react-router";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import {
  DeleteDirectoryApplications,
  GetDirectoryApplication,
} from "../../services/Api/DirectoryApplicationsApi";
import { GetPage } from "../../services/Api/ProfilesApi";
import { apiErrorCode, apiErrorMessage, apiErrorStatus } from "../../utils/apiError";
import { useIdParam } from "../../utils/routing";
import { websiteUrl } from "../../utils/website";
import type { DirectoryApplication } from "../../types/directoryApplication";
import type { PageView } from "../../types/profile";
import {
  STATUS_COLORS,
  STATUS_LABELS,
  editPath,
  galleryOf,
  googleMapsUrl,
  handleOf,
  hourNotes,
  linkFor,
  listUrlFrom,
  locationTypeLabel,
  locationsOf,
  placeOf,
  socialLinksOf,
  textList,
} from "./listing";
import ReviewModal, { GoogleClaimAlert, type ReviewAction } from "./ReviewModal";
import { useAdminNames } from "./useAdminNames";
import styles from "./DirectoryApplications.module.scss";

const dash = <span className={styles.muted}>-</span>;

const dateTime = (date: string) => dayjs(date).format("MMM D, YYYY [at] h:mm A");

/** A link the admin can open, or the text as sent when it isn't a web link. */
const WebLink = ({ value }: { value: string | null }) => {
  if (!value) return dash;
  const url = linkFor(value);
  return url ? (
    <a href={url} target="_blank" rel="noreferrer">
      {value}
    </a>
  ) : (
    <>{value}</>
  );
};

const TextItems = ({ items }: { items: string[] }) =>
  items.length ? (
    <ul className={styles.bulleted}>
      {items.map((item, i) => (
        <li key={i}>{item}</li>
      ))}
    </ul>
  ) : (
    dash
  );

const yesNo = (value: boolean) => (value ? "Yes" : "No");

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <Panel>
    <h4 className={styles.sectionTitle}>{title}</h4>
    {children}
  </Panel>
);

const descriptionProps: DescriptionsProps = { bordered: true, size: "small", column: { xs: 1, md: 2 } };

/** One application: every field it holds, and the review. */
const ViewDirectoryApplication = () => {
  const id = useIdParam();
  const navigate = useNavigate();
  const back = listUrlFrom(useLocation().state);
  const [application, setApplication] = useState<DirectoryApplication | null>(null);
  const [state, setState] = useState<"loading" | "ready" | "missing" | "failed">("loading");
  const [action, setAction] = useState<ReviewAction | null>(null);
  const [page, setPage] = useState<PageView | null>(null);
  const reviewerName = useAdminNames();

  const load = useCallback(async () => {
    try {
      const res = await GetDirectoryApplication(id);
      setApplication(res.data.data);
      setState("ready");
    } catch (err) {
      if (apiErrorStatus(err) === 404 || apiErrorCode(err) === "NOT_FOUND") {
        setState("missing");
      } else {
        console.error("Error loading the directory application:", err);
        message.error(apiErrorMessage(err) || "Couldn't load the application");
        setState((s) => (s === "ready" ? s : "failed"));
      }
    }
  }, [id]);

  useEffect(() => {
    setState("loading");
    load();
  }, [load]);

  // The linked account's public page, for a "view on the website" link.
  const userId = application?.user_id ?? null;
  const status = application?.status;
  useEffect(() => {
    setPage(null);
    if (userId === null) return;
    let current = true;
    GetPage(userId)
      .then((res) => {
        if (current) setPage(res.data.data);
      })
      .catch(() => {
        // No page for it: only the account link shows.
      });
    return () => {
      current = false;
    };
  }, [userId, status]);

  const remove = () => {
    if (!application) return;
    Modal.confirm({
      title: "Delete this application?",
      content: [
        "Its photos are deleted too. This can't be undone.",
        application.status === "approved"
          ? "It leaves the directory, and the page made from it goes too unless the account has a live Access card. The account stays."
          : "",
      ].join(" "),
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await DeleteDirectoryApplications([application.id]);
          message.success("Application deleted");
          navigate(back);
        } catch (err) {
          message.error(apiErrorMessage(err) || "Couldn't delete the application");
        }
      },
    });
  };

  if (state === "loading" || (state === "ready" && !application)) {
    return (
      <div style={{ textAlign: "center", padding: 48 }}>
        <Spin />
      </div>
    );
  }
  if (state === "missing" || state === "failed" || !application) {
    return (
      <Result
        status={state === "missing" ? "404" : "error"}
        title={state === "missing" ? "This application doesn't exist" : "Couldn't load the application"}
        subTitle={state === "missing" ? "It may have been deleted." : undefined}
        extra={
          <>
            {state === "failed" && (
              <Button
                type="primary"
                onClick={() => {
                  setState("loading");
                  load();
                }}
              >
                Try again
              </Button>
            )}
            <Button onClick={() => navigate(back)}>Back to directory applications</Button>
          </>
        }
      />
    );
  }

  const a = application;
  const reviewer = reviewerName(a.reviewed_by);
  const locations = locationsOf(a.locations);
  const hours = hourNotes(a.business_hours);
  const social = socialLinksOf(a.social_media);
  const gallery = galleryOf(a.gallery);
  const specialties = textList(a.specialties);
  const hasCoordinates = a.latitude !== null && a.longitude !== null;

  const reviewButtons = (
    <div className={styles.reviewBar}>
      {a.status !== "approved" && (
        <Button type="primary" icon={<CheckOutlined />} onClick={() => setAction("approve")}>
          Approve
        </Button>
      )}
      {a.status !== "approved" && a.user_id === null && (
        <Button icon={<ShopOutlined />} onClick={() => setAction("brand")}>
          Approve as brand
        </Button>
      )}
      {a.status !== "rejected" && (
        <Button danger icon={<CloseOutlined />} onClick={() => setAction("reject")}>
          Reject
        </Button>
      )}
      {a.status !== "pending" && (
        <Button icon={<RollbackOutlined />} onClick={() => setAction("pending")}>
          Move back to pending
        </Button>
      )}
    </div>
  );

  return (
    <div>
      <PageHeader
        title={a.name}
        subtitle={`Submitted ${dateTime(a.created_at)}`}
        back={back}
        extra={
          <>
            <Button icon={<EditOutlined />} onClick={() => navigate(editPath(a.id), { state: { list: back } })}>
              Edit
            </Button>
            <Button danger icon={<DeleteOutlined />} onClick={remove}>
              Delete
            </Button>
          </>
        }
      />

      <Section title="Review">
        <Descriptions
          {...descriptionProps}
          items={[
            {
              key: "status",
              label: "Status",
              children: (
                <>
                  <Tag color={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status] ?? a.status}</Tag>
                  {a.reviewed_at && (
                    <span className={styles.muted}>
                      {reviewer ? `by ${reviewer} ` : ""}on {dateTime(a.reviewed_at)}
                    </span>
                  )}
                </>
              ),
            },
            { key: "note", label: "Review note", children: a.review_note || dash },
            {
              key: "account",
              label: "Account",
              children:
                a.user_id !== null ? (
                  <>
                    <Link to={`/viewProfessionals/${a.user_id}`}>Account #{a.user_id}</Link>
                    {page?.visible && page.slug && (
                      <>
                        {" · "}
                        <a href={websiteUrl(`/profiles/${page.slug}`)} target="_blank" rel="noreferrer">
                          Page on the website <ExportOutlined />
                        </a>
                      </>
                    )}
                  </>
                ) : (
                  <span className={styles.muted}>Made or found for the email when it's approved</span>
                ),
            },
            { key: "updated", label: "Last changed", children: dateTime(a.updated_at) },
            ...(a.ip_address ? [{ key: "ip", label: "Sent from IP", children: a.ip_address }] : []),
          ]}
        />
        {a.status !== "approved" && (
          <>
            {a.place_id && (
              <div style={{ marginTop: 12 }}>
                <GoogleClaimAlert placeId={a.place_id} />
              </div>
            )}
            <p className={styles.sectionHint} style={{ margin: "12px 4px 0" }}>
              {a.user_id === null
                ? `Approving lists them on the website's directory, makes or finds the account for ${a.email}, links it and emails them how to sign in (once). It makes no Access card.`
                : `Approving lists them on the website's directory again. Account #${a.user_id} stays linked, so no email is sent.`}
            </p>
          </>
        )}
        {reviewButtons}
      </Section>

      <Section title="Profile">
        <Descriptions
          {...descriptionProps}
          items={[
            {
              key: "photo",
              label: "Profile photo",
              span: "filled",
              children: a.profile_image ? (
                <Image src={a.profile_image} width={96} height={96} style={{ objectFit: "cover", borderRadius: 8 }} alt="" />
              ) : (
                dash
              ),
            },
            { key: "name", label: "Name", children: a.name },
            { key: "title", label: "Professional title", children: a.professional_title || dash },
            { key: "email", label: "Email", children: <a href={`mailto:${a.email}`}>{a.email}</a> },
            { key: "phone", label: "Phone", children: a.phone ? <a href={`tel:${a.phone}`}>{a.phone}</a> : dash },
            { key: "handle", label: "Handle", children: handleOf(a.custom_handle) || dash },
            { key: "website", label: "Website", children: <WebLink value={a.website} /> },
            { key: "method", label: "Booking method", children: a.preferred_booking_method || dash },
            { key: "booking", label: "Booking link", children: <WebLink value={a.booking_link} /> },
            { key: "primary_specialty", label: "Primary specialty", children: a.primary_specialty || dash },
            {
              key: "specialties",
              label: "Specialties",
              children: specialties.length ? (
                <div className={styles.tags}>
                  {specialties.map((s, i) => (
                    <Tag key={i}>{s}</Tag>
                  ))}
                </div>
              ) : (
                dash
              ),
            },
            {
              key: "bio",
              label: "Bio",
              span: "filled",
              children: a.bio ? <div className={styles.bio}>{a.bio}</div> : dash,
            },
          ]}
        />
      </Section>

      <Section title="Locations and hours">
        <Descriptions
          {...descriptionProps}
          items={[
            { key: "business", label: "Business (main location)", children: a.business_name || dash },
            { key: "place", label: "City and state", children: placeOf(a) || dash },
            {
              key: "coordinates",
              label: "Coordinates",
              children: hasCoordinates ? `${a.latitude}, ${a.longitude}` : <span className={styles.muted}>None yet</span>,
            },
            {
              key: "google",
              label: "Google listing claimed",
              children: a.place_id ? (
                <a href={googleMapsUrl(a.place_id)} target="_blank" rel="noreferrer">
                  {a.place_id} <ExportOutlined />
                </a>
              ) : (
                "None"
              ),
            },
            { key: "hours", label: "Business hours", span: "filled", children: <TextItems items={hours} /> },
          ]}
        />
        {locations.length > 0 && (
          <div className={styles.locationGrid} style={{ marginTop: 12 }}>
            {locations.map((l, i) => (
              <div key={i} className={styles.locationCard}>
                <div className={styles.locationHeader}>
                  <span>{l.label || `Location ${i + 1}`}</span>
                  <span>
                    {l.is_primary && <Tag color="blue">Main</Tag>}
                    {l.location_type && <Tag>{locationTypeLabel(l.location_type)}</Tag>}
                  </span>
                </div>
                {l.business_name && <div>{l.business_name}</div>}
                {l.address && <div className={styles.locationLine}>{l.address}</div>}
                {(l.city || l.state) && (
                  <div className={styles.locationLine}>{[l.city, l.state].filter(Boolean).join(", ")}</div>
                )}
                {l.phone && <div className={styles.locationLine}>{l.phone}</div>}
                {l.description && <div className={`${styles.locationLine} ${styles.bio}`}>{l.description}</div>}
              </div>
            ))}
          </div>
        )}
      </Section>

      <Section title="Social media and offer">
        <Descriptions
          {...descriptionProps}
          items={[
            ...(social.length
              ? social.map((link) => ({
                  key: `social-${link.key}`,
                  label: link.label,
                  children: link.url ? (
                    <a href={link.url} target="_blank" rel="noreferrer">
                      {link.value}
                    </a>
                  ) : (
                    link.value
                  ),
                }))
              : [{ key: "social", label: "Social media", children: dash }]),
            {
              key: "offer",
              label: "Offer",
              span: "filled",
              children: a.offer_promotion ? a.promotion_details || "Yes, no details given" : "No",
            },
          ]}
        />
      </Section>

      <Section title={`Gallery (${gallery.length})`}>
        {gallery.length ? (
          <Image.PreviewGroup>
            <div className={styles.photoGrid}>
              {gallery.map((photo) => (
                <div key={photo.url} className={styles.photoTile}>
                  <Image
                    src={photo.url}
                    alt={photo.caption}
                    classNames={{ root: styles.photoRoot, image: styles.photoImage }}
                  />
                  <div className={styles.photoMeta}>
                    {photo.is_thumbnail && (
                      <span>
                        <Tag color="blue">Cover</Tag>
                      </span>
                    )}
                    <span className={styles.photoCaption}>{photo.caption || "No caption"}</span>
                  </div>
                </div>
              ))}
            </div>
          </Image.PreviewGroup>
        ) : (
          <span className={styles.muted}>No photos</span>
        )}
      </Section>

      <Section title="Answers on the form">
        <Descriptions
          {...descriptionProps}
          items={[
            {
              key: "excites",
              label: "What excites them about Glamlink",
              span: "filled",
              children: <TextItems items={textList(a.excites_about_glamlink)} />,
            },
            {
              key: "pain",
              label: "Biggest pain points",
              span: "filled",
              children: <TextItems items={textList(a.biggest_pain_points)} />,
            },
            {
              key: "elite",
              label: "The Elite Setup",
              children: `${yesNo(a.elite_setup)}${a.elite_setup ? ": the concierge team may build their profile from their public social media" : ""}`,
            },
            {
              key: "card",
              label: "Free digital card",
              children: a.wants_access_card ? "Wants one (approval makes none: they make it from their dashboard)" : "No",
            },
          ]}
        />
      </Section>

      <ReviewModal
        application={a}
        action={action}
        onClose={() => setAction(null)}
        onReviewed={(updated) => {
          setApplication(updated);
          setAction(null);
        }}
        onFailed={() => load()}
      />
    </div>
  );
};

export default ViewDirectoryApplication;
