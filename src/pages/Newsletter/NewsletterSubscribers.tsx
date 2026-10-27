import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select, Table, Tag, message, type TableColumnsType } from "antd";
import { CloudDownloadOutlined, DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import {
  DeleteNewsletterSubscribers,
  ExportNewsletterSubscribers,
  GetNewsletterSubscribers,
} from "../../services/Api/InquiriesApi";
import { apiErrorMessage } from "../../utils/apiError";
import { saveFile } from "../../utils/csv";
import type { NewsletterSubscriber } from "../../types/content";

const PAGE_SIZE = 50;

// The website's sign-up forms. Subscribers from any other source still show under "All sources".
const SOURCES: Record<string, string> = { popup: "Pop-up", footer: "Footer", podcast: "Podcast page" };

interface Filters {
  page: number;
  search: string;
  source?: string;
}

const fullName = (row: NewsletterSubscriber) => [row.first_name, row.last_name].filter(Boolean).join(" ");

const NewsletterSubscribers = () => {
  const [filters, setFilters] = useState<Filters>({ page: 1, search: "" });
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState<NewsletterSubscriber[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);

  // One request per change of filters; the answer to a superseded one is dropped.
  useEffect(() => {
    let current = true;
    const { page, search, source } = filters;
    setLoading(true);
    GetNewsletterSubscribers({ page, limit: PAGE_SIZE, search: search || undefined, source })
      .then((res) => {
        if (!current) return;
        setRows(res.data.data.rows);
        setTotal(res.data.data.count);
      })
      .catch((err) => {
        console.error("Error loading newsletter subscribers:", err);
        if (current) message.error("Couldn't load the newsletter subscribers");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [filters]);

  // The list follows the search box 300 ms after the last key, from the first page.
  useEffect(() => {
    const timer = setTimeout(() => {
      const search = searchText.trim();
      setFilters((f) => (f.search === search ? f : { ...f, search, page: 1 }));
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText]);

  const exportCsv = async () => {
    try {
      setExporting(true);
      const res = await ExportNewsletterSubscribers({ search: filters.search || undefined, source: filters.source });
      saveFile(res.data, `newsletter-subscribers-${dayjs().format("YYYY-MM-DD")}.csv`);
    } catch (err) {
      console.error("Error exporting newsletter subscribers:", err);
      message.error("Couldn't export the subscribers");
    } finally {
      setExporting(false);
    }
  };

  const remove = (ids: React.Key[]) => {
    Modal.confirm({
      title: ids.length > 1 ? `Remove ${ids.length} subscribers?` : "Remove this subscriber?",
      content: "Their email is taken off the newsletter list.",
      okText: "Remove",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await DeleteNewsletterSubscribers(ids);
          const deleted = res.data.data.deleted;
          message.success(`${deleted} subscriber${deleted === 1 ? "" : "s"} removed`);
          setSelected([]);
          // Reload; step back a page when this one was emptied.
          setFilters((f) => ({ ...f, page: f.page > 1 && ids.length >= rows.length ? f.page - 1 : f.page }));
        } catch (err) {
          message.error(apiErrorMessage(err) || "Couldn't remove the subscribers");
        }
      },
    });
  };

  const columns: TableColumnsType<NewsletterSubscriber> = [
    {
      title: "Email",
      dataIndex: "email",
      render: (email: string) => <a href={`mailto:${email}`}>{email}</a>,
    },
    {
      title: "Name",
      key: "name",
      render: (_, row) => fullName(row) || <span style={{ color: "var(--color-text-tertiary)" }}>-</span>,
    },
    {
      title: "Signed up from",
      dataIndex: "source",
      width: 160,
      render: (source: string | null) => (source ? <Tag>{SOURCES[source] ?? source}</Tag> : "-"),
    },
    {
      title: "Signed up",
      dataIndex: "created_at",
      width: 180,
      render: (date: string) => dayjs(date).format("MMM D, YYYY h:mm A"),
    },
    {
      title: "",
      key: "action",
      width: 60,
      align: "center",
      render: (_, row) => (
        <Button
          type="text"
          danger
          icon={<DeleteOutlined />}
          aria-label={`Remove ${row.email}`}
          onClick={() => remove([row.id])}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Newsletter"
        subtitle={`People who signed up through the website's newsletter forms${total ? ` (${total})` : ""}.`}
        extra={
          <>
            <Input.Search
              placeholder="Search email or name"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 240 }}
            />
            <Select
              placeholder="All sources"
              allowClear
              value={filters.source}
              onChange={(source?: string) => setFilters((f) => ({ ...f, source, page: 1 }))}
              options={Object.entries(SOURCES).map(([value, label]) => ({ value, label }))}
              style={{ width: 160 }}
            />
            <Button icon={<CloudDownloadOutlined />} loading={exporting} onClick={exportCsv}>
              Export CSV
            </Button>
            <Button danger icon={<DeleteOutlined />} disabled={!selected.length} onClick={() => remove(selected)}>
              Remove{selected.length ? ` (${selected.length})` : ""}
            </Button>
          </>
        }
      />
      <Panel>
        <Table
          columns={columns}
          dataSource={rows}
          rowKey="id"
          loading={loading}
          size="middle"
          rowSelection={{ selectedRowKeys: selected, onChange: setSelected }}
          pagination={{
            current: filters.page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            onChange: (page) => setFilters((f) => ({ ...f, page })),
          }}
        />
      </Panel>
    </div>
  );
};

export default NewsletterSubscribers;
