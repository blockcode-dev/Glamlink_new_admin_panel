/** @format */

import React, { useEffect, useMemo, useState } from "react";
import {
  Button,
  Tag,
  Empty,
  Spin,
  message,
  Typography,
  Modal,
  Input,
  Checkbox,
  Avatar,
} from "antd";

import {
  ArrowLeftOutlined,
  EditOutlined,
  ShoppingOutlined,
  AudioOutlined,
  FileTextOutlined,
  UserOutlined,
  TagsOutlined,
  LinkOutlined,
  CalendarOutlined,
  PlusOutlined,
  CloseOutlined,
  SearchOutlined,
  EnvironmentOutlined,
  PictureOutlined,
} from "@ant-design/icons";

import { useNavigate } from "react-router";

import {
  GetJournalTopicById,
  GetJournalTopicParagraphs,
  UpdateJournalTopicProfessionals,
} from "../../services/Api/JournalApi";
import { GetProfessionals } from "../../services/Api/UserApi";
import styles from "./JournalTopicDetails.module.scss";
import { apiErrorMessage } from "../../utils/apiError";
import { useIdParam } from "../../utils/routing";
import SafeHtml from "../../components/SafeHtml";
import type { JournalTopic, TopicParagraph, TopicProfessional } from "../../types/journal";
import type { CardLink } from "../../types/businessCard";

const { Text } = Typography;

const statusColors: Record<string, string> = {
  published: "green",
  draft: "gold",
};

// Same section-card shell used on Add/Edit Journal — icon badge, title,
// optional hint, body, and now an optional right-aligned action slot.
const SectionCard = ({
  icon,
  title,
  hint,
  extra,
  children,
}: {
  icon: React.ReactNode;
  title: string;
  hint?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
}) => (
  <div className={styles.sectionCard}>
    <div className={styles.sectionHeader}>
      <div className={styles.sectionIcon}>{icon}</div>
      <div className={styles.sectionHeaderText}>
        <span className={styles.sectionTitle}>{title}</span>
        {hint && <span className={styles.sectionHint}>{hint}</span>}
      </div>
      {extra && <div className={styles.sectionExtra}>{extra}</div>}
    </div>
    <div className={styles.sectionBody}>{children}</div>
  </div>
);

