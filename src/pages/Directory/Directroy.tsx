/** @format */

import React, { useEffect, useState } from "react";
import {
    Table,
	Space,
	message,
	Modal,
	Form,
	Input,
	Select,
	Upload,
	Button,
	type TableColumnsType,
	type UploadFile,
	type UploadProps,
} from "antd";
import { PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined } from "@ant-design/icons";

import {
	AddDirectory,
	DeleteDirectory,
	GetAllDirectory,
	UpdateDirectory,
	GetAllCategories,
} from "../../services/Api/DirectoryApi";
import { type WithIndex } from "../../utils/table";
import type { DirectoryCategory, DirectoryEntry } from "../../types/directory";

const Directroy = () => {
	const [data, setData] = useState<WithIndex<DirectoryEntry>[]>([]);
	const [backupData, setBackupData] = useState<WithIndex<DirectoryEntry>[]>([]);
	const [categories, setCategories] = useState<DirectoryCategory[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState<number | null>(null);
	const [images, setImages] = useState<UploadFile[]>([]);

	const [form] = Form.useForm();

	const columns: TableColumnsType<WithIndex<DirectoryEntry>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "5%",
		},
		{
			title: "Image",
			dataIndex: "images",
			render: (img) =>
				img ? (
					<img
						src={img}
						crossOrigin="anonymous"
						alt="directory"
						style={{ width: 50, height: 50, objectFit: "cover" }}
					/>
				) : (
					"--"
				),
		},
		{
			title: "Directory Name",
			dataIndex: "title",
			width: "20%",
		},

		{
			title: "Categories",
			render: (_, record) =>
				record.categories && record.categories.length > 0
					? record.categories.map((c) => c.title).join(", ")
					: "--",
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
						onClick={() => handleDelete([record.id])}
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

			const result = await GetAllDirectory();

			const newData = result.data.rows.map((item, index) => ({
				...item,
				index: index + 1,
			}));

			setData(newData);
			setBackupData(newData);
		} catch {
			message.error("Failed to load directories");
		} finally {
			setLoading(false);
		}
	};

	const getCategories = async () => {
		try {
			const res = await GetAllCategories();
			setCategories(res.data.rows || []);
		} catch {
			message.error("Failed to load categories");
		}
	};

	useEffect(() => {
		getData();
		getCategories();
	}, []);

	const onSearch = (value: string) => {
		const filtered = backupData.filter((item) =>
			item.title.toLowerCase().includes(value.toLowerCase()),
		);
		setData(filtered);
	};

	const handleImageUpload: NonNullable<UploadProps["customRequest"]> = ({ file, onSuccess }) => {
		// antd hands customRequest the picked RcFile.
		const picked = file as NonNullable<UploadFile["originFileObj"]>;
		const newFile: UploadFile = {
			uid: picked.uid,
			name: picked.name,
			status: "done",
			url: URL.createObjectURL(picked),
			originFileObj: picked,
		};

		setImages([newFile]);

		onSuccess?.("ok");
	};

	const handleRemoveImage = () => {
		setImages([]);
	};

	const handleDelete = (ids: React.Key[]) => {
		Modal.confirm({
			title: "Delete Directory",
			content: "Are you sure you want to delete this directory?",
			onOk: async () => {
				await DeleteDirectory(ids);
				message.success("Directory deleted");
				getData();
			},
		});
	};

	const openAddModal = () => {
	setEditingId(null);
	setImages([]);
	form.resetFields();

	form.setFieldsValue({
		category_ids: [], // ✅ important
	});

	setModalVisible(true);
};

	const openEditModal = (record: DirectoryEntry) => {
		setEditingId(record.id);

		form.setFieldsValue({
			title: record.title,
			description: record.description,
			category_ids: record.categories?.map((c) => c.category_id),
		});

		if (record.images) {
			setImages([
				{
					uid: "-1",
					name: "directory-image",
					status: "done",
					url: record.images,
				},
			]);
		}

		setModalVisible(true);
	};

	const handleSubmit = async () => {
		const values = await form.validateFields();

		const formData = new FormData();
		formData.append("title", values.title);
		formData.append("description", values.description);

		if (images.length && images[0].originFileObj) {
			formData.append("images", images[0].originFileObj);
		}

		if (values.category_ids) {
			formData.append("category_ids", JSON.stringify(values.category_ids));
		}

		if (editingId) {
			await UpdateDirectory(editingId, formData);
			message.success("Directory updated");
		} else {
			await AddDirectory(formData);
			message.success("Directory created");
		}

		setModalVisible(false);
		getData();
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
					<h3 className="page-title">DIRECTORY MANAGEMENT</h3>
					<p className="page-sub-title">Manage professional directories</p>
				</div>

				<div style={{
				    display: "flex"
				}}>
					<Input
						type="search"
						onChange={(e) => onSearch(e.target.value)}
						placeholder="Search Directory..."
						prefix={<SearchOutlined />}
						size="large"
						style={{
						    width: 240
						}} />

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
				rowKey="id"
				dataSource={data}
				loading={loading}
			/>

			{/* =========================
			MODAL
			========================= */}

			<Modal
				title={editingId ? "Edit Directory" : "Add Directory"}
				open={modalVisible}
				onOk={handleSubmit}
				onCancel={() => setModalVisible(false)}
				width={700}
			>
				<Form form={form} layout="vertical">
					<Form.Item
						label="Directory Title"
						name="title"
						rules={[{ required: true }]}
					>
						<Input />
					</Form.Item>

					<Form.Item label="Description" name="description">
						<Input.TextArea rows={3} />
					</Form.Item>

					<Form.Item label="Image">
						<Upload
							customRequest={handleImageUpload}
							listType="picture-card"
							onRemove={handleRemoveImage}
							fileList={images}
						>
							{images.length < 1 && <PlusOutlined />}
						</Upload>
					</Form.Item>

					<Form.Item label="Categories" name="category_ids">
						<Select
							mode="multiple"
							placeholder="Select categories"
							options={categories.map((cat) => ({
								label: cat.title,
								value: cat.id,
							}))}
						/>
					</Form.Item>
				</Form>
			</Modal>
		</div>
	);
};

export default Directroy;
