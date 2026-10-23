/** @format */

import React, { useEffect, useState } from "react";
import {
    Table,
	Space,
	message,
	Modal,
	Form,
	Input,
	Upload,
	Button,
	type TableColumnsType,
	type UploadFile,
	type UploadProps,
} from "antd";
import { UploadOutlined, PlusOutlined } from "@ant-design/icons";
import {
	GetAllAuthors,
	UpdateAuthors,
	DeleteAuthors,
	AddAuthors,
} from "../../../services/Api/JournalApi";
import { type WithIndex } from "../../../utils/table";
import type { Author } from "../../../types/journal";

const { Search } = Input;

const Authors = () => {
	const [data, setData] = useState<WithIndex<Author>[]>([]);
	const [backupData, setBackupData] = useState<WithIndex<Author>[]>([]);
	const [loading, setLoading] = useState(false);

	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [fileList, setFileList] = useState<UploadFile[]>([]);

	const [form] = Form.useForm();

	// ================= TABLE =================

	const columns: TableColumnsType<WithIndex<Author>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "5%",
		},
		{
			title: "Profile",
			dataIndex: "profile_image",
			render: (img) =>
				img ? (
					<img
						src={img}
						alt="profile"
						style={{
							width: 40,
							height: 40,
							borderRadius: "50%",
							objectFit: "cover",
						}}
					/>
				) : (
					"-"
				),
			width: "10%",
		},
		{
			title: "Name",
			dataIndex: "name",
			width: "20%",
		},
		{
			title: "Designation",
			dataIndex: "designation",
			width: "20%",
		},
		{
			title: "Bio",
			dataIndex: "bio",
			render: (bio) => (bio?.length > 80 ? bio.substring(0, 80) + "..." : bio),
			width: "30%",
		},
		{
			title: "Action",
			render: (_, record) => (
				<Space>
					<Button type="link" onClick={() => openEditModal(record)}>
						Edit
					</Button>
					<Button type="link" danger onClick={() => handleDelete([record.id])}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	// ================= FETCH =================

	const getData = async () => {
		try {
			setLoading(true);
			const result = await GetAllAuthors();

			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1,
			}));

			setData(newData);
			setBackupData(newData);
		} catch {
			message.error("Failed to load Authors");
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	// ================= SEARCH =================

	const onSearch = (value: string) => {
		const filtered = backupData.filter(
			(item) =>
				item.name.toLowerCase().includes(value.toLowerCase()) ||
				item.designation?.toLowerCase().includes(value.toLowerCase()),
		);
		setData(filtered);
	};

	// ================= DELETE =================

	const handleDelete = (ids: React.Key[]) => {
		Modal.confirm({
			title: "Delete Author",
			content: "Are you sure you want to delete this author?",
			onOk: async () => {
				try {
					await DeleteAuthors(ids);
					message.success("Author deleted successfully");
					getData();
				} catch {
					message.error("Failed to delete Author");
				}
			},
		});
	};
	// ================= ADD =================

	const openAddModal = () => {
		setEditingId(null);
		form.resetFields();
		setFileList([]);
		setModalVisible(true);
	};

	// ================= EDIT =================

	const openEditModal = (record: Author) => {
		setEditingId(record.id);

		form.setFieldsValue({
			name: record.name,
			designation: record.designation,
			bio: record.bio,
		});

		setFileList(
			record.profile_image
				? [
						{
							uid: "-1",
							name: "profile.png",
							status: "done",
							url: record.profile_image,
						},
					]
				: [],
		);

		setModalVisible(true);
	};

	// ================= IMAGE =================

	const handleFileChange: NonNullable<UploadProps["onChange"]> = ({ fileList: newFileList }) => {
		setFileList(newFileList);

		if (newFileList.length === 0) {
		}
	};

	// ================= SUBMIT =================

	const handleSubmit = async () => {
		try {
			const values = await form.validateFields();

			const formData = new FormData();
			formData.append("name", values.name);
			formData.append("designation", values.designation);
			formData.append("bio", values.bio);

			// If new file selected
			if (fileList.length > 0 && fileList[0].originFileObj) {
				formData.append("images", fileList[0].originFileObj);
			}

			// If editing and no new file selected → DO NOT send profile_image
			// Backend should keep old image

			if (editingId) {
				await UpdateAuthors(editingId, formData);
				message.success("Author updated successfully");
			} else {
				await AddAuthors(formData);
				message.success("Author added successfully");
			}

			setModalVisible(false);
			form.resetFields();
			setFileList([]);
			getData();
		} catch (err) {
			message.error("Something went wrong.");
		}
	};

	return (
		<div>
			{/* HEADER */}
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3>AUTHORS</h3>
					<p>View, add, edit, and delete Authors</p>
				</div>

				<Space>
					<Search
						placeholder="Search Author..."
						allowClear
						onChange={(e) => onSearch(e.target.value)}
						style={{ width: 250 }}
					/>
					<Button type="primary" icon={<PlusOutlined />} onClick={openAddModal}>
						Add Author
					</Button>
				</Space>
			</div>

			<Table
				columns={columns}
				rowKey="id"
				dataSource={data}
				loading={loading}
			/>

			{/* MODAL */}

			<Modal
				title={editingId ? "Edit Author" : "Add Author"}
				open={modalVisible}
				onOk={handleSubmit}
				onCancel={() => setModalVisible(false)}
				okText={editingId ? "Update" : "Add"}
			>
				<Form form={form} layout="vertical">
					<Form.Item label="Name" name="name" rules={[{ required: true }]}>
						<Input />
					</Form.Item>

					<Form.Item
						label="Designation"
						name="designation"
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>

					<Form.Item label="Bio" name="bio" rules={[{ required: true }]}>
						<Input.TextArea rows={4} />
					</Form.Item>

					<Form.Item label="Profile Image">
						<Upload
							fileList={fileList}
							beforeUpload={() => false}
							onChange={handleFileChange}
							listType="picture"
							maxCount={1}
						>
							<Button icon={<UploadOutlined />}>Upload Image</Button>
						</Upload>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Authors;
