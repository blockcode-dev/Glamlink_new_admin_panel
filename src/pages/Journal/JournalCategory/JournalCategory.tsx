/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message, Modal, Form, Input, Button, type TableColumnsType } from "antd";
import dayjs from "dayjs";
import {
    DeleteJournalCategory,
    GetJournalCategory,
    AddJournalCategory,
    UpdateJournalCategory,
} from "../../../services/Api/JournalApi";

import { DeleteOutlined, EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { apiErrorMessage } from "../../../utils/apiError";
import { type WithIndex } from "../../../utils/table";
import type { JournalCategory } from "../../../types/journal";

const JournalCategory = () => {
    const [data, setData] = useState<WithIndex<JournalCategory>[]>([]);
    const [backupData, setBackupData] = useState<WithIndex<JournalCategory>[]>([]);
    const [loading, setLoading] = useState(false);
    const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
    const [modalVisible, setModalVisible] = useState(false);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [form] = Form.useForm();

    const columns: TableColumnsType<WithIndex<JournalCategory>> = [
        {
            title: "S.No.",
            dataIndex: "index",
            sorter: (a, b) => a.index - b.index,
            width: "10%",
        },
        {
            title: "Category Name",
            dataIndex: "title",
            sorter: (a, b) => a.title.localeCompare(b.title),
            width: "40%",
        },
        {
            title: "Created On",
            dataIndex: "created_at",
            width: "30%",
            render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
        },
        {
            title: "Action",
            render: (_, record) => (
                <Space>
                    <Button
                        onClick={() => openEditModal(record)}
                        icon={<EditOutlined />}
                        shape="circle" />
                    <Button
                        onClick={() => handleDelete([record.id], record.title)}
                        icon={<DeleteOutlined />}
                        danger
                        shape="circle" />
                </Space>
            ),
        },
    ];

    const getData = async () => {
        try {
            setLoading(true);
            const result = await GetJournalCategory();

            const newData = result.data.rows.map((item, index) => ({
                ...item,
                index: index + 1,
            }));

            setData(newData);
            setBackupData(newData);
        } catch (error) {
            message.error("Failed to load Journal Categories");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        getData();
    }, []);

    const onSearch = (value: string) => {
        const filtered = backupData.filter((item) =>
            item.title.toLowerCase().includes(value.toLowerCase())
        );
        setData(filtered);
    };

    // ✅ Pulls the journal names out of the backend error string and
    // shows them as a clean bullet list instead of one long raw sentence.
    const showBlockedDeleteError = (rawMessage: string, fallbackCategoryTitle?: string) => {
        // Backend message looks like:
        // Cannot delete category "undefined". The following journal(s) belong
        // to this category: "UPCOMING EVENTS". Please move these journal(s)
        // to another category before deleting this category.
        const journalMatch = rawMessage.match(
            /belong to this category:\s*(.+?)\.\s*Please move/i
        );

        const journalNames = journalMatch
            ? journalMatch[1]
                  .split(",")
                  .map((name) => name.replace(/["“”]/g, "").trim())
                  .filter(Boolean)
            : [];

        Modal.error({
            title: "Can't Delete This Category",
            width: 480,
            content: (
                <div>
                    <p style={{ marginBottom: 8 }}>
                        <strong>{fallbackCategoryTitle || "This category"}</strong>{" "}
                        still has {journalNames.length > 1 ? "journals" : "a journal"}{" "}
                        linked to it:
                    </p>

                    {journalNames.length > 0 ? (
                        <ul style={{ paddingLeft: 20, marginBottom: 8 }}>
                            {journalNames.map((name) => (
                                <li key={name}>{name}</li>
                            ))}
                        </ul>
                    ) : (
                        <p style={{ marginBottom: 8 }}>{rawMessage}</p>
                    )}

                    <p style={{ marginBottom: 0 }}>
                        Move {journalNames.length > 1 ? "these journals" : "this journal"}{" "}
                        to another category first, then try deleting again.
                    </p>
                </div>
            ),
            okText: "Got it",
        });
    };

    const handleDelete = (ids: React.Key[], categoryTitle?: string) => {
        if (!ids.length) return;

        Modal.confirm({
            title: "Delete Journal Category",
            content: `Are you sure you want to delete ${
                ids.length > 1 ? "these categories" : "this category"
            }?`,
            onOk: async () => {
                try {
                    await DeleteJournalCategory(ids);

                    message.success("Journal Category deleted successfully");
                    setSelectedRowKeys([]);
                    getData();
                } catch (error) {
                    const rawMessage =
                        apiErrorMessage(error) ||
                        (error instanceof Error ? error.message : undefined) ||
                        "Failed to delete Journal Category";

                    if (/belong to this category/i.test(rawMessage)) {
                        showBlockedDeleteError(rawMessage, categoryTitle);
                    } else {
                        message.error(rawMessage);
                    }
                }
            },
        });
    };

    // ✅ Open Add Modal
    const openAddModal = () => {
        setEditingId(null);
        form.resetFields();
        setModalVisible(true);
    };

    // ✅ Open Edit Modal
    const openEditModal = (record: JournalCategory) => {
        setEditingId(record.id);
        form.setFieldsValue({ title: record.title });
        setModalVisible(true);
    };

    // ✅ Submit Add / Edit
    const handleSubmit = async () => {
        try {
            const values = await form.validateFields();
            const formData = new FormData();
            formData.append("title", values.title);

            if (editingId) {
                await UpdateJournalCategory(editingId, formData);
                message.success("Journal Category updated successfully");
            } else {
                await AddJournalCategory(formData);
                message.success("Journal Category added successfully");
            }

            setModalVisible(false);
            form.resetFields();
            getData();
        } catch {
            message.error("Something went wrong. Please try again.");
        }
    };

    const rowSelection = {
        selectedRowKeys,
        onChange: setSelectedRowKeys,
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
                    <h3 className="page-title">JOURNAL CATEGORY</h3>
                    <p className="page-sub-title">
                        View, add, edit, and delete Journal Categories
                    </p>
                </div>

                <div style={{
                    display: "flex"
                }}>
                    <Input
                        type="search"
                        onChange={(e) => onSearch(e.target.value)}
                        placeholder="Search Category..."
                        prefix={<SearchOutlined />}
                        size="large"
                        style={{
                            width: 240
                        }} />

                    <Button
                        style={{
                            marginLeft: "10px"
                        }}
                        onClick={() => handleDelete(selectedRowKeys)}
                        disabled={!selectedRowKeys.length}
                        icon={<DeleteOutlined />}
                        danger
                        size="large" />

                    <Button
                        style={{
                            marginLeft: "10px"
                        }}
                        onClick={openAddModal}
                        icon={<PlusOutlined />}
                        type="primary"
                        size="large" />
                </div>
            </div>

            <Table
                columns={columns}
                rowKey={(record) => record.id}
                dataSource={data}
                loading={loading}
                rowSelection={rowSelection}
            />

            {/* ✅ Add/Edit Modal */}
            <Modal
                title={editingId ? "Edit Journal Category" : "Add Journal Category"}
                open={modalVisible}
                onOk={handleSubmit}
                onCancel={() => setModalVisible(false)}
                okText={editingId ? "Update" : "Add"}
            >
                <Form form={form} layout="vertical">
                    <Form.Item
                        label="Category Name"
                        name="title"
                        rules={[
                            { required: true, message: "Category name is required" },
                        ]}
                    >
                        <Input placeholder="Enter category name" />
                    </Form.Item>
                </Form>
            </Modal>
        </div>
    );
};

export default JournalCategory;