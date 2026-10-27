/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Button, Input, Modal, Tag, type TableColumnsType } from "antd";
import { PlusOutlined, HolderOutlined } from "@ant-design/icons";
import { useNavigate } from "react-router";
import {
  UpdateEventSortOrder,
  GetAllEvents,
  DeleteEvent,
} from "../../../../services/Api/JournalApi";
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
import dayjs from "dayjs";
import { type WithIndex } from "../../../../utils/table";
import type { DiscoverEvent } from "../../../../types/journal";

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
    transform: CSS.Transform.toString(transform && { ...transform, scaleY: 1 }),
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
            style={{
              cursor: isDragging ? "grabbing" : "grab",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              width: 40,
              height: 40,
              borderRadius: 8,
              color: "var(--color-primary)",
              touchAction: "none",
            }}
          >
            <HolderOutlined style={{ fontSize: 20 }} />
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

const Event = () => {
  const [data, setData] = useState<WithIndex<DiscoverEvent>[]>([]);
  const [backupData, setBackupData] = useState<WithIndex<DiscoverEvent>[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const persistOrder = async (newData: WithIndex<DiscoverEvent>[]) => {
    try {
      await UpdateEventSortOrder({
        items: newData.map((item) => ({
          id: item.id,
        })),
      });
      message.success("Event order updated");
    } catch {
      message.error("Failed to update Event order");
      getData();
    }
  };

  const columns: TableColumnsType<WithIndex<DiscoverEvent>> = [
    {
      title: "",
      key: "drag-handle",
      dataIndex: "sort",
      width: 50,
      align: "center",
      render: () => null, // filled in by DraggableRow
    },
    {
      title: "S.No.",
      dataIndex: "index",
      width: 70,
      align: "center",
    },
    {
      title: "Cover",
      dataIndex: "cover_image",
      width: 100,
      align: "center",

      render: (img) =>
        img ? (
          <img
            src={img}
            alt="cover"
            style={{
              width: 70,
              height: 50,
              objectFit: "cover",
              borderRadius: 8,
              border: "1px solid var(--color-border)",
            }}
          />
        ) : (
          <div
            style={{
              width: 70,
              height: 50,
              borderRadius: 8,
              background: "var(--color-surface-muted)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 12,
              color: "var(--color-text-tertiary)",
            }}
          >
            No Image
          </div>
        ),
    },
    {
      title: "Title",
      dataIndex: "title",
      width: 260,

      render: (text) => (
        <div
          style={{
            fontWeight: 600,
            color: "var(--color-text)",
            lineHeight: "20px",
          }}
        >
          {text}
        </div>
      ),
    },
    {
      title: "Event Date",
      dataIndex: "event_date",
      width: 160,
      render: (date) =>
        date ? dayjs(date).format("DD MMM YYYY, hh:mm A") : "-",
    },
    {
      title: "Location",
      dataIndex: "location",
      width: 180,
      render: (location) => location || "-",
    },

    {
      title: "Link",
      dataIndex: "link",
      render: (link) => (
        <a href={link} target="_blank" rel="noreferrer">
          View
        </a>
      ),
    },
    {
      title: "Description",
      dataIndex: "short_description",
      width: 320,

      render: (text) => (
        <div
          style={{
            color: "var(--color-text-secondary)",
            fontSize: 13,
            lineHeight: "20px",
          }}
        >
          {text?.length > 100 ? text.substring(0, 100) + "..." : text || "-"}
        </div>
      ),
    },
    {
      title: "Status",
      dataIndex: "status",
      width: 120,
      align: "center",

      render: (status) => (
        <Tag
          color={status === "published" ? "green" : "orange"}
          style={{
            fontWeight: 600,
            textTransform: "capitalize",
            padding: "4px 12px",
            borderRadius: 20,
          }}
        >
          {status}
        </Tag>
      ),
    },

    {
      title: "Action",
      width: 140,
      align: "center",

      render: (_, record) => (
        <Space size="middle">
          <Button
            type="link"
            style={{
              padding: 0,
              fontWeight: 500,
            }}
            onClick={() => navigate(`/edit-event/${record.id}`)}
          >
            Edit
          </Button>

          <Button
            type="link"
            danger
            style={{
              padding: 0,
              fontWeight: 500,
            }}
            onClick={() => handleDelete(record.id)}
          >
            Delete
          </Button>
        </Space>
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
      const result = await GetAllEvents();

      const newData = result.data.rows.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      setData(newData);
      setBackupData(newData);
    } catch {
      message.error("Failed to load Events");
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
      title: "Delete Event",
      content: "Are you sure you want to delete this Event?",
      onOk: async () => {
        try {
          await DeleteEvent([id]);
          message.success("Event deleted successfully");
          getData();
        } catch (err) {
          message.error("Failed to delete Event");
        }
      },
    });
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          marginBottom: "20px"
        }}>
        <div>
          <h3>Event</h3>
          <p>Manage all Event articles — drag the ⠿ handle to reorder</p>
        </div>

        <Space>
          <Search
            placeholder="Search Here..."
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-event")}
          >
            Add Event
          </Button>
        </Space>
      </div>

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
            pagination={{
              pageSize: 50,
              showSizeChanger: false,
            }}
          />
        </SortableContext>
      </DndContext>
    </div>
  );
};

export default Event;
