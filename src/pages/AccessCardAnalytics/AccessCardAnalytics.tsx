/** @format */

import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router";
import {
  Avatar,
  Button,
  ConfigProvider,
  DatePicker,
  Empty,
  Input,
  Segmented,
  Select,
  Spin,
  Switch,
  Table,
  Tooltip,
  message,
  type TableColumnsType,
} from "antd";
import {
  AimOutlined,
  ArrowLeftOutlined,
  BarChartOutlined,
  CalendarOutlined,
  ContactsOutlined,
  CopyOutlined,
  CrownFilled,
  DesktopOutlined,
  EnvironmentOutlined,
  ExportOutlined,
  EyeOutlined,
  GiftOutlined,
  GlobalOutlined,
  IdcardOutlined,
  LinkOutlined,
  MailOutlined,
  MobileOutlined,
  PhoneOutlined,
  PictureOutlined,
  QuestionCircleOutlined,
  ReadOutlined,
  ReloadOutlined,
  RightOutlined,
  SearchOutlined,
  ShareAltOutlined,
  StarOutlined,
  TabletOutlined,
  TeamOutlined,
  UserAddOutlined,
  FacebookFilled,
  InstagramOutlined,
  LinkedinFilled,
  TikTokOutlined,
  YoutubeFilled,
} from "@ant-design/icons";
import dayjs, { type Dayjs } from "dayjs";
import utc from "dayjs/plugin/utc";

import {
  GetAccessCardAnalytics,
  GetAccessCardAnalyticsEvents,
  GetAccessCardAnalyticsOverview,
} from "../../services/Api/AccessCardAnalyticsApi";
import "./AccessCardAnalytics.scss";
import { apiErrorMessage } from "../../utils/apiError";
import type {
  AnalyticsEvent,
  AnalyticsOverview,
  CardActivity,
  CardAnalytics,
  DailyTotals,
} from "../../types/analytics";

dayjs.extend(utc);

const { RangePicker } = DatePicker;

// ============================================================
// CONSTANTS
// ============================================================

const BRAND = "var(--color-primary)";
const CLICK = "var(--color-accent-coral)";
const DATE_FMT = "YYYY-MM-DD";
const EVENTS_PAGE = 200;

/** Inclusive "YYYY-MM-DD" range. */
type DateRange = [string, string];

interface Meta {
  label: string;
  icon: React.ReactNode;
  color: string;
}

interface DayPoint {
  date: string;
  views: number;
  clicks: number;
}

/** Inline CSS variable used by the .scss for the accent colour. */
const accent = (color: string) => ({ "--c": color }) as React.CSSProperties;

const PRESETS = [
  { value: "today", label: "Today" },
  { value: "yesterday", label: "Yesterday" },
  { value: "7days", label: "7 Days" },
  { value: "30days", label: "30 Days" },
];

const EVENT_META: Record<string, Meta> = {
  ACCESS_CARD_VIEW: { label: "Viewed card", icon: <EyeOutlined />, color: BRAND },
  WEBSITE_CLICK: { label: "Website", icon: <GlobalOutlined />, color: "var(--color-accent-blue)" },
  BOOKING_CLICK: { label: "Booking", icon: <CalendarOutlined />, color: "var(--color-primary)" },
  PHONE_CLICK: { label: "Phone", icon: <PhoneOutlined />, color: "var(--color-accent-green)" },
  EMAIL_CLICK: { label: "Email", icon: <MailOutlined />, color: "var(--color-accent-amber)" },
  SAVE_CONTACT_CLICK: { label: "Save Contact", icon: <UserAddOutlined />, color: "var(--color-primary)" },
  CONNECT_CLICK: { label: "Connect", icon: <ContactsOutlined />, color: "var(--color-primary)" },
  SHARE_CLICK: { label: "Share", icon: <ShareAltOutlined />, color: "var(--color-accent-purple)" },
  INSTAGRAM_CLICK: { label: "Instagram", icon: <InstagramOutlined />, color: "var(--color-brand-instagram)" },
  TIKTOK_CLICK: { label: "TikTok", icon: <TikTokOutlined />, color: "var(--color-brand-tiktok)" },
  FACEBOOK_CLICK: { label: "Facebook", icon: <FacebookFilled />, color: "var(--color-brand-facebook)" },
  LINKEDIN_CLICK: { label: "LinkedIn", icon: <LinkedinFilled />, color: "var(--color-brand-linkedin)" },
  YOUTUBE_CLICK: { label: "YouTube", icon: <YoutubeFilled />, color: "var(--color-brand-youtube)" },
  OTHER_LINK_CLICK: { label: "Other Links", icon: <LinkOutlined />, color: "var(--color-text-secondary)" },
  FEATURED_LINK_CLICK: { label: "Featured Link", icon: <StarOutlined />, color: "var(--color-accent-amber)" },
  JOURNAL_CLICK: { label: "Journal", icon: <ReadOutlined />, color: "var(--color-accent-purple)" },
  LOCATION_CLICK: { label: "Location", icon: <EnvironmentOutlined />, color: "var(--color-accent-green)" },
  IMAGE_CLICK: { label: "Gallery Image", icon: <PictureOutlined />, color: "var(--color-accent-coral)" },
  PROMOTION_CLICK: { label: "Promotion", icon: <GiftOutlined />, color: "var(--color-accent-coral)" },
};

