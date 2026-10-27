import React, { useCallback, useEffect, useRef, useState } from "react";
import { Button, Input, Modal, Segmented, Table, Tag, Tooltip, message, type TableColumnsType } from "antd";
import { DeleteOutlined, EditOutlined, EyeOutlined, PlusOutlined } from "@ant-design/icons";
import { Link, useLocation, useNavigate, useSearchParams } from "react-router";
import dayjs from "dayjs";
import PageHeader, { Panel } from "../../components/PageHeader";
import { DeleteDirectoryApplications, GetDirectoryApplications } from "../../services/Api/DirectoryApplicationsApi";
import { apiErrorMessage } from "../../utils/apiError";
import type { DirectoryApplication, DirectoryApplicationStatus } from "../../types/directoryApplication";
import {
  LIST_PATH,
  STATUS_COLORS,
  STATUS_LABELS,
  editPath,
  handleOf,
  placeOf,
  viewPath,
  type FromList,
} from "./listing";
import { useAdminNames } from "./useAdminNames";
import styles from "./DirectoryApplications.module.scss";

const PAGE_SIZE = 50;

type StatusFilter = DirectoryApplicationStatus | "all";

const FILTERS: { value: StatusFilter; label: string }[] = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "all", label: "All" },
];

const EMPTY_TEXT: Record<StatusFilter, string> = {
  pending: "No applications waiting for review",
  approved: "No approved listings",
  rejected: "No rejected applications",
  all: "No applications yet",
};

// The filter, search and page live in the address, so coming back from an application finds the list as it was.
const filtersFrom = (params: URLSearchParams) => ({
  status: FILTERS.find((f) => f.value === params.get("status"))?.value ?? "pending",
  search: params.get("search") ?? "",
  page: Math.max(1, Number.parseInt(params.get("page") ?? "", 10) || 1),
});

type Filters = ReturnType<typeof filtersFrom>;

const queryOf = ({ status, search, page }: Filters) => {
  const query = new URLSearchParams();
  if (status !== "pending") query.set("status", status);
  if (search) query.set("search", search);
  if (page > 1) query.set("page", String(page));
  return query;
};

const plural = (count: number, word: string) => `${count} ${word}${count === 1 ? "" : "s"}`;

const dash = <span className={styles.muted}>-</span>;

