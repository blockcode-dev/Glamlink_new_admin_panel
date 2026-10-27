/** @format */

import React, { useEffect, useState } from "react";
import {
  Table,
  Space,
  message,
  notification,
  Button,
  Input,
  Modal,
  Tag,
  Upload,
  type TableColumnsType,
  type UploadFile,
  type UploadProps,
} from "antd";
import {
  PlusOutlined,
  HolderOutlined,
  UploadOutlined,
  InboxOutlined,
  DownloadOutlined,
} from "@ant-design/icons";
import { useNavigate } from "react-router";
import {
  UpdateShopSortOrder,
  GetAllShop,
  DeleteShop,
  BulkUploadShopCsv,
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
import { apiErrorMessage } from "../../../../utils/apiError";
import { type WithIndex } from "../../../../utils/table";
import type { Shop } from "../../../../types/journal";

const { Search } = Input;

const REQUIRED_CSV_COLUMNS = ["product_name", "search_price"];

// Reads just the header line client-side to reject bad CSVs before upload
const validateCsvHeaders = (file: File) =>
  new Promise<{ valid: boolean; missing: string[] }>((resolve) => {
    const reader = new FileReader();
    reader.onload = () => {
      // readAsText always yields a string.
      const firstLine = String(reader.result || "").split(/\r?\n/)[0] || "";
      const headers = firstLine
        .split(",")
        .map((h) => h.trim().replace(/^"|"$/g, ""));
      const missing = REQUIRED_CSV_COLUMNS.filter(
        (col) => !headers.includes(col),
      );
      resolve({ valid: missing.length === 0, missing });
    };
    reader.onerror = () =>
      resolve({ valid: false, missing: REQUIRED_CSV_COLUMNS });
    reader.readAsText(file.slice(0, 4000));
  });

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

const Shop = () => {
  const [data, setData] = useState<WithIndex<Shop>[]>([]);
  const [backupData, setBackupData] = useState<WithIndex<Shop>[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [fileList, setFileList] = useState<NonNullable<UploadFile["originFileObj"]>[]>([]);
  const [uploading, setUploading] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: { distance: 5 },
    }),
  );

  const persistOrder = async (newData: WithIndex<Shop>[]) => {
    try {
      await UpdateShopSortOrder({
        items: newData.map((item) => ({ id: item.id })),
      });
      message.success("Event order updated");
    } catch {
      message.error("Failed to update Event order");
      getData();
    }
  };

  const columns: TableColumnsType<WithIndex<Shop>> = [
    {
      title: "",
      key: "drag-handle",
      dataIndex: "sort",
      width: 50,
      align: "center",
      render: () => null,
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
      render: (text, record) => (
        <div style={{ fontWeight: 600, color: "var(--color-text)", lineHeight: "20px" }}>
          {text}
          {record.is_featured && (
            <Tag color="gold" style={{ marginLeft: 6 }}>
              Home page {record.featured_order ?? 0}
            </Tag>
          )}
        </div>
      ),
    },
    {
      title: "Brand",
      dataIndex: "brand",
      width: 180,
      render: (brand, record) => (
        <div>
          <div>{brand || "-"}</div>
          {record.owner?.name && (
            <div style={{ fontSize: 12, color: "var(--color-text-tertiary)" }}>Put up by {record.owner.name}</div>
          )}
        </div>
      ),
    },
    {
      title: "Price",
      dataIndex: "price",
      width: 120,
      align: "center",
      render: (price) => `$${Number(price).toFixed(2)}`,
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
        <div style={{ color: "var(--color-text-secondary)", fontSize: 13, lineHeight: "20px" }}>
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
            style={{ padding: 0, fontWeight: 500 }}
            onClick={() => navigate(`/edit-shop/${record.id}`)}
          >
            Edit
          </Button>
          <Button
            type="link"
            danger
            style={{ padding: 0, fontWeight: 500 }}
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
      const result = await GetAllShop();

      const newData = result.data.rows.map((item, index) => ({
        ...item,
        index: index + 1,
      }));

      setData(newData);
      setBackupData(newData);
    } catch {
      message.error("Failed to load Shop");
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
      title: "Delete Shop",
      content: "Are you sure you want to delete this Shop?",
      onOk: async () => {
        try {
          await DeleteShop([id]);
          message.success("Shop deleted successfully");
          getData();
        } catch (err) {
          message.error("Failed to delete Shop");
        }
      },
    });
  };

  // ---- CSV upload ----

  const handleDownloadTemplate = () => {
    const header =
      "aw_deep_link,product_name,aw_product_id,merchant_product_id,merchant_image_url,description,merchant_category,search_price,brand_name,large_image";
    const sampleRow =
      'https://example.com/test-product,TEST - Sample Hydrating Serum,0000000001,TEST-001,https://example.com/images/test-product.jpg,"Sample test product for CSV import — safe to delete after testing.",Skincare,49.99,Test Brand,https://example.com/images/test-product-large.jpg';

    const blob = new Blob([`${header}\n${sampleRow}\n`], {
      type: "text/csv;charset=utf-8;",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "shop-import-sample.csv";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const draggerProps: UploadProps = {
    multiple: false,
    accept: ".csv",
    fileList,
    beforeUpload: async (file) => {
      const isCsv =
        file.type === "text/csv" || file.name.toLowerCase().endsWith(".csv");
      if (!isCsv) {
        message.error("Only .csv files are allowed.");
        return Upload.LIST_IGNORE;
      }

      const { valid, missing } = await validateCsvHeaders(file);
      if (!valid) {
        message.error(
          `CSV is missing required column(s): ${missing.join(", ")}. Upload rejected.`,
        );
        return Upload.LIST_IGNORE;
      }

      setFileList([file]);
      return false; // prevent antd auto-upload, we submit manually
    },
    onRemove: () => setFileList([]),
  };

  const handleCsvUpload = async () => {
    if (!fileList.length) {
      message.warning("Select a CSV file first.");
      return;
    }

    const formData = new FormData();
    formData.append("csv_file", fileList[0]);

    setUploading(true);
    try {
      const res = await BulkUploadShopCsv(formData);
      const result = res.data.data;

      message.success(res.data.message || "CSV uploaded successfully.");

      if (result.skipped?.length) {
        const rowNumbers = result.skipped.map((s) => s.row);
        const shown = rowNumbers.slice(0, 10).join(", ");
        const more =
          rowNumbers.length > 10 ? ` and ${rowNumbers.length - 10} more` : "";

        notification.warning({
          title: `${result.skipped.length} row(s) skipped`,
          description: `Imported ${result.inserted} of ${result.totalRows} rows. Skipped CSV row(s): ${shown}${more} — missing product_name or search_price.`,
          duration: 8,
        });
      }

      getData();
      setUploadModalOpen(false);
      setFileList([]);
    } catch (err) {
      message.error(apiErrorMessage(err) || "CSV upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const closeUploadModal = () => {
    setUploadModalOpen(false);
    setFileList([]);
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
          <h3>Shop</h3>
          <p>Manage all Shop articles — drag the ⠿ handle to reorder</p>
        </div>

        <Space>
          <Search
            placeholder="Search Here..."
            allowClear
            onChange={(e) => onSearch(e.target.value)}
            style={{ width: 250 }}
          />
          <Button
            icon={<UploadOutlined />}
            onClick={() => setUploadModalOpen(true)}
          >
            Upload CSV
          </Button>
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => navigate("/add-shop")}
          >
            Add Shop
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

      <Modal
        title="Bulk Import Shop Products"
        open={uploadModalOpen}
        onCancel={closeUploadModal}
        width={600}
        footer={[
          <Button key="cancel" onClick={closeUploadModal}>
            Cancel
          </Button>,
          <Button
            key="upload"
            type="primary"
            loading={uploading}
            disabled={!fileList.length}
            onClick={handleCsvUpload}
          >
            Upload CSV
          </Button>,
        ]}
      >
        <div
          style={{
            marginBottom: 16,
            padding: 12,
            background: "var(--color-primary-soft)",
            borderRadius: 8,
            fontSize: 13,
            lineHeight: "20px",
          }}
        >
          <strong>Required columns:</strong> <code>product_name</code>,{" "}
          <code>search_price</code>
          <br />
          <strong>Optional columns:</strong> <code>description</code>,{" "}
          <code>brand_name</code>, <code>aw_deep_link</code> (product link),{" "}
          <code>large_image</code> or <code>merchant_image_url</code> (cover
          image), <code>merchant_category</code>
          <br />
          <br />
          Cover images are downloaded from the CSV link, cropped to a consistent
          ratio, and saved on our own server — not linked externally, and
          consistent with every other product image on the site.
          <br />
          <br />
          Rows missing a required value are skipped; you'll see a summary after
          upload. A CSV missing a required column entirely is rejected before it
          even uploads.
          <br />
          <br />
          All imported products are created as <strong>Published</strong> and go
          live immediately. Review the details afterward and edit any field if
          something needs fixing.
        </div>

        <Button
          icon={<DownloadOutlined />}
          onClick={handleDownloadTemplate}
          style={{ marginBottom: 16 }}
        >
          Download sample CSV
        </Button>

        <Upload.Dragger {...draggerProps}>
          <p className="ant-upload-drag-icon">
            <InboxOutlined />
          </p>
          <p className="ant-upload-text">Click or drag a CSV file to upload</p>
          <p className="ant-upload-hint">Only .csv files, max 5MB.</p>
        </Upload.Dragger>
      </Modal>
    </div>
  );
};

export default Shop;
