import React, { useEffect, useState } from "react";
import { Button, Input, Modal, Select, Table, Tag, message, type TableColumnsType } from "antd";
import { DeleteOutlined } from "@ant-design/icons";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import { DeleteFeatureRequests, GetFeatureRequests } from "../../services/Api/InquiriesApi";
import { apiErrorMessage } from "../../utils/apiError";
import type { FeatureRequest } from "../../types/content";

const PAGE_SIZE = 50;

// The choices on the website's "Apply for Feature" form.
const INTERESTS = ["Cover Feature", "Pro Spotlight", "Top Treatment", "Inspiring Stories", "Innovation Feature"];

interface Filters {
  page: number;
  search: string;
  interest?: string;
}

const FeatureRequests = () => {
  const [filters, setFilters] = useState<Filters>({ page: 1, search: "" });
  const [searchText, setSearchText] = useState("");
  const [rows, setRows] = useState<FeatureRequest[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<React.Key[]>([]);

  // One request per change of filters; the answer to a superseded one is dropped.
  useEffect(() => {
    let current = true;
    const { page, search, interest } = filters;
    setLoading(true);
    GetFeatureRequests({ page, limit: PAGE_SIZE, search: search || undefined, interest })
      .then((res) => {
        if (!current) return;
        setRows(res.data.data.rows);
        setTotal(res.data.data.count);
      })
      .catch((err) => {
        console.error("Error loading feature requests:", err);
        if (current) message.error("Couldn't load the feature requests");
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

  const remove = (ids: React.Key[]) => {
    Modal.confirm({
      title: ids.length > 1 ? `Delete ${ids.length} feature requests?` : "Delete this feature request?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await DeleteFeatureRequests(ids);
          const deleted = res.data.data.deleted;
          message.success(`${deleted} feature request${deleted === 1 ? "" : "s"} deleted`);
          setSelected([]);
          // Reload; step back a page when this one was emptied.
          setFilters((f) => ({ ...f, page: f.page > 1 && ids.length >= rows.length ? f.page - 1 : f.page }));
        } catch (err) {
          message.error(apiErrorMessage(err) || "Couldn't delete the feature requests");
        }
      },
    });
  };

  const columns: TableColumnsType<FeatureRequest> = [
    {
      title: "Name / Specialty",
      key: "name",
      render: (_, row) => (
        <div>
          <div style={{ fontWeight: 600 }}>{row.name}</div>
          <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>{row.specialty}</div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      render: (_, row) => (
        <div>
          <a href={`mailto:${row.email}`}>{row.email}</a>
          <div style={{ fontSize: 12 }}>
            <a href={`tel:${row.phone}`}>{row.phone}</a>
          </div>
        </div>
      ),
    },
    { title: "City", dataIndex: "city", width: 160 },
    {
      title: "Interested in",
      dataIndex: "interest",
      width: 170,
      render: (interest: string) => <Tag color="purple">{interest}</Tag>,
    },
    {
      title: "Received",
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
          aria-label={`Delete the request from ${row.name}`}
          onClick={() => remove([row.id])}
        />
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Feature Requests"
        subtitle="Professionals who asked to be featured through the website's media kit. support@glamlink.net is emailed for each one."
        extra={
          <>
            <Input.Search
              placeholder="Search name, email, specialty or city"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 280 }}
            />
            <Select
              placeholder="All features"
              allowClear
              value={filters.interest}
              onChange={(interest?: string) => setFilters((f) => ({ ...f, interest, page: 1 }))}
              options={INTERESTS.map((value) => ({ value, label: value }))}
              style={{ width: 180 }}
            />
            <Button danger icon={<DeleteOutlined />} disabled={!selected.length} onClick={() => remove(selected)}>
              Delete{selected.length ? ` (${selected.length})` : ""}
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

export default FeatureRequests;