/** The website's directory applications, and the listings admins added. */
const DirectoryApplications = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [params, setParams] = useSearchParams();
  const { status, search, page } = filtersFrom(params);
  const [searchText, setSearchText] = useState(search);
  const [rows, setRows] = useState<DirectoryApplication[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);
  const [selected, setSelected] = useState<number[]>([]);
  const [reloads, setReloads] = useState(0);
  const reviewerName = useAdminNames();

  const setFilters = useCallback(
    (next: Partial<Filters>) => setParams((prev) => queryOf({ ...filtersFrom(prev), ...next }), { replace: true }),
    [setParams],
  );

  // One request per change of filters; the answer to a superseded one is dropped.
  useEffect(() => {
    let current = true;
    setLoading(true);
    setSelected([]);
    GetDirectoryApplications({
      status: status === "all" ? undefined : status,
      search: search || undefined,
      page,
      limit: PAGE_SIZE,
    })
      .then((res) => {
        if (!current) return;
        setRows(res.data.data.rows);
        setTotal(res.data.data.count);
      })
      .catch((err) => {
        console.error("Error loading directory applications:", err);
        if (current) message.error(apiErrorMessage(err) || "Couldn't load directory applications");
      })
      .finally(() => {
        if (current) setLoading(false);
      });
    return () => {
      current = false;
    };
  }, [status, search, page, reloads]);

  // The list follows the search box 300 ms after the last key, from the first page.
  const pushedSearch = useRef(search);
  useEffect(() => {
    const timer = setTimeout(() => {
      const next = searchText.trim();
      if (next === pushedSearch.current) return;
      pushedSearch.current = next;
      setFilters({ search: next, page: 1 });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchText, setFilters]);

  // The address changed some other way (the sidebar's link, the browser's back): the box follows it.
  useEffect(() => {
    if (search === pushedSearch.current) return;
    pushedSearch.current = search;
    setSearchText(search);
  }, [search]);

  // Pages opened from here lead back to the list as it is now.
  const fromList: FromList = { list: `${LIST_PATH}${location.search}` };

  const remove = (ids: number[]) => {
    const approved = rows.some((row) => ids.includes(row.id) && row.status === "approved");
    Modal.confirm({
      title: ids.length > 1 ? `Delete ${ids.length} applications?` : "Delete this application?",
      content: [
        `${ids.length > 1 ? "Their" : "Its"} photos are deleted too. This can't be undone.`,
        approved
          ? "An approved listing leaves the directory, and the page made from it goes too unless its account has a live Access card. Accounts stay."
          : "",
      ].join(" "),
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          const res = await DeleteDirectoryApplications(ids);
          message.success(`${plural(res.data.data.deleted, "application")} deleted`);
          // Reload; step back a page when this one was emptied.
          if (page > 1 && ids.length >= rows.length) setFilters({ page: page - 1 });
          else setReloads((n) => n + 1);
        } catch (err) {
          message.error(apiErrorMessage(err) || "Couldn't delete the applications");
        }
      },
    });
  };

  const columns: TableColumnsType<DirectoryApplication> = [
    {
      title: "Applicant",
      key: "applicant",
      width: 220,
      fixed: "left",
      render: (_, row) => (
        <div>
          <Link to={viewPath(row.id)} state={fromList} className={styles.primaryCell}>
            {row.name}
          </Link>
          <div className={styles.subText}>
            {[row.business_name, handleOf(row.custom_handle)].filter(Boolean).join(" · ") || "-"}
          </div>
        </div>
      ),
    },
    {
      title: "Contact",
      key: "contact",
      width: 230,
      render: (_, row) => (
        <div>
          <a href={`mailto:${row.email}`}>{row.email}</a>
          <div className={styles.subText}>{row.phone ? <a href={`tel:${row.phone}`}>{row.phone}</a> : "-"}</div>
        </div>
      ),
    },
    {
      title: "Location",
      key: "location",
      width: 150,
      render: (_, row) => placeOf(row) || dash,
    },
    {
      title: "Specialty",
      key: "specialty",
      width: 170,
      render: (_, row) => (
        <div>
          <div>{row.primary_specialty || "-"}</div>
          {row.professional_title && <div className={styles.subText}>{row.professional_title}</div>}
        </div>
      ),
    },
    {
      title: "Submitted",
      dataIndex: "created_at",
      width: 130,
      render: (date: string) => (
        <div>
          <div>{dayjs(date).format("MMM D, YYYY")}</div>
          <div className={styles.subText}>{dayjs(date).format("h:mm A")}</div>
        </div>
      ),
    },
    {
      title: "Status",
      key: "status",
      width: 180,
      render: (_, row) => (
        <div>
          <Tag color={STATUS_COLORS[row.status]}>{STATUS_LABELS[row.status] ?? row.status}</Tag>
          {row.reviewed_at && (
            <div className={styles.subText}>
              {[reviewerName(row.reviewed_by), dayjs(row.reviewed_at).format("MMM D, YYYY")].filter(Boolean).join(" · ")}
            </div>
          )}
        </div>
      ),
    },
    {
      title: "Account",
      dataIndex: "user_id",
      width: 120,
      render: (userId: number | null) =>
        userId ? <Link to={`/viewProfessionals/${userId}`}>Account #{userId}</Link> : dash,
    },
    {
      title: "",
      key: "actions",
      width: 120,
      align: "center",
      fixed: "right",
      render: (_, row) => (
        <div className={styles.rowActions}>
          <Tooltip title="View">
            <Button
              type="text"
              icon={<EyeOutlined />}
              aria-label={`View ${row.name}`}
              onClick={() => navigate(viewPath(row.id), { state: fromList })}
            />
          </Tooltip>
          <Tooltip title="Edit">
            <Button
              type="text"
              icon={<EditOutlined />}
              aria-label={`Edit ${row.name}`}
              onClick={() => navigate(editPath(row.id), { state: fromList })}
            />
          </Tooltip>
          <Tooltip title="Delete">
            <Button
              type="text"
              danger
              icon={<DeleteOutlined />}
              aria-label={`Delete ${row.name}`}
              onClick={() => remove([row.id])}
            />
          </Tooltip>
        </div>
      ),
    },
  ];

  return (
    <div>
      <PageHeader
        title="Directory applications"
        subtitle="From the website's directory form, or added here. Approving one lists the person on the directory and makes their account."
        extra={
          <>
            <Segmented<StatusFilter>
              options={FILTERS}
              value={status}
              onChange={(next) => setFilters({ status: next, page: 1 })}
            />
            <Input.Search
              placeholder="Search name, email, handle, title or specialty"
              allowClear
              value={searchText}
              onChange={(e) => setSearchText(e.target.value)}
              style={{ width: 320 }}
            />
            {selected.length > 0 && (
              <Button danger icon={<DeleteOutlined />} onClick={() => remove(selected)}>
                Delete selected ({selected.length})
              </Button>
            )}
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => navigate(`${LIST_PATH}/add`, { state: fromList })}
            >
              Add listing
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
          scroll={{ x: 1200 }}
          locale={{ emptyText: search ? "No applications match your search" : EMPTY_TEXT[status] }}
          rowSelection={{
            selectedRowKeys: selected,
            onChange: (keys) => setSelected(keys.map(Number)),
          }}
          pagination={{
            current: page,
            pageSize: PAGE_SIZE,
            total,
            showSizeChanger: false,
            showTotal: (count) => plural(count, "application"),
            onChange: (next) => setFilters({ page: next }),
          }}
        />
      </Panel>
    </div>
  );
};

export default DirectoryApplications;