const CLICK_EVENTS = Object.keys(EVENT_META).filter((e) => e !== "ACCESS_CARD_VIEW");

const DEVICE_META: Record<string, Meta> = {
  mobile: { label: "Mobile", icon: <MobileOutlined />, color: BRAND },
  desktop: { label: "Desktop", icon: <DesktopOutlined />, color: "var(--color-accent-purple)" },
  tablet: { label: "Tablet", icon: <TabletOutlined />, color: CLICK },
};

// ============================================================
// HELPERS
// ============================================================

const num = (v: unknown) => Number(v) || 0;
const fmt = (v: unknown) => num(v).toLocaleString("en-US");
const pct = (part: unknown, total: unknown) => (total ? Math.round((num(part) / num(total)) * 100) : 0);
const cleanName = (name: unknown) => String(name || "Untitled card").trim();

const eventMeta = (type: string | null | undefined): Meta =>
  EVENT_META[type ?? ""] || {
    label: String(type || "Event").replace("_CLICK", "").replaceAll("_", " ").toLowerCase(),
    icon: <LinkOutlined />,
    color: "var(--color-text-secondary)",
  };

const deviceMeta = (type: string | null | undefined): Meta =>
  DEVICE_META[String(type || "").toLowerCase()] || {
    label: "Unknown",
    icon: <QuestionCircleOutlined />,
    color: "var(--color-text-tertiary)",
  };

// Uses the admin's own computer date/time zone
const presetRange = (preset: string): DateRange => {
  const today = dayjs();
  if (preset === "yesterday") {
    const y = today.subtract(1, "day").format(DATE_FMT);
    return [y, y];
  }
  if (preset === "7days") return [today.subtract(6, "day").format(DATE_FMT), today.format(DATE_FMT)];
  if (preset === "30days") return [today.subtract(29, "day").format(DATE_FMT), today.format(DATE_FMT)];
  return [today.format(DATE_FMT), today.format(DATE_FMT)];
};

// created_at is UTC -> convert to the admin's local system time
const toLocal = (value: unknown) => {
  if (!value) return null;
  const s = String(value);
  const hasOffset = /(Z|[+-]\d{2}:?\d{2})$/.test(s);
  const d = hasOffset ? dayjs(s) : dayjs.utc(s).local();
  return d.isValid() ? d : null;
};

const rangeLabel = ([from, to]: DateRange) => {
  const a = dayjs(from);
  const b = dayjs(to);
  if (from === to) return a.format("dddd, MMM D, YYYY");
  return `${a.format("MMM D")} – ${b.format("MMM D, YYYY")}`;
};

