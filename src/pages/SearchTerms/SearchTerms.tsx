import React, { useEffect, useState } from "react";
import { Button, Segmented, Space, Table, Tooltip, message, type TableColumnsType } from "antd";
import { LeftOutlined, PlusOutlined, RightOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import { GetHomeSettings, GetSearchTerms, UpdateHomeSettings } from "../../services/Api/SiteApi";
import { apiErrorMessage } from "../../utils/apiError";
import { websiteUrl } from "../../utils/website";
import type { SearchTerm } from "../../types/content";

const PAGE_SIZE = 50;
const MAX_POPULAR = 10;

type Sort = "top" | "empty";

const SearchTerms = () => {
  const [sort, setSort] = useState<Sort>("top");
  const [page, setPage] = useState(1);
  const [rows, setRows] = useState<SearchTerm[]>([]);
  const [loading, setLoading] = useState(false);
  // The home page's popular searches, so a term can be added to them from here.
  const [popular, setPopular] = useState<string[] | null>(null);
  const [adding, setAdding] = useState<string | null>(null);

  useEffect(() => {
    let current = true;
    setLoading(true);
    GetSearchTerms({ sort, page, limit: PAGE_SIZE })
      .then((res) => {
        if (current) setRows(res.data.data);
      })
      .catch((err) => {
        console.error("Error loading search terms:", err);
        if (current) message.error("Couldn't load the search terms");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [sort, page]);

  useEffect(() => {
    GetHomeSettings()
      .then((res) => setPopular(res.data.data.popular_searches))
      .catch((err) => console.error("Error loading the home page's popular searches:", err));
  }, []);

  const isPopular = (term: string) => Boolean(popular?.some((p) => p.toLowerCase() === term.toLowerCase()));

  const addToPopular = async (term: string) => {
    if (!popular) return;
    try {
      setAdding(term);
      const res = await UpdateHomeSettings({ popular_searches: [...popular, term] });
      setPopular(res.data.data.popular_searches);
      message.success(`"${term}" now shows under the home page's search box`);
    } catch (err) {
      message.error(apiErrorMessage(err) || "Couldn't add it to the popular searches");
    } finally {
      setAdding(null);
    }
  };

  const columns: TableColumnsType<SearchTerm> = [
    {
      title: "Search",
      dataIndex: "term",
      render: (term: string) => (
        <a href={websiteUrl(`/search?q=${encodeURIComponent(term)}`)} target="_blank" rel="noopener noreferrer">
          {term}
        </a>
      ),
    },
    {
      title: "Times searched",
      dataIndex: "searches",
      width: 150,
      align: "right",
      render: (n: number) => n.toLocaleString(),
    },
    {
      title: "Results last time",
      dataIndex: "last_results",
      width: 160,
      align: "right",
      render: (n: number) =>
        n ? n.toLocaleString() : <span style={{ color: "var(--color-error)", fontWeight: 600 }}>None</span>,
    },
    {
      title: "Last searched",
      dataIndex: "last_searched_at",
      width: 190,
      render: (date: string) => dayjs(date).format("MMM D, YYYY h:mm A"),
    },
    {
      title: "Home page",
      key: "popular",
      width: 150,
      render: (_, row) => {
        if (isPopular(row.term)) return <span style={{ color: "var(--color-text-tertiary)" }}>Popular search</span>;
        const full = (popular?.length ?? 0) >= MAX_POPULAR;
        return (
          <Tooltip title={full ? `The home page shows at most ${MAX_POPULAR}; remove one on the Home Page screen first` : undefined}>
            <Button
              size="small"
              icon={<PlusOutlined />}
              disabled={!popular || full}
              loading={adding === row.term}
              onClick={() => addToPopular(row.term)}
            >
              Add
            </Button>
          </Tooltip>
        );
      },
    },
  ];

  return (
    <div>
      <PageHeader
        title="Search Terms"
        subtitle={
          sort === "top"
            ? "What people search for on the website, most searched first. Terms are lower-cased; nothing about who searched is kept."
            : "The latest searches that found nothing: each may be worth a page, a topic or a popular search."
        }
        extra={
          <Segmented<Sort>
            value={sort}
            onChange={(value) => {
              setSort(value);
              setPage(1);
            }}
            options={[
              { value: "top", label: "Most searched" },
              { value: "empty", label: "Found nothing" },
            ]}
          />
        }
      />
      <Panel>
        <Table columns={columns} dataSource={rows} rowKey="term" loading={loading} size="middle" pagination={false} />
        {/* The API gives no total: a full page means there may be another. */}
        <Space style={{ display: "flex", justifyContent: "flex-end", marginTop: 12 }}>
          <Button icon={<LeftOutlined />} disabled={page === 1 || loading} onClick={() => setPage((p) => p - 1)}>
            Previous
          </Button>
          <span>Page {page}</span>
          <Button disabled={rows.length < PAGE_SIZE || loading} onClick={() => setPage((p) => p + 1)}>
            Next <RightOutlined />
          </Button>
        </Space>
      </Panel>
    </div>
  );
};

export default SearchTerms;
