import React, { useEffect, useState } from "react";
import { Card, Col, List, Row, Skeleton, Tag, Tooltip } from "antd";
import {
  AuditOutlined,
  CrownOutlined,
  EyeOutlined,
  FileSearchOutlined,
  FormOutlined,
  IdcardOutlined,
  MailOutlined,
  ProfileOutlined,
  SolutionOutlined,
  StarOutlined,
  TruckOutlined,
  UsergroupAddOutlined,
  AimOutlined,
} from "@ant-design/icons";
import { Link, useNavigate } from "react-router";
import PageHeader, { Panel } from "../../components/PageHeader";
import { lastDays } from "../../components/DateRangeFilter";
import { GetPendingFormCount } from "../../services/Api/Api";
import { GetAllAccessOrders, GetAllBusinessCards } from "../../services/Api/BusinessCardApi";
import { GetAccessCardAnalyticsOverview } from "../../services/Api/AccessCardAnalyticsApi";
import { GetProfessionals } from "../../services/Api/UserApi";
import { GetPages } from "../../services/Api/ProfilesApi";
import { GetFeatureRequests, GetNewsletterSubscribers } from "../../services/Api/InquiriesApi";
import { GetAllPartnershipInquiries } from "../../services/Api/PartnershipApi";
import { GetSearchTerms } from "../../services/Api/SiteApi";
import { GetPendingDirectoryApplicationCount } from "../../services/Api/DirectoryApplicationsApi";
import { GetSubscriptions } from "../../services/Api/AccessAdminApi";
import type { SearchTerm } from "../../types/content";
import styles from "./Dashboard.module.scss";

interface Tile {
  key: string;
  title: string;
  icon: React.ReactNode;
  /** The screen the number comes from. */
  to: string;
  hint?: string;
  /** Work waiting: shown in the warning colour above 0. */
  attention?: boolean;
}

const SECTIONS: { title: string; tiles: Tile[] }[] = [
  {
    title: "Needs attention",
    tiles: [
      { key: "pendingCards", title: "Card requests to review", icon: <IdcardOutlined />, to: "/digital-card", attention: true },
      {
        key: "pendingApplications",
        title: "Directory applications to review",
        icon: <AuditOutlined />,
        to: "/directory-applications",
        attention: true,
      },
      { key: "pendingForms", title: "Applicant forms to review", icon: <FormOutlined />, to: "/form", attention: true },
      {
        key: "ordersToShip",
        title: "Keychain orders to ship",
        icon: <TruckOutlined />,
        to: "/access-orders",
        // Until the API reads the list's paging from the query (it reads the body, which a GET has none of).
        hint: "Pending or processing, among the newest 10 orders the API lists",
        attention: true,
      },
    ],
  },
  {
    title: "On the website",
    tiles: [
      { key: "liveCards", title: "Live Access cards", icon: <IdcardOutlined />, to: "/digital-card", hint: "Accepted" },
      { key: "professionals", title: "Professionals", icon: <SolutionOutlined />, to: "/professionals" },
      { key: "pages", title: "Professional & brand pages", icon: <ProfileOutlined />, to: "/pages", hint: "Shown or hidden" },
      {
        key: "proSeats",
        title: "Access Pro subscribers",
        icon: <CrownOutlined />,
        to: "/access-subscriptions",
        hint: "Active: paying and complimentary",
      },
    ],
  },
  {
    title: "Last 30 days",
    tiles: [
      { key: "cardViews", title: "Access card views", icon: <EyeOutlined />, to: "/access-analytics" },
      { key: "cardClicks", title: "Access card clicks", icon: <AimOutlined />, to: "/access-analytics" },
    ],
  },
  {
    title: "Inquiries",
    tiles: [
      { key: "newsletter", title: "Newsletter subscribers", icon: <MailOutlined />, to: "/newsletter" },
      { key: "featureRequests", title: "Feature requests", icon: <StarOutlined />, to: "/feature-requests" },
      { key: "partnerInquiries", title: "Partner inquiries", icon: <UsergroupAddOutlined />, to: "/partner-inquiries" },
    ],
  },
];

