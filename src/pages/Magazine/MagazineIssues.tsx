import React, { useEffect, useState } from "react";
import { Button, Image, Input, Modal, Select, Space, Table, Tag, Tooltip, message, type TableColumnsType } from "antd";
import { DeleteOutlined, EditOutlined, ExportOutlined, PlusOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import { DeleteIssue, GetIssues } from "../../services/Api/MagazineApi";
import { apiErrorMessage } from "../../utils/apiError";
import { websiteUrl } from "../../utils/website";
import styles from "./Magazine.module.scss";
import type { IssueRow, IssueStatus } from "../../types/magazine";

const PAGE_SIZE = 50;

interface Filters {
  page: number;
  search: string;
  status?: IssueStatus;
}

const STATUSES: { value: IssueStatus; label: string }[] = [
  { value: "published", label: "Published" },
  { value: "draft", label: "Draft" },
];

const MagazineIssues = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<Filters>({ page: 1, search: "" });
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState<IssueRow[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  // One request per change of filters; the answer to a superseded one is dropped.
  useEffect(() => {
    let current = true;
    const { page, search, status } = filters;
    setLoading(true);
    GetIssues({ page, limit: PAGE_SIZE, search: search || undefined, status })
      .then((res) => {
        if (!current) return;
        setRows(res.data.data.rows);
        setTotal(res.data.data.count);
      })
      .catch((err) => {
        console.error("Error loading the magazine issues:", err);
        if (current) message.error("Couldn't load the issues");
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

  const remove = (issue: IssueRow) => {
    Modal.confirm({
      title: `Delete ${issue.title}?`,
      content: "Its page comes off the website, with the list of people in it. This can't be undone.",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await DeleteIssue(issue.id);
          message.success(`${issue.title} deleted`);
          // Reload; step back a page when this one was emptied.
          setFilters((f) => ({ ...f, page: f.page > 1 && rows.length === 1 ? f.page - 1 : f.page }));
        } catch (err) {
          message.error(apiErrorMessage(err) || "Couldn't delete the issue");
        }
      },
    });
  };

  const columns: TableColumnsType<IssueRow> = [
    {
      title: "Cover",
      dataIndex: "cover_image",
      width: 80,
      render: (cover: string | null) =>
        cover ? (
          <Image src={cover} width={48} height={64} alt="" style={{ objectFit: "cover", borderRadius: 4 }} />
        ) : (
          <div className={styles.noCover} title="No cover" />
        ),
    },
    {
      title: "Title",
      key: "title",
      render: (_, row) => (
        <div>
          <div className={styles.title}>{row.title}</div>
          <div className={styles.sub}>/magazine/{row.slug}</div>
        </div>
      ),
    },
    {
      title: "Issue",
      dataIndex: "issue_number",
      width: 80,
      align: "right",
      render: (n: number | null) => n ?? <span className={styles.muted}>-</span>,
    },
    {
      title: "Publish date",
      dataIndex: "publish_date",
      width: 130,
      render: (date: string | null) =>
        date ? dayjs(date).format("MMM D, YYYY") : <span className={styles.muted}>-</span>,
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 110,
      render: (status: IssueStatus) =>
        status === "published" ? <Tag color="green">Published</Tag> : <Tag>Draft</Tag>,
    },
    {
      title: "Featured",
      dataIndex: "is_featured",
      width: 100,
      render: (featured: boolean) => (featured ? <Tag color="gold">Featured</Tag> : null),
    },
    {
      title: "Sort order",
      dataIndex: "sort_order",
      width: 100,
      align: "right",
    },
    {
      title: "",
      key: "action",
      width: 130,
      align: "center",
      render: (_, row) => (
        <Space size={4}>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${row.title}`}
              onClick={() => navigate(`/magazine/edit/${row.id}`)}
            />
          </Tooltip>
          <Tooltip title={row.status === "published" ? "View on site" : "Drafts aren't on the site"}>
            <Button
              type="text"
              icon={<ExportOutlined />}
              aria-label={`View ${row.title} on the site`}
              href={websiteUrl(`/magazine/${row.slug}`)}
              target="_blank"
              rel="noopener noreferrer"
              disabled={row.status !== "published"}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${row.title}`}
              onClick={() => remove(row)}
            />
          </Tooltip>
        </Space>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Magazine"
        subtitle={`The magazine's issues on the website, highest sort order first${total ? ` (${total})` : ""}. Drafts stay off the site.`}
        extra={
          <>
            <Input.Search
              placeholder="Search titles"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 220 }}
            />
            <Select
              placeholder="Any status"
              allowClear
              value={filters.status}
              onChange={(status?: IssueStatus) => setFilters((f) => ({ ...f, status, page: 1 }))}
              options={STATUSES}
              style={{ width: 140 }}
            />
            <Button type="primary" icon={<PlusOutlined />} onClick={() => navigate("/magazine/add")}>
              Add issue
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
          scroll={{ x: 900 }}
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

export default MagazineIssues;