const formatDate = (value: string | null | undefined) => {
  if (!value) return null;
  try {
    return new Date(value).toLocaleDateString(undefined, {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  } catch {
    return null;
  }
};

// Several business_card fields come back as JSON-encoded strings
// (specialties, other_links, featured_links) rather than real arrays.
const safeParseArray = <T,>(value: T[] | string | null | undefined): T[] => {
  if (Array.isArray(value)) return value;
  if (!value) return [];
  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
};

// Professional records show up in two different shapes depending on which
// endpoint supplied them: the topic's own "professionals" array (flat:
// id/email/name/business_card) vs. the general professionals list (nested
// under user_profile). These helpers normalize both.
const getProfessionalName = (p: TopicProfessional) =>
  p?.name || p?.user_profile?.name || p?.email || `User #${p?.id}`;

const getProfessionalEmail = (p: TopicProfessional) => p?.email || "";

const getBusinessCard = (p: TopicProfessional) => p?.business_card || null;

const getProfessionalImage = (p: TopicProfessional) =>
  p?.business_card?.profile_image ||
  p?.user_profile?.profile_image ||
  p?.profile_image ||
  null;

const JournalTopicDetails = () => {
  const id = useIdParam();
  const navigate = useNavigate();

  const [topic, setTopic] = useState<JournalTopic | null>(null);
  const [paragraphs, setParagraphs] = useState<TopicParagraph[]>([]);
  const [loading, setLoading] = useState(false);
  const [paragraphLoading, setParagraphLoading] = useState(false);

  // ---- Professionals management ----
  const [professionalsModalOpen, setProfessionalsModalOpen] = useState(false);
  const [allProfessionals, setAllProfessionals] = useState<TopicProfessional[]>([]);
  const [allProfessionalsLoading, setAllProfessionalsLoading] =
    useState(false);
  const [selectedProfessionalIds, setSelectedProfessionalIds] = useState<number[]>([]);
  const [professionalSearchTerm, setProfessionalSearchTerm] = useState("");
  const [savingProfessionals, setSavingProfessionals] = useState(false);

  // ---- Professional detail (business card) view ----
  const [viewingProfessional, setViewingProfessional] = useState<TopicProfessional | null>(null);

  // ==========================
  // Fetch Topic
  // ==========================

  const fetchTopic = async () => {
    try {
      setLoading(true);

      const result = await GetJournalTopicById(id);
      const data = result?.data?.data;

      setTopic(data);
    } catch (error) {
      console.error(error);

      message.error(
        apiErrorMessage(error) || "Failed to load topic details",
      );
    } finally {
      setLoading(false);
    }
  };

  // ==========================
  // Fetch Paragraphs
  // ==========================

  const fetchParagraphs = async () => {
    try {
      setParagraphLoading(true);

      const result = await GetJournalTopicParagraphs(id);
      const data = Array.isArray(result?.data?.data) ? result.data.data : [];

      setParagraphs(data);
    } catch (error) {
      console.error(error);

      message.error(
        apiErrorMessage(error) || "Failed to load topic paragraphs",
      );
    } finally {
      setParagraphLoading(false);
    }
  };

  useEffect(() => {
    fetchTopic();
    fetchParagraphs();
  }, [id]);

  // ==========================
  // Get Paragraph Text
  // ==========================

  const getParagraphText = (content: string | null | undefined, paragraphId: string | null) => {
    if (!content || !paragraphId) {
      return "-";
    }

    try {
      const parser = new DOMParser();
      const doc = parser.parseFromString(content, "text/html");
      const element = doc.querySelector(
        `[data-paragraph-id="${paragraphId}"]`,
      );

      return element?.textContent?.trim() || "-";
    } catch (error) {
      console.error(error);
      return "-";
    }
  };

  // ==========================
  // Professionals: fetch the full pool once, when the modal is first opened
  // ==========================

  const fetchAllProfessionals = async () => {
    try {
      setAllProfessionalsLoading(true);

      const result = await GetProfessionals({ page: 1, limit: 1000, sortBy: "DESC" });

      const rows = result?.data?.data?.rows || [];
      setAllProfessionals(rows);
    } catch (error) {
      console.error(error);
      message.error("Failed to load the list of professionals");
    } finally {
      setAllProfessionalsLoading(false);
    }
  };

  const openProfessionalsModal = () => {
    const currentIds = (topic?.professionals || []).map((p) => p.id);
    setSelectedProfessionalIds(currentIds);
    setProfessionalSearchTerm("");
    setProfessionalsModalOpen(true);

    if (allProfessionals.length === 0) {
      fetchAllProfessionals();
    }
  };

  const toggleProfessionalSelection = (professionalId: number) => {
    setSelectedProfessionalIds((prev) =>
      prev.includes(professionalId)
        ? prev.filter((pid) => pid !== professionalId)
        : [...prev, professionalId],
    );
  };

  // Selected professionals float to the top of the (search-filtered) list —
  // makes it much easier to see and adjust an already-large selection
  // instead of hunting for checked rows mixed into hundreds of others.
  const modalProfessionalList = useMemo(() => {
    const term = professionalSearchTerm.trim().toLowerCase();

    const filtered = term
      ? allProfessionals.filter((p) => {
          const name = getProfessionalName(p).toLowerCase();
          const email = getProfessionalEmail(p).toLowerCase();
          return name.includes(term) || email.includes(term);
        })
      : allProfessionals;

    return [...filtered].sort((a, b) => {
      const aSelected = selectedProfessionalIds.includes(a.id);
      const bSelected = selectedProfessionalIds.includes(b.id);
      if (aSelected === bSelected) return 0;
      return aSelected ? -1 : 1;
    });
  }, [allProfessionals, professionalSearchTerm, selectedProfessionalIds]);

  // ==========================
  // Professionals: persist the full desired list — the endpoint replaces
  // the WHOLE mapping for this topic, so both "add via modal" and "remove
  // one" both go through this same call with the complete target list.
  // ==========================

  const saveProfessionals = async (professionalIds: number[]) => {
    try {
      setSavingProfessionals(true);

      const result = await UpdateJournalTopicProfessionals(id, {
        professional_ids: professionalIds,
      });

      // The endpoint returns the full, refreshed topic — simplest way to
      // stay in sync with the server's actual state.
      const updatedTopic = result?.data?.data;
      if (updatedTopic) {
        setTopic(updatedTopic);
      }

      message.success("Professionals updated successfully");
      setProfessionalsModalOpen(false);
    } catch (error) {
      console.error(error);
      message.error(
        apiErrorMessage(error) || "Failed to update professionals",
      );
    } finally {
      setSavingProfessionals(false);
    }
  };

  const handleRemoveProfessional = (professional: TopicProfessional) => {
    Modal.confirm({
      title: "Remove professional from topic?",
      content: `${getProfessionalName(
        professional,
      )} will no longer be linked to this topic.`,
      okText: "Remove",
      okType: "danger",
      cancelText: "Cancel",
      onOk: () => {
        const remainingIds = (topic?.professionals || [])
          .map((p) => p.id)
          .filter((pid) => pid !== professional.id);

        return saveProfessionals(remainingIds);
      },
    });
  };

  if (loading) {
    return (
      <div className={styles.page}>
        <div
          style={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            minHeight: "300px"
          }}>
          <Spin size="large" />
        </div>
      </div>
    );
  }

  if (!topic) {
    return (
      <div className={styles.page}>
        <div className={styles.sectionCard}>
          <div className={styles.sectionBody}>
            <Empty description="Topic not found" />
          </div>
        </div>
      </div>
    );
  }

  const shops = Array.isArray(topic.shops) ? topic.shops : [];
  const podcasts = Array.isArray(topic.podcasts) ? topic.podcasts : [];
  const professionals = Array.isArray(topic.professionals)
    ? topic.professionals
    : [];

  const viewingCard = viewingProfessional
    ? getBusinessCard(viewingProfessional)
    : null;
  const viewingSpecialties = viewingCard
    ? safeParseArray(viewingCard.specialties)
    : [];
  const viewingFeaturedLinks = viewingCard
    ? safeParseArray(viewingCard.featured_links)
    : [];
  const viewingOtherLinks = viewingCard
    ? safeParseArray<CardLink | string>(viewingCard.other_links)
    : [];
  const viewingLocations = Array.isArray(viewingCard?.locations)
    ? viewingCard.locations
    : [];
  const viewingImages = Array.isArray(viewingCard?.images)
    ? viewingCard.images
    : [];

  return (
    <div className={styles.page}>
      {/* HEADER */}
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>{topic.name}</h3>
          <p className={styles.headerSubtitle}>
            Manage content assigned to this topic
          </p>
        </div>

        <Button
          icon={<ArrowLeftOutlined />}
          onClick={() => navigate("/journal-topics")}
        >
          Back to Topics
        </Button>
      </div>

      {/* TOPIC OVERVIEW */}
      <SectionCard
        icon={<TagsOutlined />}
        title="Topic overview"
        hint="Basic details for this topic"
      >
        <div className={styles.topicOverview}>
          {topic.cover_image && (
            <div className={styles.topicCover}>
              <img src={topic.cover_image} alt={topic.name} />
            </div>
          )}

          <div className={styles.topicInfo}>
            <div className={styles.topicMetaRow}>
              <h2 className={styles.topicHeading}>{topic.name}</h2>
              {topic.slug && (
                <Tag className={styles.slugTag}>/{topic.slug}</Tag>
              )}
            </div>

            {topic.description ? (
              <SafeHtml className={styles.prose} html={topic.description} />
            ) : (
              <Text type="secondary">No description available</Text>
            )}

            <div className={styles.topicDatesRow}>
              {formatDate(topic.created_at) && (
                <span className={styles.dateChip}>
                  <CalendarOutlined /> Created {formatDate(topic.created_at)}
                </span>
              )}
              {formatDate(topic.updated_at) && (
                <span className={styles.dateChip}>
                  <CalendarOutlined /> Updated {formatDate(topic.updated_at)}
                </span>
              )}
            </div>
          </div>
        </div>
      </SectionCard>

      {/* JOURNAL PARAGRAPHS */}
      <SectionCard
        icon={<FileTextOutlined />}
        title={`Journal paragraphs (${paragraphs.length})`}
        hint="Paragraphs across journals tagged with this topic"
      >
        {paragraphLoading ? (
          <div className={styles.centerLoading}>
            <Spin />
          </div>
        ) : paragraphs.length === 0 ? (
          <div className={styles.emptyWrap}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No paragraphs assigned to this topic"
            />
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {paragraphs.map((item) => {
              const paragraphText = getParagraphText(
                item.journal?.content,
                item.paragraph_id,
              );

              return (
                <div
                  key={item.id}
                  className={styles.paragraphCard}
                  onClick={() => navigate(`/edit-journal/${item.journal_id}`)}
                >
                  <div className={styles.paragraphCardHeader}>
                    <div className={styles.paragraphCardTitleWrap}>
                      <span className={styles.paragraphCardTitle}>
                        {item.journal?.title}
                      </span>
                      <span className={styles.paragraphCardMeta}>
                        Paragraph: {item.paragraph_id}
                      </span>
                    </div>

                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/edit-journal/${item.journal_id}`);
                      }}
                    >
                      Edit
                    </Button>
                  </div>

                  <p className={styles.paragraphSnippet}>{paragraphText}</p>
                </div>
              );
            })}
          </div>
        )}
      </SectionCard>

      {/* SHOPS */}
      <SectionCard
        icon={<ShoppingOutlined />}
        title={`Shops (${shops.length})`}
        hint="Products tagged with this topic"
      >
        {shops.length === 0 ? (
          <div className={styles.emptyWrap}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No shops assigned to this topic"
            />
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {shops.map((shop) => (
              <div
                key={shop.id}
                className={styles.shopCard}
                onClick={() => navigate(`/edit-shop/${shop.id}`)}
              >
                <div className={styles.shopCover}>
                  {shop.cover_image ? (
                    <img src={shop.cover_image} alt={shop.title} />
                  ) : (
                    <div className={styles.shopCoverEmpty}>
                      <ShoppingOutlined />
                    </div>
                  )}

                  {shop.status && (
                    <Tag
                      className={styles.shopStatusTag}
                      color={statusColors[shop.status] || "default"}
                    >
                      {shop.status}
                    </Tag>
                  )}
                </div>

                <div className={styles.shopBody}>
                  <div className={styles.shopTitleRow}>
                    <span className={styles.shopTitle}>{shop.title}</span>
                    {shop.price && (
                      <span className={styles.shopPrice}>${shop.price}</span>
                    )}
                  </div>

                  {shop.brand && (
                    <span className={styles.shopBrand}>{shop.brand}</span>
                  )}

                  <p className={styles.shopDescription}>
                    {shop.short_description || "-"}
                  </p>

                  <div className={styles.shopActions}>
                    <Button
                      type="link"
                      size="small"
                      icon={<EditOutlined />}
                      onClick={(event) => {
                        event.stopPropagation();
                        navigate(`/edit-shop/${shop.id}`);
                      }}
                    >
                      Edit shop
                    </Button>

                    {shop.link && (
                      <Button
                        type="link"
                        size="small"
                        icon={<LinkOutlined />}
                        onClick={(event) => {
                          event.stopPropagation();
                          window.open(shop.link ?? undefined, "_blank", "noopener");
                        }}
                      >
                        View product
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* PODCASTS */}
      <SectionCard
        icon={<AudioOutlined />}
        title={`Podcasts (${podcasts.length})`}
        hint="Podcast episodes tagged with this topic"
      >
        {podcasts.length === 0 ? (
          <div className={styles.emptyWrap}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No podcasts assigned to this topic"
            />
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {podcasts.map((podcast) => (
              <div
                key={podcast.id}
                className={styles.podcastCard}
                onClick={() =>
                  navigate(`/edit-podcast-schedule/${podcast.id}`)
                }
              >
                <div className={styles.podcastIcon}>
                  <AudioOutlined />
                </div>

                <div className={styles.podcastBody}>
                  <span className={styles.podcastName}>
                    {podcast.name || "-"}
                  </span>
                  <span className={styles.podcastDescription}>
                    {podcast.short_description || "-"}
                  </span>

                  {podcast.schedule_date && (
                    <Tag className={styles.podcastDateTag}>
                      <CalendarOutlined /> {podcast.schedule_date}
                    </Tag>
                  )}
                </div>

                <Button
                  type="link"
                  size="small"
                  icon={<EditOutlined />}
                  onClick={(event) => {
                    event.stopPropagation();
                    navigate(`/edit-podcast-schedule/${podcast.id}`);
                  }}
                >
                  Edit
                </Button>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* PROFESSIONALS */}
      <SectionCard
        icon={<UserOutlined />}
        title={`Professionals (${professionals.length})`}
        hint="Professionals tagged with this topic"
        extra={
          <Button
            type="primary"
            size="small"
            icon={<PlusOutlined />}
            onClick={openProfessionalsModal}
          >
            Manage professionals
          </Button>
        }
      >
        {professionals.length === 0 ? (
          <div className={styles.emptyWrap}>
            <Empty
              image={Empty.PRESENTED_IMAGE_SIMPLE}
              description="No professionals assigned to this topic"
            />
          </div>
        ) : (
          <div className={styles.cardGrid}>
            {professionals.map((professional) => (
              // The remove button is a SIBLING of the clickable area below,
              // not a descendant of it — this is a structural fix (not just
              // stopPropagation) so a remove click can never bubble into a
              // "view" trigger, regardless of how the click event behaves.
              <div key={professional.id} className={styles.professionalCard}>
                <Button
                  type="text"
                  size="small"
                  icon={<CloseOutlined />}
                  className={styles.professionalRemoveBtn}
                  onClick={() => handleRemoveProfessional(professional)}
                />

                <div
                  className={styles.professionalClickable}
                  onClick={() => setViewingProfessional(professional)}
                >
                  <Avatar
                    size={44}
                    src={getProfessionalImage(professional)}
                    icon={<UserOutlined />}
                    className={styles.professionalAvatar}
                  />

                  <div className={styles.professionalBody}>
                    <span className={styles.professionalName}>
                      {getProfessionalName(professional)}
                    </span>
                    {getProfessionalEmail(professional) && (
                      <span className={styles.professionalEmail}>
                        {getProfessionalEmail(professional)}
                      </span>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>

      {/* MANAGE PROFESSIONALS MODAL */}
      <Modal
        title="Manage professionals"
        open={professionalsModalOpen}
        onCancel={() => setProfessionalsModalOpen(false)}
        onOk={() => saveProfessionals(selectedProfessionalIds)}
        okText={`Update${
          selectedProfessionalIds.length
            ? ` (${selectedProfessionalIds.length} selected)`
            : ""
        }`}
        confirmLoading={savingProfessionals}
        width={640}
        className={styles.professionalsModal}
        destroyOnHidden
      >
        <Input
          allowClear
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Search professionals by name or email"
          value={professionalSearchTerm}
          onChange={(e) => setProfessionalSearchTerm(e.target.value)}
          className={styles.professionalSearchInput}
        />

        <div className={styles.professionalPickerList}>
          {allProfessionalsLoading ? (
            <div className={styles.centerLoading}>
              <Spin />
            </div>
          ) : modalProfessionalList.length === 0 ? (
            <div className={styles.professionalPickerEmpty}>
              No professionals match "{professionalSearchTerm}"
            </div>
          ) : (
            modalProfessionalList.map((p) => {
              const checked = selectedProfessionalIds.includes(p.id);
              return (
                <div
                  key={p.id}
                  className={`${styles.professionalPickerRow} ${
                    checked ? styles.professionalPickerRowChecked : ""
                  }`}
                  onClick={() => toggleProfessionalSelection(p.id)}
                >
                  <Checkbox
                    checked={checked}
                    onClick={(e) => e.stopPropagation()}
                    onChange={() => toggleProfessionalSelection(p.id)}
                  />

                  <Avatar
                    size={36}
                    src={getProfessionalImage(p)}
                    icon={<UserOutlined />}
                    className={styles.professionalPickerAvatar}
                  />

                  <div className={styles.professionalPickerInfo}>
                    <span className={styles.professionalPickerName}>
                      {getProfessionalName(p)}
                    </span>
                    {getProfessionalEmail(p) && (
                      <span className={styles.professionalPickerEmail}>
                        {getProfessionalEmail(p)}
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Modal>

      {/* VIEW PROFESSIONAL (BUSINESS CARD) MODAL */}
      <Modal
        title="Professional details"
        open={!!viewingProfessional}
        onCancel={() => setViewingProfessional(null)}
        footer={
          <Button
            type="primary"
            onClick={() =>
              navigate(`/viewProfessionals/${viewingProfessional?.id}`)
            }
          >
            View full profile
          </Button>
        }
        width={640}
        className={styles.professionalsModal}
        destroyOnHidden
      >
        {viewingProfessional && (
          <>
            <div className={styles.viewModalHeader}>
              <Avatar
                size={72}
                src={getProfessionalImage(viewingProfessional)}
                icon={<UserOutlined />}
                className={styles.professionalAvatar}
              />
              <div>
                <div className={styles.viewModalName}>
                  {getProfessionalName(viewingProfessional)}
                </div>
                {viewingCard?.professional_title && (
                  <div className={styles.viewModalMeta}>
                    {viewingCard.professional_title}
                  </div>
                )}
                {getProfessionalEmail(viewingProfessional) && (
                  <div className={styles.viewModalMeta}>
                    {getProfessionalEmail(viewingProfessional)}
                  </div>
                )}
              </div>
            </div>

            {!viewingCard ? (
              <div className={styles.emptyWrap}>
                <Empty
                  image={Empty.PRESENTED_IMAGE_SIMPLE}
                  description="No business card on file for this professional"
                />
              </div>
            ) : (
              <>
                {viewingCard.bio && (
                  <div className={styles.viewModalSection}>
                    <SafeHtml className={styles.prose} html={viewingCard.bio} />
                  </div>
                )}

                {viewingSpecialties.length > 0 && (
                  <div className={styles.viewModalSection}>
                    <div className={styles.viewModalSectionTitle}>
                      Specialties
                    </div>
                    <div className={styles.tagWrap}>
                      {viewingSpecialties.map((s, idx) => (
                        <Tag key={idx} className={styles.specialtyTag}>
                          {s}
                        </Tag>
                      ))}
                    </div>
                  </div>
                )}

                {viewingLocations.length > 0 && (
                  <div className={styles.viewModalSection}>
                    <div className={styles.viewModalSectionTitle}>
                      Locations
                    </div>
                    <div className={styles.tagWrap}>
                      {viewingLocations.map((loc) => (
                        <span key={loc.id} className={styles.locationChip}>
                          <EnvironmentOutlined />
                          {[loc.city, loc.state].filter(Boolean).join(", ") ||
                            loc.label ||
                            "Location"}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {viewingFeaturedLinks.length > 0 && (
                  <div className={styles.viewModalSection}>
                    <div className={styles.viewModalSectionTitle}>
                      Featured links
                    </div>
                    <div className={styles.featuredLinkGrid}>
                      {viewingFeaturedLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.featuredLinkCard}
                        >
                          {link.image ? (
                            <img src={link.image} alt={link.title || ""} />
                          ) : (
                            <div className={styles.featuredLinkImageEmpty}>
                              <LinkOutlined />
                            </div>
                          )}
                          <span>{link.title || "Untitled link"}</span>
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {viewingOtherLinks.length > 0 && (
                  <div className={styles.viewModalSection}>
                    <div className={styles.viewModalSectionTitle}>
                      Other links
                    </div>
                    <div className={styles.otherLinksList}>
                      {viewingOtherLinks.map((link, idx) => (
                        <a
                          key={idx}
                          href={typeof link === "string" ? link : link.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <LinkOutlined /> {typeof link === "string" ? link : link.title || link.url}
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                {viewingImages.length > 0 && (
                  <div className={styles.viewModalSection}>
                    <div className={styles.viewModalSectionTitle}>
                      <PictureOutlined /> Gallery
                    </div>
                    <div className={styles.imageGalleryGrid}>
                      {viewingImages.map((img) => (
                        <a
                          key={img.id}
                          href={img.file_uri}
                          target="_blank"
                          rel="noopener noreferrer"
                          className={styles.imageGalleryThumb}
                        >
                          <img src={img.file_uri} alt={img.caption || ""} />
                        </a>
                      ))}
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </Modal>
    </div>
  );
};

export default JournalTopicDetails;