/** Every number on the dashboard, each loaded on its own: one that fails shows a dash, not an error page. */
const loadCounts = (): Record<string, Promise<number>> => {
  const cards = GetAllBusinessCards().then((res) => res.data.data ?? []);
  const [from, to] = lastDays(30).map((day) => day.format("YYYY-MM-DD"));
  const overview = GetAccessCardAnalyticsOverview(from, to).then((res) => res.data.data?.summary);
  return {
    pendingCards: cards.then((list) => list.filter((card) => card.status === "pending").length),
    liveCards: cards.then((list) => list.filter((card) => card.status === "accepted").length),
    pendingApplications: GetPendingDirectoryApplicationCount(),
    pendingForms: GetPendingFormCount().then((res) => Number.parseInt(String(res.data.data), 10) || 0),
    ordersToShip: GetAllAccessOrders({ page: 1, limit: 200 }).then(
      (res) =>
        (res.data.data?.data ?? []).filter((o) => o.fulfillment_status === "pending" || o.fulfillment_status === "processing")
          .length,
    ),
    proSeats: GetSubscriptions({ status: "active" }).then((res) => res.data.data.length),
    professionals: GetProfessionals({ page: 1, limit: 1 }).then((res) => res.data.data.count),
    pages: GetPages({ limit: 1 }).then((res) => res.data.data.count),
    cardViews: overview.then((summary) => Number(summary?.total_views ?? 0)),
    cardClicks: overview.then((summary) => Number(summary?.total_clicks ?? 0)),
    newsletter: GetNewsletterSubscribers({ limit: 1 }).then((res) => res.data.data.count),
    featureRequests: GetFeatureRequests({ limit: 1 }).then((res) => res.data.data.count),
    partnerInquiries: GetAllPartnershipInquiries().then((body) => {
      const list = body.data;
      return (Array.isArray(list) ? list : list?.rows ?? []).length;
    }),
  };
};

const TileCard = ({ tile, value }: { tile: Tile; value: number | null | undefined }) => {
  const navigate = useNavigate();
  const urgent = Boolean(tile.attention && value);
  return (
    <Card
      className={styles.tile}
      size="small"
      role="link"
      tabIndex={0}
      onClick={() => navigate(tile.to)}
      onKeyDown={(e) => {
        if (e.key === "Enter") navigate(tile.to);
      }}
    >
      <div className={styles.tileHead}>
        <span className={styles.tileIcon}>{tile.icon}</span>
        {tile.title}
      </div>
      {value === undefined ? (
        <Skeleton.Input active size="small" style={{ marginTop: 12 }} />
      ) : (
        <div className={`${styles.value} ${urgent ? styles.attention : ""}`}>
          {value === null ? (
            <Tooltip title="Couldn't load this number">
              <span>–</span>
            </Tooltip>
          ) : (
            value.toLocaleString()
          )}
        </div>
      )}
      {tile.hint && <div className={styles.hint}>{tile.hint}</div>}
    </Card>
  );
};

const TermList = ({ title, terms, empty }: { title: string; terms: SearchTerm[] | undefined; empty: string }) => (
  <Panel>
    <div className={styles.listTitle}>
      <h4>{title}</h4>
      <Link to="/search-terms">All search terms</Link>
    </div>
    <List
      size="small"
      loading={terms === undefined}
      dataSource={terms ?? []}
      locale={{ emptyText: empty }}
      renderItem={(t) => (
        <List.Item extra={t.last_results ? <Tag>{t.searches.toLocaleString()} searches</Tag> : <Tag color="orange">No results</Tag>}>
          {t.term}
        </List.Item>
      )}
    />
  </Panel>
);

/** The website at a glance: what needs doing, what is live, and what visitors do. */
const Dashboard = () => {
  const [values, setValues] = useState<Record<string, number | null>>({});
  const [topTerms, setTopTerms] = useState<SearchTerm[]>();
  const [emptyTerms, setEmptyTerms] = useState<SearchTerm[]>();

  useEffect(() => {
    let current = true;
    for (const [key, count] of Object.entries(loadCounts())) {
      count
        .catch((err) => {
          console.error(`Dashboard: couldn't load ${key}:`, err);
          return null;
        })
        .then((value) => {
          if (current) setValues((v) => ({ ...v, [key]: value }));
        });
    }
    const terms = (sort: "top" | "empty", set: (t: SearchTerm[]) => void) =>
      GetSearchTerms({ sort, limit: 5 })
        .then((res) => {
          if (current) set(res.data.data);
        })
        .catch((err) => {
          console.error(`Dashboard: couldn't load the ${sort} search terms:`, err);
          if (current) set([]);
        });
    terms("top", setTopTerms);
    terms("empty", setEmptyTerms);
    return () => {
      current = false;
    };
  }, []);

  return (
    <div>
      <PageHeader title="Dashboard" subtitle="The Glamlink website at a glance. Each number opens its screen." />

      {SECTIONS.map((section) => (
        <div key={section.title}>
          <div className={styles.section}>{section.title}</div>
          <Row gutter={[16, 16]} className={styles.grid}>
            {section.tiles.map((tile) => (
              <Col key={tile.key} xs={24} sm={12} lg={8} xl={6}>
                <TileCard tile={tile} value={values[tile.key]} />
              </Col>
            ))}
          </Row>
        </div>
      ))}

      <div className={styles.section}>
        <FileSearchOutlined /> What people search for
      </div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={12}>
          <TermList title="Most searched" terms={topTerms} empty="No searches yet" />
        </Col>
        <Col xs={24} lg={12}>
          <TermList title="Latest searches that found nothing" terms={emptyTerms} empty="Every search found something" />
        </Col>
      </Row>
    </div>
  );
};

export default Dashboard;
