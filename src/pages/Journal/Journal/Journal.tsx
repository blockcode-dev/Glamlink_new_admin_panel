/** @format */

import React, { useEffect, useState } from "react";
import { Table, message, Button, Input, Modal, Tag, Tooltip, type TableColumnsType } from "antd";
import {
  PlusOutlined,
  HolderOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import {
  DeleteJournal,
  GetAllJournal,
  UpdateJournalSortOrder,
} from "../../../services/Api/JournalApi";
import dayjs from "dayjs";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./JournalsList.module.scss";
import { type WithIndex } from "../../../utils/table";
import type { Journal } from "../../../types/journal";

const { Search } = Input;

// One draggable table row
interface DraggableRowProps extends React.HTMLAttributes<HTMLTableRowElement> {
  "data-row-key": string | number;
}

const DraggableRow = ({ children, "data-row-key": rowKey, ...restProps }: DraggableRowProps) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowKey });

  const style: React.CSSProperties = {
    ...restProps.style,
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1 },
    ),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 999,
          background: "var(--color-primary-soft)",
          boxShadow: "0 4px 16px var(--color-primary-ring)",
        }
      : {}),
  };

  // Inject the drag handle listeners only into the "drag" cell
  const injectedChildren = React.Children.map(children, (child) => {
    if (React.isValidElement<{ children?: React.ReactNode }>(child) && child.key === "drag-handle") {
      return React.cloneElement(child, {
        children: (
          <div
            ref={setActivatorNodeRef}
            {...listeners}
            {...attributes}
            className={styles.dragHandle}
          >
            <HolderOutlined style={{ fontSize: 18 }} />
          </div>
        ),
      });
    }
    return child;
  });

  return (
    <tr ref={setNodeRef} {...restProps} style={style}>
      {injectedChildren}
    </tr>
  );
};

const Blogs = () => {
  const [data, setData] = useState<WithIndex<Journal>[]>([]);
  const [backupData, setBackupData] = useState<WithIndex<Journal>[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const persistOrder = async (newData: WithIndex<Journal>[]) => {
    try {
      await UpdateJournalSortOrder({
        journals: newData.map((item) => ({ id: item.id })),
      });
      message.success("Journal order updated");
    } catch {
      message.error("Failed to update journal order");
      getData(); // rollback to server truth
    }
  };

  const columns: TableColumnsType<WithIndex<Journal>> = [
    {
      title: "",
      key: "drag-handle",
      dataIndex: "sort",
      width: 36,
      align: "center",
      render: () => null, // filled in by DraggableRow
    },

    {
      title: "Cover",
      dataIndex: "cover_image",
      width: 66,
      align: "center",

      render: (img) =>
        img ? (
          <img src={img} alt="cover" className={styles.coverThumb} />
        ) : (
          <div className={styles.coverEmpty}>No image</div>
        ),
    },

    {
      title: "Title",
      dataIndex: "title",
      width: 200,
      render: (text) => <div className={styles.titleCell}>{text}</div>,
    },

    {
      title: "Author / Category",
      dataIndex: "journal_author",
      width: 160,
      render: (author, record) => (
        <div>
          <div className={styles.authorCell}>{author?.name || "-"}</div>
          {record.journal_category?.title ? (
            <Tag color="blue" style={{ borderRadius: 20, marginTop: 4 }}>
              {record.journal_category.title}
            </Tag>
          ) : null}
        </div>
      ),
    },

    {
      title: "Description",
      dataIndex: "short_description",
      width: 220,
      render: (text) => (
        <div className={styles.descriptionCell}>
          {text?.length > 80 ? text.substring(0, 80) + "..." : text || "-"}
        </div>
      ),
    },

    {
      title: "Status / Downloads",
      dataIndex: "status",
      width: 150,
      align: "center",
      render: (status, record) => (
        <div>
          <Tag
            color={status === "published" ? "green" : "orange"}
            style={{
              fontWeight: 600,
              textTransform: "capitalize",
              padding: "2px 12px",
              borderRadius: 20,
            }}
          >
            {status}
          </Tag>
          <div style={{ marginTop: 4 }}>
            {record.downloads?.length ? (
              <Tag color="blue" style={{ borderRadius: 20 }}>
                {record.downloads.length} Download
                {record.downloads.length > 1 ? "s" : ""}
              </Tag>
            ) : (
              <Tag style={{ borderRadius: 20 }}>No downloads</Tag>
            )}
          </div>
        </div>
      ),
    },

   {
  title: "Published",
  dataIndex: "publish_date",
  width: 110,
  render: (date) =>
    date ? (
      <div>
        <div className={styles.publishedDate}>
          {dayjs(date, "YYYY-MM-DD HH:mm:ss").format(
            "DD/MM/YYYY",
          )}
        </div>

        <div className={styles.publishedTime}>
          {dayjs(date, "YYYY-MM-DD HH:mm:ss").format(
            "hh:mm A",
          )}
        </div>
      </div>
    ) : (
      <div>-</div>
    ),
},

    {
      title: "Action",
      key: "action",
      width: 90,
      align: "center",
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <Tooltip title="Edit Journal">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonEdit}`}
              onClick={() => navigate(`/edit-journal/${record.id}`)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Delete Journal">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonDanger}`}
              onClick={() => handleDelete(record.id)}
            >
              <DeleteOutlined />
            </button>
          </Tooltip>
        </div>
      ),
    },
  ];

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    setData((prev) => {
      const oldIndex = prev.findIndex((item) => item.id === active.id);
      const newIndex = prev.findIndex((item) => item.id === over.id);
      const reordered = arrayMove(prev, oldIndex, newIndex).map(
        (item, idx) => ({ ...item, index: idx + 1 }),
      );

      setBackupData(reordered);
      persistOrder(reordered);
      return reordered;
    });
  };

  const getData = async () => {
    try {
      setLoading(true);
      const result = await GetAllJournal();

      const newData = result.data.rows.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      setData(newData);
      setBackupData(newData);
    } catch {
      message.error("Failed to load journals");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const onSearch = (value: string) => {
    const filtered = backupData.filter((item) =>
      item.title.toLowerCase().includes(value.toLowerCase()),
    );
    setData(filtered);
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete Journal",
      content: "Are you sure you want to delete this journal?",
      okText: "Delete",
      okButtonProps: { danger: true },
      onOk: async () => {
        try {
          await DeleteJournal([id]); // send as array
          message.success("Journal deleted successfully");
          getData();
        } catch (err) {
          message.error("Failed to delete Journal");
        }
      },
    });
  };

  return (
    <div className={styles.page}>
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>Journals</h3>
          <p className={styles.headerSubtitle}>
            Manage all journals — drag the handle to reorder.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Search
            placeholder="Search journal..."
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-journal")}
          >
            Add Journal
          </Button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={data.map((i) => i.id)}
            strategy={verticalListSortingStrategy}
          >
            <Table
              columns={columns}
              dataSource={data}
              rowKey="id"
              loading={loading}
              components={{
                body: {
                  row: DraggableRow,
                },
              }}
              scroll={{ x: "max-content" }}
              pagination={{
                pageSize: 50,
                showSizeChanger: false,
              }}
            />
          </SortableContext>
        </DndContext>
      </div>
    </div>
  );
};

export default Blogs;