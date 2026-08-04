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
} from "antd";
import { Button } from "primereact/button";
import { InputText } from "primereact/inputtext";
import { Box } from "@material-ui/core";
import { PlusOutlined } from "@ant-design/icons";
import moment from "moment";

import {
	AddDirectory,
	DeleteDirectory,
	GetAllDirectory,
	UpdateDirectory,
	GetAllCategories,
} from "../../services/Api/DirectoryApi";

const Directroy = () => {
	const [data, setData] = useState([]);
	const [backupData, setBackupData] = useState([]);
	const [categories, setCategories] = useState([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [editingId, setEditingId] = useState(null);
	const [images, setImages] = useState([]);

	const [form] = Form.useForm();

	const columns = [
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
						icon="pi pi-pencil"
						rounded
						outlined
						onClick={() => openEditModal(record)}
					/>
					<Button
						icon="pi pi-trash"
						rounded
						outlined
						severity="danger"
						onClick={() => handleDelete([record.id])}
					/>
				</Space>
			),
		},
	];

	const getData = async () => {
		try {
			setLoading(true);

			const result = await GetAllDirectory(localStorage.getItem("adminToken"), {
				limit: 100,
			});

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
			const res = await GetAllCategories(localStorage.getItem("adminToken"));
			setCategories(res.data.rows || []);
		} catch {
			message.error("Failed to load categories");
		}
	};

	useEffect(() => {
		getData();
		getCategories();
	}, []);

	const onSearch = (value) => {
		const filtered = backupData.filter((item) =>
			item.title.toLowerCase().includes(value.toLowerCase()),
		);
		setData(filtered);
	};

	const handleImageUpload = ({ file, onSuccess }) => {
		const newFile = {
			uid: file.uid,
			name: file.name,
			status: "done",
			url: URL.createObjectURL(file),
			originFileObj: file,
		};

		setImages([newFile]);

		onSuccess("ok");
	};

	const handleRemoveImage = () => {
		setImages([]);
	};

	const handleDelete = (ids) => {
		Modal.confirm({
			title: "Delete Directory",
			content: "Are you sure you want to delete this directory?",
			onOk: async () => {
				await DeleteDirectory(ids, localStorage.getItem("adminToken"));
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

	const openEditModal = (record) => {
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
			await UpdateDirectory(
				editingId,
				formData,
				localStorage.getItem("adminToken"),
			);
			message.success("Directory updated");
		} else {
			await AddDirectory(formData, localStorage.getItem("adminToken"));
			message.success("Directory created");
		}

		setModalVisible(false);
		getData();
	};

	return (
		<Box>
			<Box display="flex" justifyContent="space-between" marginBottom="20px">
				<div>
					<h3 className="page-title">DIRECTORY MANAGEMENT</h3>
					<p className="page-sub-title">Manage professional directories</p>
				</div>

				<Box display="flex">
					<span className="p-input-icon-left">
						{/* <i className="pi pi-search" /> */}
						<InputText
							type="search"
							onChange={(e) => onSearch(e.target.value)}
							placeholder="Search Directory..."
						/>
					</span>

					<Button
						icon="pi pi-plus"
						severity="info"
						style={{ marginLeft: "10px", height: "47px" }}
						onClick={openAddModal}
					/>
				</Box>
			</Box>

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
		</Box>
	);
};

export default Directroy;
