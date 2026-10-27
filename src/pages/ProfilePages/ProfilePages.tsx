import React, { useEffect, useState } from "react";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import { Avatar, Button, Input, Segmented, Switch, Table, Tag, Tooltip, message, type TableColumnsType } from "antd";
import { PlusOutlined, SearchOutlined, ShopOutlined, StarFilled, UserOutlined } from "@ant-design/icons";
import PageHeader, { Panel } from "../../components/PageHeader";
import { GetPages } from "../../services/Api/ProfilesApi";
import { apiErrorMessage } from "../../utils/apiError";
import type { PageListParams, PageRow, PageType } from "../../types/profile";
import { TYPE_COLOR, TYPE_LABEL, publicPageUrl, rowStatus, type PageRouteState } from "./pageStatus";
import styles from "./ProfilePages.module.scss";

const PAGE_SIZE = 50;

type TypeFilter = PageType | "all";

const TYPE_FILTERS: { label: string; value: TypeFilter }[] = [
  { label: "All", value: "all" },
  { label: "Individuals", value: "individual" },
  { label: "Brands", value: "brand" },
];

const typeFrom = (value: string | null): PageType | undefined =>
  value === "brand" || value === "individual" ? value : undefined;

interface FilterChanges {
  search?: string;
  type?: TypeFilter;
  featured?: boolean;
  page?: number;
}

// The filters live in the address (?search=…&type=brand&featured=1&page=2), so coming back from a page's screens
// finds the list as it was. Any change but the page number's starts again from the first page.
const withChanges = (prev: URLSearchParams, changes: FilterChanges) => {
  const next = new URLSearchParams(prev);
  const put = (key: string, value: string | null) => (value ? next.set(key, value) : next.delete(key));
  if (changes.search !== undefined) put("search", changes.search);
  if (changes.type !== undefined) put("type", changes.type === "all" ? null : changes.type);
  if (changes.featured !== undefined) put("featured", changes.featured ? "1" : null);
  put("page", changes.page && changes.page > 1 ? String(changes.page) : null);
  return next;
};

const STATUS_TAG = {
  shown: { color: "green", label: "Shown", tip: "The website shows this page." },
  unlisted: { color: "volcano", label: "Hidden: unlisted", tip: "An admin unlisted it: the website hides it." },
  no_live_card: {
    color: "default",
    label: "Hidden: no live card",
    tip: "No live Access card and no approved directory listing: there is nothing to show.",
  },
} as const;

