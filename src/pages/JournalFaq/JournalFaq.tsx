/** @format */

import React, { useEffect, useState } from "react";
import {
  Table,
  Button,
  Input,
  Modal,
  Form,
  Tag,
  Tooltip,
  message,
  type TableColumnsType,
} from "antd";
import {
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
  QuestionCircleOutlined,
} from "@ant-design/icons";
import {
  CreateJournalFaq,
  GetAllJournalFaqs,
  UpdateJournalFaq,
  DeleteJournalFaq,
} from "../../services/Api/JournalApi";
import styles from "./JournalFaq.module.scss";
import type { JournalFaq } from "../../types/journal";
import { listFromResponse } from "../../utils/apiList";
import { isFormValidationError } from "../../utils/apiError";

const { Search } = Input;

const JournalFaq = () => {
  const [form] = Form.useForm();

  const [data, setData] = useState<JournalFaq[]>([]);
  const [filteredData, setFilteredData] = useState<JournalFaq[]>([]);

  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editingFaq, setEditingFaq] = useState<JournalFaq | null>(null);

  const getData = async () => {
    try {
      setLoading(true);

      const result = await GetAllJournalFaqs();

      const rows = listFromResponse(result?.data);

      setData(rows);
      setFilteredData(rows);
    } catch (error) {
      console.error(error);
      message.error("Failed to load FAQs");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    getData();
  }, []);

  const handleSearch = (value: string) => {
    const search = value.trim().toLowerCase();

    if (!search) {
      setFilteredData(data);
      return;
    }

    setFilteredData(
      data.filter(
        (item) =>
          item.question?.toLowerCase().includes(search) ||
          item.answer?.toLowerCase().includes(search),
      ),
    );
  };

  const openCreateModal = () => {
    setEditingFaq(null);
    form.resetFields();
    setModalOpen(true);
  };

  const openEditModal = (record: JournalFaq) => {
    setEditingFaq(record);

    form.setFieldsValue({
      question: record.question,
      answer: record.answer,
    });

    setModalOpen(true);
  };

  const handleModalCancel = () => {
    if (submitting) return;

    setModalOpen(false);
    setEditingFaq(null);
    form.resetFields();
  };

  const handleSubmit = async () => {
    try {
      const values = await form.validateFields();

      setSubmitting(true);

      if (editingFaq) {
        await UpdateJournalFaq(editingFaq.id, values);
        message.success("FAQ updated successfully");
      } else {
        await CreateJournalFaq(values);
        message.success("FAQ created successfully");
      }

      setModalOpen(false);
      setEditingFaq(null);
      form.resetFields();

      await getData();
    } catch (error) {
      console.error(error);

      if (isFormValidationError(error)) {
        return;
      }

      message.error(
        editingFaq
          ? "Failed to update FAQ"
          : "Failed to create FAQ",
      );
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = (id: number) => {
    Modal.confirm({
      title: "Delete FAQ",
      icon: <QuestionCircleOutlined />,
      content:
        "Are you sure you want to delete this FAQ? It will no longer be available for Journal mapping.",
      okText: "Delete",
      okButtonProps: {
        danger: true,
      },
      cancelText: "Cancel",
      onOk: async () => {
        try {
          await DeleteJournalFaq([id]);

          message.success("FAQ deleted successfully");

          getData();
        } catch (error) {
          console.error(error);
          message.error("Failed to delete FAQ");
        }
      },
    });
  };

  const columns: TableColumnsType<JournalFaq> = [
    {
      title: "#",
      width: 60,
      render: (_, __, index) => index + 1,
    },

    {
      title: "Question",
      dataIndex: "question",
      width: 350,
      render: (text) => (
        <div className={styles.questionCell}>
          {text || "-"}
        </div>
      ),
    },

    {
      title: "Answer",
      dataIndex: "answer",
      width: 500,
      render: (text) => (
        <div className={styles.answerCell}>
          {text?.length > 180
            ? `${text.substring(0, 180)}...`
            : text || "-"}
        </div>
      ),
    },

    {
      title: "Status",
      dataIndex: "is_active",
      width: 100,
      align: "center",
      render: (active) => (
        <Tag color={active ? "green" : "default"}>
          {active ? "Active" : "Inactive"}
        </Tag>
      ),
    },

    {
      title: "Action",
      width: 100,
      align: "center",
      render: (_, record) => (
        <div className={styles.actionButtons}>
          <Tooltip title="Edit FAQ">
            <button
              type="button"
              className={`${styles.iconButton} ${styles.iconButtonEdit}`}
              onClick={() => openEditModal(record)}
            >
              <EditOutlined />
            </button>
          </Tooltip>

          <Tooltip title="Delete FAQ">
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

  return (
    <div className={styles.page}>
      <div className={styles.headerCard}>
        <div>
          <h3 className={styles.headerTitle}>
            Journal FAQs
          </h3>

          <p className={styles.headerSubtitle}>
            Manage reusable questions and answers that can be
            assigned to multiple Journal articles.
          </p>
        </div>

        <div className={styles.headerActions}>
          <Search
            placeholder="Search FAQ..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            style={{ width: 280 }}
          />

          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={openCreateModal}
          >
            Add FAQ
          </Button>
        </div>
      </div>

      <div className={styles.tableCard}>
        <Table
          rowKey="id"
          columns={columns}
          dataSource={filteredData}
          loading={loading}
          scroll={{ x: "max-content" }}
          pagination={{
            pageSize: 20,
            showSizeChanger: false,
          }}
        />
      </div>

      <Modal
        open={modalOpen}
        title={editingFaq ? "Edit FAQ" : "Add FAQ"}
        okText={editingFaq ? "Update FAQ" : "Create FAQ"}
        cancelText="Cancel"
        onCancel={handleModalCancel}
        onOk={handleSubmit}
        confirmLoading={submitting}
        destroyOnHidden
        width={700}
      >
        <Form
          form={form}
          layout="vertical"
          style={{ marginTop: 20 }}
        >
          <Form.Item
            name="question"
            label="Question"
            rules={[
              {
                required: true,
                message: "Question is required",
              },
            ]}
          >
            <Input
              maxLength={500}
              showCount
              placeholder="Enter question"
            />
          </Form.Item>

          <Form.Item
            name="answer"
            label="Answer"
            rules={[
              {
                required: true,
                message: "Answer is required",
              },
            ]}
          >
            <Input.TextArea
              rows={8}
              placeholder="Enter answer"
            />
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default JournalFaq;