const fillDays = (rows: DailyTotals[], [from, to]: DateRange): DayPoint[] => {
  const map: Record<string, { views: number; clicks: number }> = {};
  rows.forEach((r) => {
    map[String(r.date).slice(0, 10)] = { views: num(r.views), clicks: num(r.clicks) };
  });
  const span = dayjs(to).diff(dayjs(from), "day");
  const out: DayPoint[] = [];
  for (let i = 0; i <= span; i += 1) {
    const date = dayjs(from).add(i, "day").format(DATE_FMT);
    out.push({ date, views: map[date]?.views || 0, clicks: map[date]?.clicks || 0 });
  }
  return out;
};

const niceMax = (n: number) => {
  if (n <= 4) return 4;
  const pow = 10 ** Math.floor(Math.log10(n));
  const r = n / pow;
  return (r <= 1 ? 1 : r <= 2 ? 2 : r <= 5 ? 5 : 10) * pow;
};

const cardHandle = (link: string | null | undefined) => {
  if (!link) return null;
  try {
    const u = new URL(link);
    return `${u.host}${u.pathname}`;
  } catch {
    return link;
  }
};

const initials = (name: unknown) =>
  cleanName(name)
    .replace(/[^a-zA-Z\s]/g, " ")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase() || "?";

// ============================================================
// SMALL COMPONENTS
// ============================================================

const CardAvatar = ({ name, size = 38, className = "" }: { name?: string | null; size?: number; className?: string }) => (
  <Avatar size={size} className={`aca-avatar ${className}`}>
    {initials(name)}
  </Avatar>
);

interface StatProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
  color: string;
  hint?: string;
}

const Stat = ({ icon, label, value, color, hint }: StatProps) => (
  <div className="aca-stat" style={accent(color)}>
    <span className="aca-stat__icon">{icon}</span>
    <div>
      <div className="aca-stat__value">{value}</div>
      <div className="aca-stat__label">
        {label}
        {hint && (
          <Tooltip title={hint}>
            <QuestionCircleOutlined />
          </Tooltip>
        )}
      </div>
    </div>
  </div>
);