/** Every professional and brand page (the website's /profiles/:slug): how each one stands, with links to its screens. */
const ProfilePages = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const search = params.get("search") ?? "";
  const type = typeFrom(params.get("type"));
  const featured = params.get("featured") === "1";
  const page = Math.max(1, Number.parseInt(params.get("page") ?? "", 10) || 1);

  const [searchText, setSearchText] = useState(search);
  const [rows, setRows] = useState<PageRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  const change = (changes: FilterChanges) => setParams((prev) => withChanges(prev, changes), { replace: true });

  // The list follows the search box 300 ms after the last key.
  useEffect(() => {
    const term = searchText.trim();
    if (term === search) return;
    const timer = setTimeout(() => setParams((prev) => withChanges(prev, { search: term }), { replace: true }), 300);
    return () => clearTimeout(timer);
  }, [searchText, search, setParams]);

  // One request per change of filters; the answer to a superseded one is dropped.
  useEffect(() => {
    let current = true;
    const query: PageListParams = { page, limit: PAGE_SIZE };
    if (search) query.search = search;
    if (type) query.type = type;
    if (featured) query.featured = true;
    setLoading(true);
    GetPages(query)
      .then((res) => {
        if (!current) return;
        setRows(res.data.data.rows);
        setTotal(res.data.data.count);
      })
      .catch((err) => {
        console.error("Error loading pages:", err);
        if (current) message.error(apiErrorMessage(err) || "Couldn't load the pages");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [search, type, featured, page]);

  // The page's screens learn from the row whether the account can sign in, and where to come back to.
  const stateFor = (row: PageRow): PageRouteState => ({
    claimed: row.claimed,
    from: `${location.pathname}${location.search}`,
  });

  const columns: TableColumnsType<PageRow> = [
    {
      title: "Page",
      key: "page",
      width: 320,
      render: (_, row) => (
        <div className={styles.pageCell}>
          <Avatar
            shape="square"
            size={40}
            src={row.image || undefined}
            icon={row.type === "brand" ? <ShopOutlined /> : <UserOutlined />}
            alt=""
            className={styles.thumb}
          />
          <div className={styles.pageText}>
            <Link to={`/pages/${row.id}`} state={stateFor(row)} className={styles.pageName}>
              {row.name || `Account #${row.id}`}
            </Link>
            {(row.tagline || row.specialty) && <div className={styles.sub}>{row.tagline || row.specialty}</div>}
          </div>
        </div>
      ),
    },
    {
      title: "Type",
      key: "type",
      width: 110,
      render: (_, row) => (row.type ? <Tag color={TYPE_COLOR[row.type]}>{TYPE_LABEL[row.type]}</Tag> : "-"),
    },
    {
      title: "Address",
      key: "slug",
      width: 200,
      render: (_, row) => {
        if (!row.slug) return <span className={styles.muted}>None</span>;
        if (!row.visible) return <span className={styles.muted}>/{row.slug}</span>;
        return (
          <a href={publicPageUrl(row.slug)} target="_blank" rel="noopener noreferrer">
            /{row.slug}
          </a>
        );
      },
    },
    {
      title: "Status",
      key: "status",
      width: 250,
      render: (_, row) => {
        const status = STATUS_TAG[rowStatus(row)];
        return (
          <div className={styles.tags}>
            <Tooltip title={status.tip}>
              <Tag color={status.color}>{status.label}</Tag>
            </Tooltip>
            {row.has_live_card && <Tag color="cyan">Live card</Tag>}
            {row.created_by_admin && (
              <Tooltip title="A brand page an admin made: it shows without an Access card.">
                <Tag color="magenta">Made by admin</Tag>
              </Tooltip>
            )}
            {!row.claimed && (
              <Tooltip title="The account has no password yet, so nobody can sign in to edit the page. Send a claim email from the page's screen.">
                <Tag color="gold">Unclaimed</Tag>
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      title: "Featured",
      key: "featured",
      width: 110,
      render: (_, row) =>
        row.is_featured ? (
          <span className={styles.featured}>
            <StarFilled /> Order {row.featured_order}
          </span>
        ) : (
          <span className={styles.muted}>-</span>
        ),
    },
    {
      title: "Actions",
      key: "actions",
      width: 220,
      render: (_, row) => (
        <div className={styles.actions}>
          <Link to={`/pages/${row.id}`} state={stateFor(row)}>
            Edit
          </Link>
          <Link to={`/pages/${row.id}/analytics`} state={stateFor(row)}>
            Analytics
          </Link>
          {row.visible && row.slug ? (
            <a href={publicPageUrl(row.slug)} target="_blank" rel="noopener noreferrer">
              View on site
            </a>
          ) : (
            <Tooltip title="Hidden pages aren't on the website">
              <span className={styles.muted}>View on site</span>
            </Tooltip>
          )}
        </div>
      ),
    },
  ];

  const filtered = Boolean(search || type || featured);

  return (
    <div>
      <PageHeader
        title="Professional and brand pages"
        subtitle="Every page on the website (glamlink.net/profiles/…), shown or not: what is set on it and how it stands."
        extra={
          <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/pages/new")}>
            New brand page
          </Button>
        }
      />
      <Panel>
        <div className={styles.toolbar}>
          <Input
            allowClear
            prefix={<SearchOutlined />}
            placeholder="Search by name, tagline, specialty or place"
            aria-label="Search pages"
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className={styles.search}
          />
          <Segmented<TypeFilter>
            options={TYPE_FILTERS}
            value={type ?? "all"}
            onChange={(value) => change({ type: value })}
          />
          <span className={styles.switchLabel}>
            <Switch
              id="pages-featured-only"
              size="small"
              checked={featured}
              onChange={(checked) => change({ featured: checked })}
            />
            <label htmlFor="pages-featured-only">Featured only</label>
          </span>
        </div>
        <Table<PageRow>
          rowKey="id"
          columns={columns}
          dataSource={rows}
          loading={loading}
          size="middle"
          scroll={{ x: 1200 }}
          locale={{ emptyText: filtered ? "No pages match these filters" : "No pages yet" }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (count) => `${count.toLocaleString("en-US")} page${count === 1 ? "" : "s"}`,
            onChange: (next) => change({ page: next }),
          }}
        />
      </Panel>
    </div>
  );
};

export default ProfilePages;
