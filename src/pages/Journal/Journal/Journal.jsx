/** @format */

import React, { useEffect, useState } from "react";
import { Table, message, Button, Input, Modal, Tag, Tooltip } from "antd";
import {
  PlusOutlined,
  HolderOutlined,
  EditOutlined,
  DeleteOutlined,
} from "@ant-design/icons";
import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import {
  DeleteJournal,
  GetAllJournal,
  UpdateJournalSortOrder,
} from "../../../services/Api/JournalApi";
import moment from "moment";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  verticalListSortingStrategy,
  useSortable,
  arrayMove,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import styles from "./JournalsList.module.scss";

const { Search } = Input;

// One draggable table row
const DraggableRow = ({ children, "data-row-key": rowKey, ...restProps }) => {
  const {
    attributes,
    listeners,
    setNodeRef,
    setActivatorNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: rowKey });

  const style = {
    ...restProps.style,
    transform: CSS.Transform.toString(
      transform && { ...transform, scaleY: 1 },
    ),
    transition,
    ...(isDragging
      ? {
          position: "relative",
          zIndex: 999,
          background: "#f0f9fa",
          boxShadow: "0 4px 16px rgba(35, 184, 203, 0.25)",
        }
      : {}),
  };

  // Inject the drag handle listeners only into the "drag" cell
  const injectedChildren = React.Children.map(children, (child) => {
    if (child && child.key === "drag-handle") {
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
  const [data, setData] = useState([]);
  const [backupData, setBackupData] = useState([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const persistOrder = async (newData) => {
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

  const columns = [
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
            {record.downloads?.length > 0 ? (
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
          {moment(date, "YYYY-MM-DD HH:mm:ss").format(
            "DD/MM/YYYY",
          )}
        </div>

        <div className={styles.publishedTime}>
          {moment(date, "YYYY-MM-DD HH:mm:ss").format(
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

  const handleDragEnd = (event) => {
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
      const result = await GetAllJournal(localStorage.getItem("adminToken"));

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

  const onSearch = (value) => {
    const filtered = backupData.filter((item) =>
      item.title.toLowerCase().includes(value.toLowerCase()),
    );
    setData(filtered);
  };

  const handleDelete = (id) => {
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
    <Box className={styles.page}>
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
    </Box>
  );
};

export default Blogs;