interface BoxProps {
  title: string;
  sub?: string;
  extra?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

const Box = ({ title, sub, extra, children, className = "" }: BoxProps) => (
  <section className={`aca-box ${className}`}>
    <header className="aca-box__head">
      <div>
        <h3>{title}</h3>
        {sub && <p>{sub}</p>}
      </div>
      {extra}
    </header>
    {children}
  </section>
);

const NoData = ({ text }: { text: string }) => (
  <div className="aca-nodata">
    <Empty image={Empty.PRESENTED_IMAGE_SIMPLE} description={text} />
  </div>
);

// ============================================================
// DAILY CHART
// ============================================================

const DailyChart = ({ data }: { data: DayPoint[] }) => {
  const [hover, setHover] = useState<number | null>(null);
  const total = data.reduce((s, d) => s + d.views + d.clicks, 0);
  if (!total) return <NoData text="No views or clicks in this date range." />;

  const max = niceMax(Math.max(1, ...data.map((d) => Math.max(d.views, d.clicks))));
  const ticks = [max, max / 2, 0];
  const labelEvery = data.length > 10 ? Math.ceil(data.length / 7) : 1;

  return (
    <div className="aca-chart">
      <div className="aca-chart__legend">
        <span>
          <i style={{ background: BRAND }} /> Views
        </span>
        <span>
          <i style={{ background: CLICK }} /> Clicks
        </span>
      </div>

      <div className="aca-chart__body">
        <div className="aca-chart__y">
          {ticks.map((t) => (
            <span key={t}>{t}</span>
          ))}
        </div>

        <div className="aca-chart__main">
          <div className="aca-chart__plot">
            <div className="aca-chart__grid">
              {ticks.map((t) => (
                <div key={t} />
              ))}
            </div>

            <div className="aca-chart__cols">
              {data.map((d, i) => (
                <div
                  key={d.date}
                  className={`aca-chart__col ${hover === i ? "is-hover" : ""}`}
                  onMouseEnter={() => setHover(i)}
                  onMouseLeave={() => setHover(null)}
                >
                  <div className="aca-chart__bars">
                    <span
                      className="is-views"
                      style={{ height: `${(d.views / max) * 100}%`, minHeight: d.views ? 4 : 0 }}
                    />
                    <span
                      className="is-clicks"
                      style={{ height: `${(d.clicks / max) * 100}%`, minHeight: d.clicks ? 4 : 0 }}
                    />
                  </div>

                  {hover === i && (
                    <div className={`aca-tip ${i > data.length / 2 ? "aca-tip--left" : ""}`}>
                      <div className="aca-tip__date">{dayjs(d.date).format("ddd, MMM D")}</div>
                      <div className="aca-tip__row">
                        <i style={{ background: BRAND }} /> Views <b>{fmt(d.views)}</b>
                      </div>
                      <div className="aca-tip__row">
                        <i style={{ background: CLICK }} /> Clicks <b>{fmt(d.clicks)}</b>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>

          <div className="aca-chart__x">
            {data.map((d, i) => (
              <span key={d.date}>{i % labelEvery === 0 ? dayjs(d.date).format("MMM D") : ""}</span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// ============================================================
// PAGE
// ============================================================

const AccessCardAnalytics = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const cardId = searchParams.get("card");

  const [preset, setPreset] = useState("today");
  const [range, setRange] = useState<DateRange>(() => presetRange("today"));

  const [overview, setOverview] = useState<AnalyticsOverview | null>(null);
  const [cardData, setCardData] = useState<CardAnalytics | null>(null);
  const [events, setEvents] = useState<AnalyticsEvent[]>([]);
  const [eventsHasMore, setEventsHasMore] = useState(false);
  const [eventFilter, setEventFilter] = useState("ALL");

  const [loading, setLoading] = useState(false);
  const [eventsLoading, setEventsLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [activeOnly, setActiveOnly] = useState(true);
  const [showAllButtons, setShowAllButtons] = useState(false);

  const reqId = useRef(0);
  const eventsReqId = useRef(0);

  // ------------------------------------------------------------
  // FETCH
  // ------------------------------------------------------------

  const fetchData = useCallback(async () => {
    const id = ++reqId.current;
    setLoading(true);
    try {
      const [overviewRes, cardRes] = await Promise.all([
        GetAccessCardAnalyticsOverview(range[0], range[1]),
        cardId ? GetAccessCardAnalytics(cardId, range[0], range[1]) : undefined,
      ]);
      if (id !== reqId.current) return;

      if (overviewRes.data?.success) setOverview(overviewRes.data.data);
      setCardData(cardRes?.data?.success ? cardRes.data.data : null);
    } catch (error) {
      if (id !== reqId.current) return;
      console.error("ACCESS CARD ANALYTICS ERROR:", error);
      message.error(apiErrorMessage(error) || "Failed to load analytics.");
    } finally {
      if (id === reqId.current) setLoading(false);
    }
  }, [range, cardId]);

  const fetchEvents = useCallback(
    async (offset = 0) => {
      if (!cardId) return;
      const id = ++eventsReqId.current;
      setEventsLoading(true);
      try {
        const res = await GetAccessCardAnalyticsEvents(cardId, range[0], range[1], null, EVENTS_PAGE, offset);
        if (id !== eventsReqId.current) return;
        const rows = res.data?.success ? res.data.data?.rows || [] : [];
        const count = res.data?.data?.count;
        setEvents((prev) => (offset ? [...prev, ...rows] : rows));
        setEventsHasMore(typeof count === "number" ? offset + rows.length < count : rows.length === EVENTS_PAGE);
      } catch (error) {
        if (id === eventsReqId.current && !offset) setEvents([]);
      } finally {
        if (id === eventsReqId.current) setEventsLoading(false);
      }
    },
    [range, cardId],
  );

  useEffect(() => {
    setCardData(null);
    setEvents([]);
    setEventFilter("ALL");
  }, [cardId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  useEffect(() => {
    fetchEvents(0);
  }, [fetchEvents]);

  // ------------------------------------------------------------
  // HANDLERS
  // ------------------------------------------------------------

  const applyPreset = (value: string) => {
    setPreset(value);
    setRange(presetRange(value));
  };

  const handleRangePick = (dates: [Dayjs | null, Dayjs | null] | null) => {
    if (!dates?.[0] || !dates?.[1]) return;
    setPreset("custom");
    setRange([dates[0].format(DATE_FMT), dates[1].format(DATE_FMT)]);
  };

  const refresh = () => {
    fetchData();
    fetchEvents(0);
  };

  const openCard = (id: number | string) => {
    setSearchParams({ card: String(id) });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const copyLink = async (link: string) => {
    try {
      await navigator.clipboard.writeText(link);
      message.success("Link copied");
    } catch {
      message.error("Failed to copy link");
    }
  };

  // ------------------------------------------------------------
  // DERIVED DATA
  // ------------------------------------------------------------

  const cards = useMemo(() => overview?.cards || [], [overview]);

  const selectedCard = useMemo((): CardActivity | null => {
    if (!cardId) return null;
    return (
      cards.find((c) => String(c.business_card_id) === String(cardId)) || {
        business_card_id: cardId,
        name: `Card #${cardId}`,
      }
    );
  }, [cardId, cards]);

  const summary = (cardId ? cardData?.summary : overview?.summary) || {};
  const counts = (cardId ? cardData?.events : overview?.events) || {};
  const totalViews = num(summary.total_views);
  const totalClicks = num(summary.total_clicks);
  const clicksPerView = totalViews ? (totalClicks / totalViews).toFixed(1) : "0";

  const daily = useMemo(() => {
    if (!cardId) return fillDays(overview?.daily || [], range);
    const map: Record<string, DayPoint> = {};
    (cardData?.daily_views || []).forEach((d) => {
      const k = String(d.date).slice(0, 10);
      map[k] = { date: k, views: num(d.count), clicks: map[k]?.clicks || 0 };
    });
    (cardData?.daily_clicks || []).forEach((d) => {
      const k = String(d.date).slice(0, 10);
      map[k] = { date: k, views: map[k]?.views || 0, clicks: num(d.count) };
    });
    return fillDays(Object.values(map), range);
  }, [cardId, overview, cardData, range]);

  const buttonRows = CLICK_EVENTS.map((e) => ({ key: e, ...EVENT_META[e], value: num(counts[e]) }))
    .filter((r) => showAllButtons || r.value > 0)
    .sort((a, b) => b.value - a.value);
  const maxButton = Math.max(1, ...buttonRows.map((r) => r.value));

  const topCards = [...cards]
    .filter((c) => num(c.views) > 0)
    .sort((a, b) => num(b.views) - num(a.views) || num(b.clicks) - num(a.clicks))
    .slice(0, 5);

  const deviceRows = (cardData?.device_breakdown || [])
    .map((d) => ({ key: d.device_type || "unknown", ...deviceMeta(d.device_type), value: num(d.count) }))
    .sort((a, b) => b.value - a.value);
  const deviceTotal = deviceRows.reduce((s, r) => s + r.value, 0);

  const tableData = useMemo(() => {
    const q = search.trim().toLowerCase();
    return cards
      .filter((c) => !activeOnly || num(c.views) + num(c.clicks) > 0)
      .filter(
        (c) =>
          !q ||
          cleanName(c.name).toLowerCase().includes(q) ||
          String(c.business_name || "").toLowerCase().includes(q) ||
          String(c.business_card_link || "").toLowerCase().includes(q),
      )
      .sort((a, b) => num(b.views) - num(a.views) || num(b.clicks) - num(a.clicks));
  }, [cards, search, activeOnly]);

  const filteredEvents = eventFilter === "ALL" ? events : events.filter((e) => e.event_type === eventFilter);

  const eventOptions = [
    { value: "ALL", label: `All activity (${events.length})` },
    ...Object.keys(EVENT_META)
      .filter((e) => events.some((x) => x.event_type === e))
      .map((e) => ({
        value: e,
        label: `${EVENT_META[e].label} (${events.filter((x) => x.event_type === e).length})`,
      })),
  ];

  // ------------------------------------------------------------
  // TABLE COLUMNS
  // ------------------------------------------------------------

  const cardColumns: TableColumnsType<CardActivity> = [
    {
      title: "Card",
      key: "card",
      render: (_, r) => (
        <div className="aca-cardcell">
          <CardAvatar name={r.name} />
          <div className="aca-cardcell__text">
            <div className="aca-cardcell__name">{cleanName(r.name)}</div>
            <div className="aca-cardcell__meta">
              {r.business_name ? String(r.business_name).trim() : cardHandle(r.business_card_link) || "-"}
            </div>
          </div>
        </div>
      ),
    },
    {
      title: "Views",
      dataIndex: "views",
      align: "center",
      sorter: (a, b) => num(a.views) - num(b.views),
      render: (v) => <span className="aca-pill aca-pill--views">{fmt(v)}</span>,
    },
    {
      title: "Visitors",
      dataIndex: "unique_visitors",
      align: "center",
      sorter: (a, b) => num(a.unique_visitors) - num(b.unique_visitors),
      render: (v) => <span className="aca-pill aca-pill--visitors">{fmt(v)}</span>,
    },
    {
      title: "Clicks",
      dataIndex: "clicks",
      align: "center",
      sorter: (a, b) => num(a.clicks) - num(b.clicks),
      render: (v) => <span className="aca-pill aca-pill--clicks">{fmt(v)}</span>,
    },
    {
      title: "",
      key: "action",
      align: "right",
      render: (_, r) => (
        <div className="aca-actions" onClick={(e) => e.stopPropagation()}>
          {r.business_card_link && (
            <Tooltip title="Open live card">
              <Button
                shape="circle"
                type="text"
                icon={<ExportOutlined />}
                onClick={() => window.open(r.business_card_link ?? undefined, "_blank")}
              />
            </Tooltip>
          )}
          <Button className="aca-view-btn" onClick={() => openCard(r.business_card_id)}>
            View Analytics <RightOutlined />
          </Button>
        </div>
      ),
    },
  ];

  const eventColumns: TableColumnsType<AnalyticsEvent> = [
    {
      title: "Action",
      dataIndex: "event_type",
      render: (value) => {
        const meta = eventMeta(value);
        return (
          <div className="aca-event">
            <span className="aca-event__icon" style={accent(meta.color)}>
              {meta.icon}
            </span>
            <span className="aca-event__label">{meta.label}</span>
          </div>
        );
      },
    },
    {
      title: "Link",
      dataIndex: "event_target",
      ellipsis: true,
      render: (value) =>
        value && /^https?:\/\//i.test(value) ? (
          <a href={value} target="_blank" rel="noreferrer" className="aca-link">
            {value.replace(/^https?:\/\/(www\.)?/i, "")}
          </a>
        ) : (
          <span className="aca-muted">{value || "-"}</span>
        ),
    },
    {
      title: "Device",
      dataIndex: "device_type",
      width: 130,
      render: (value) => (
        <span className="aca-device">
          {deviceMeta(value).icon} {deviceMeta(value).label}
        </span>
      ),
    },
    {
      title: "Date",
      dataIndex: "created_at",
      width: 170,
      align: "right",
      render: (value) => {
        const d = toLocal(value);
        return d ? (
          <div className="aca-when">
            <b>{d.format("hh:mm A")}</b>
            <span>{d.format("MMM D, YYYY")}</span>
          </div>
        ) : (
          "-"
        );
      },
    },
  ];

  // ------------------------------------------------------------
  // RENDER
  // ------------------------------------------------------------

  return (
    <ConfigProvider theme={{ token: { borderRadius: 10 } }}>
      <div className="aca">
        {/* ======================= PAGE HEADER ======================= */}
        {selectedCard ? (
          <>
            <button type="button" className="aca-back" onClick={() => setSearchParams({})}>
              <ArrowLeftOutlined /> Back to all cards
            </button>

            <div className="aca-profile">
              <CardAvatar name={selectedCard.name} size={72} className="aca-avatar--lg" />
              <div className="aca-profile__info">
                <h2>{cleanName(selectedCard.name)}</h2>
                {selectedCard.business_name && (
                  <div className="aca-profile__business">{String(selectedCard.business_name).trim()}</div>
                )}
                {selectedCard.business_card_link && (
                  <div className="aca-profile__link">
                    <LinkOutlined />
                    <span>{cardHandle(selectedCard.business_card_link)}</span>
                    <Tooltip title="Copy link">
                      <button type="button" onClick={() => copyLink(selectedCard.business_card_link ?? "")}>
                        <CopyOutlined />
                      </button>
                    </Tooltip>
                  </div>
                )}
              </div>
              {selectedCard.business_card_link && (
                <Button
                  type="primary"
                  size="large"
                  icon={<ExportOutlined />}
                  className="aca-profile__cta"
                  onClick={() => window.open(selectedCard.business_card_link ?? undefined, "_blank")}
                >
                  Open Live Card
                </Button>
              )}
            </div>
          </>
        ) : (
          <div className="aca-title">
            <span className="aca-title__icon">
              <BarChartOutlined />
            </span>
            <div>
              <h2>Access Card Analytics</h2>
              <p>See which cards get the most views and what visitors click on.</p>
            </div>
          </div>
        )}

        {/* ======================= DATE BAR ======================= */}
        <div className="aca-datebar">
          <div className="aca-datebar__current">
            <CalendarOutlined />
            <div>
              <small>Showing data for</small>
              <b>{rangeLabel(range)}</b>
            </div>
          </div>
          <div className="aca-datebar__controls">
            <Segmented value={preset} onChange={applyPreset} options={PRESETS} />
            <RangePicker
              allowClear={false}
              format="MMM D, YYYY"
              value={[dayjs(range[0]), dayjs(range[1])]}
              disabledDate={(d) => d && d.isAfter(dayjs(), "day")}
              onChange={handleRangePick}
            />
            <Tooltip title="Refresh">
              <Button icon={<ReloadOutlined spin={loading} />} onClick={refresh} />
            </Tooltip>
          </div>
        </div>

        <Spin spinning={loading}>
          <div className="aca-stack">
            {/* ======================= STATS ======================= */}
            <div className="aca-stats">
              <Stat icon={<EyeOutlined />} label="Total Views" value={fmt(totalViews)} color={BRAND} />
              <Stat
                icon={<TeamOutlined />}
                label="Unique Visitors"
                value={fmt(summary.unique_visitors)}
                color="var(--color-accent-purple)"
                hint="Each person is counted once, even if they opened the card many times."
              />
              <Stat icon={<AimOutlined />} label="Total Clicks" value={fmt(totalClicks)} color={CLICK} />
              {cardId ? (
                <Stat
                  icon={<BarChartOutlined />}
                  label="Clicks per View"
                  value={clicksPerView}
                  color="var(--color-accent-green)"
                  hint="On average, how many buttons a visitor taps after opening the card."
                />
              ) : (
                <Stat
                  icon={<IdcardOutlined />}
                  label="Cards With Activity"
                  value={
                    <>
                      {fmt(summary.cards_with_activity)}
                      <small> / {fmt(cards.length)}</small>
                    </>
                  }
                  color="var(--color-accent-green)"
                />
              )}
            </div>

            {/* ======================= CHART + SIDE ======================= */}
            <div className="aca-grid">
              <Box title="Views & Clicks" sub="Hover over a day to see the numbers.">
                <DailyChart data={daily} />
              </Box>

              {cardId ? (
                <Box title="Devices" sub="What visitors used to open this card.">
                  {deviceRows.length ? (
                    <div className="aca-devices">
                      {deviceRows.map((d) => (
                        <div key={d.key} className="aca-device-row" style={accent(d.color)}>
                          <span className="aca-device-row__icon">{d.icon}</span>
                          <div className="aca-device-row__body">
                            <div className="aca-device-row__top">
                              <span>{d.label}</span>
                              <b>{pct(d.value, deviceTotal)}%</b>
                            </div>
                            <div className="aca-track">
                              <span style={{ width: `${pct(d.value, deviceTotal)}%`, background: d.color }} />
                            </div>
                            <small>{fmt(d.value)} interactions</small>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <NoData text="No device data in this date range." />
                  )}
                </Box>
              ) : (
                <Box title="Most Viewed Cards" sub="Click a card to see its analytics.">
                  {topCards.length ? (
                    <div className="aca-top">
                      {topCards.map((c, i) => (
                        <button
                          type="button"
                          key={c.business_card_id}
                          className="aca-top__row"
                          onClick={() => openCard(c.business_card_id)}
                        >
                          <span className={`aca-top__rank ${i === 0 ? "is-first" : ""}`}>
                            {i === 0 ? <CrownFilled /> : i + 1}
                          </span>
                          <CardAvatar name={c.name} size={36} />
                          <span className="aca-top__body">
                            <span className="aca-top__name">{cleanName(c.name)}</span>
                            <span className="aca-top__meta">
                              {fmt(c.clicks)} clicks · {fmt(c.unique_visitors)} visitors
                            </span>
                          </span>
                          <span className="aca-top__views">
                            <b>{fmt(c.views)}</b>
                            <small>views</small>
                          </span>
                        </button>
                      ))}
                    </div>
                  ) : (
                    <NoData text="No card was viewed in this date range." />
                  )}
                </Box>
              )}
            </div>

            {/* ======================= BUTTON CLICKS ======================= */}
            <Box
              title="Clicks by Button"
              sub="Which buttons visitors tapped on the card."
              extra={
                <span className="aca-switch">
                  <Switch size="small" checked={showAllButtons} onChange={setShowAllButtons} /> Show all buttons
                </span>
              }
            >
              {buttonRows.length ? (
                <div className="aca-buttons">
                  {buttonRows.map((r) => (
                    <div key={r.key} className={`aca-btn-tile ${r.value ? "" : "is-zero"}`} style={accent(r.color)}>
                      <span className="aca-btn-tile__icon">{r.icon}</span>
                      <div className="aca-btn-tile__body">
                        <div className="aca-btn-tile__top">
                          <span>{r.label}</span>
                          <b>{fmt(r.value)}</b>
                        </div>
                        <div className="aca-track">
                          <span style={{ width: `${(r.value / maxButton) * 100}%`, background: r.color }} />
                        </div>
                        <small>{pct(r.value, totalClicks)}% of clicks</small>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <NoData text="No clicks in this date range." />
              )}
            </Box>

            {/* ======================= TABLE / ACTIVITY ======================= */}
            {!cardId ? (
              <Box
                title="All Cards"
                sub={`${fmt(tableData.length)} ${activeOnly ? "active " : ""}cards`}
                extra={
                  <div className="aca-tools">
                    <Input
                      allowClear
                      prefix={<SearchOutlined />}
                      placeholder="Search by name or business"
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="aca-search"
                    />
                    <span className="aca-switch">
                      <Switch size="small" checked={activeOnly} onChange={setActiveOnly} /> Active only
                    </span>
                  </div>
                }
              >
                <Table
                  className="aca-table"
                  rowKey="business_card_id"
                  columns={cardColumns}
                  dataSource={tableData}
                  scroll={{ x: 720 }}
                  onRow={(r) => ({ onClick: () => openCard(r.business_card_id) })}
                  pagination={{ pageSize: 20, showSizeChanger: false, hideOnSinglePage: true }}
                  locale={{
                    emptyText: (
                      <NoData
                        text={activeOnly ? "No card had activity. Turn off 'Active only' to see all cards." : "No cards found."}
                      />
                    ),
                  }}
                />
              </Box>
            ) : (
              <Box
                title="Activity Log"
                sub="Every view and click on this card, newest first."
                extra={
                  <Select
                    value={eventFilter}
                    onChange={setEventFilter}
                    options={eventOptions}
                    style={{ minWidth: 200 }}
                  />
                }
              >
                <Table
                  className="aca-table aca-table--static"
                  rowKey={(r) => r.id ?? `${r.event_type}-${r.created_at}`}
                  columns={eventColumns}
                  dataSource={filteredEvents}
                  loading={eventsLoading}
                  scroll={{ x: 680 }}
                  pagination={{ pageSize: 15, showSizeChanger: false, hideOnSinglePage: true }}
                  locale={{ emptyText: <NoData text="No activity on this card in this date range." /> }}
                />
                {eventsHasMore && (
                  <div className="aca-more">
                    <Button onClick={() => fetchEvents(events.length)} loading={eventsLoading}>
                      Load more
                    </Button>
                  </div>
                )}
              </Box>
            )}
          </div>
        </Spin>
      </div>
    </ConfigProvider>
  );
};

export default AccessCardAnalytics;