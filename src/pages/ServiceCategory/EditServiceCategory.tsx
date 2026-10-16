/** @format */

import React, { useEffect, useState } from "react";
import { BASE_URL } from "../../services/Host";
import { useNavigate } from "react-router";
import { Card, Modal, Space, Table, Button, Row } from "antd";
import { message, Form, Input } from "antd";
import dayjs from "dayjs";
import RichTextEditor from "../../components/RichTextEditor";
import {
	GetServiceCategoryById,
	GetServiceListByCategoryId,
	UpdateServiceCategory,
	CreateSerice,
	UpdateService,
	DeleteService,
} from "../../services/Api/ServiceApi";
import Papa from "papaparse";

import {
    ArrowLeftOutlined,
	CheckOutlined,
	CloseOutlined,
	CloudUploadOutlined,
	DeleteOutlined,
	EditOutlined,
	PlusOutlined,
	SearchOutlined,
} from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { clearSession } from "../../utils/session";
import { useIdParam } from "../../utils/routing";
import SafeHtml from "../../components/SafeHtml";
import type { ServiceCategory, ServiceListItem } from "../../types/catalog";

const EditServiceCategory = () => {
	const [form] = Form.useForm();
	const id = useIdParam();
	const navigate = useNavigate();
	const [serviceListData, setServiceListData] = useState<ServiceListItem[]>([]);
	const [serviceTitle, setServiceTitle] = useState("");
	const [serviceDescription, setServiceDescription] = useState("");
	const [loading, setLoading] = useState(true);
	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isEditModalVisible, setIsEditModalVisible] = useState(false);
	const [serviceListId, setServicelistId] = useState<number | string>("");
	const [selectedRows, setSelectedRows] = useState<React.Key[]>([]);
	const [serviceData, setServiceData] = useState<Partial<ServiceCategory>>({ title: "" });
	const [serviceBackupData, setServiceBackupData] = useState<ServiceListItem[]>([]);
	const [csvData, setCsvData] = useState<{ title: string; category_id: string }[]>([]);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const categoryResponse = await GetServiceCategoryById(id);
				setServiceData(categoryResponse.data.data);
				const serviceListResponse = await GetServiceListByCategoryId(id);
				setServiceListData(serviceListResponse.data.data);
				setServiceBackupData(serviceListResponse.data.data);
			} catch (err) {
				console.error("Error fetching data", err);
			} finally {
				setLoading(false);
			}
		};

		fetchData();
	}, [id]);

	if (loading) {
		return <p>Loading...</p>;
	}

	const handleSubmit = (e: React.MouseEvent<HTMLElement>) => {
		e.preventDefault();
		setLoadingSubmit(true); // Set loading to true when submit starts
		const formData = new FormData();
		formData.append("title", serviceData?.title ? serviceData?.title : "");
		UpdateServiceCategory(id, formData)
			.then((res) => {
				if (res.status === 200) {
					message.success("Category edited successfully!");
				}
			})
			.catch((err) => {
				if (apiErrorStatus(err) === 401) {
					message.error("Token expired!");
					clearSession();
					setTimeout(() => {
						navigate("/login");
					}, 3000);
				} else {
					message.error("Something went wrong");
				}
			})
			.finally(() => {
				setLoadingSubmit(false); // Reset loading after submission is done
			});
	};

	const onChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setServiceData({ ...serviceData, [e.target.name]: e.target.value });
	};

	const handleServiceSubmit = async () => {
		try {
			const formData = new FormData();
			formData.append("title", serviceTitle);
			formData.append("category_id", id);

			const response = await CreateSerice(formData);

			if (response.status === 200) {
				message.success("Service added successfully!");
				setIsModalVisible(false);
				const updatedServiceListResponse = await GetServiceListByCategoryId(id);
				setServiceListData(updatedServiceListResponse.data.data);
			}
		} catch (error) {
			if (apiErrorStatus(error) === 401) {
				message.error("Token expired");
				clearSession();
				setTimeout(() => {
					navigate("/Login");
				}, 1000);
			} else {
				message.error("Something went wrong");
			}
		}
	};

	const handleServiceEditSubmit = async () => {
		try {
			const formData = new FormData();
			formData.append("title", serviceTitle);
			formData.append("description", serviceDescription);

			const response = await UpdateService(serviceListId, formData);

			if (response.status === 200) {
				message.success("Service updated successfully!");
				setIsEditModalVisible(false);
				const updatedServiceListResponse = await GetServiceListByCategoryId(id);
				setServiceListData(updatedServiceListResponse.data.data);
			}
		} catch (error) {
			if (apiErrorStatus(error) === 401) {
				message.error("Token expired");
				clearSession();
				setTimeout(() => {
					navigate("/Login");
				}, 1000);
			} else {
				message.error("Something went wrong");
			}
		}
	};

	const navigateToService = () => {
		navigate("/service-categories");
	};

	const handleOpenModal = () => {
		setIsModalVisible(true); // Open the modal
	};

	const handleCloseModal = () => {
		setIsModalVisible(false); // Close the modal
		form.resetFields(); // Optionally reset form fields
	};

	const handleCloseEditModal = () => {
		setIsEditModalVisible(false); // Close the edit modal
	};

	const handleOpenEditModal = (service: ServiceListItem) => {
		setServiceTitle(service.title ?? "");
		setServicelistId(service.id);
		setServiceDescription(service.description || "");
		setIsEditModalVisible(true); // Open the edit modal
	};

	const rowSelection = {
		onChange: (selectedRowKeys: React.Key[], selectedRows: ServiceListItem[]) => {
			const selectedIds = selectedRows.map((row) => row.id); // Collect only the IDs
			setSelectedRows(selectedIds); // Store the selected IDs
		},
	};

	const handleDelete = (blogIds: React.Key[]) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Service" : "this Service"
			}?`,
			onOk: async () => {
				try {
					await DeleteService(blogIds);
					message.success("Service(s) deleted successfully");
					const updatedServiceListResponse = await GetServiceListByCategoryId(
						id
					);
					setServiceListData(updatedServiceListResponse.data.data);
				} catch (error) {
					console.error("Error deleting Service(s):", error);
					message.error("Error deleting Service(s)");
				}
			},
		});
	};

	const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			Papa.parse<{ title: string }>(file, {
				header: true,
				skipEmptyLines: true,
				complete: (results) => {
					const formattedData = results.data.map((row) => ({
						title: row.title,
						category_id: id,
					}));
					setCsvData(formattedData);
				},
			});
		}
	};

	const handleUploadClick = async () => {
		if (csvData.length > 0) {
			try {
				const response = await fetch(
					`${BASE_URL}admin/create-service-list`,
					{
						method: "POST",
						headers: {
							"Content-Type": "application/json",
						},
						body: JSON.stringify({ services: csvData }),
					}
				);
				const result = await response.json();
				if (response.ok) {
					message.success("CSV uploaded successfully!");
					const updatedServiceListResponse = await GetServiceListByCategoryId(
						id
					);
					setServiceListData(updatedServiceListResponse.data.data);
				} else {
					message.error("Error uploading CSV: " + result.message);
				}
			} catch (error) {
				console.error("Error uploading CSV data:", error);
				message.error("Error uploading CSV data");
			}
		} else {
			message.error("No CSV data to upload");
		}
	};

	const onSearch = (searchField: string) => {
		// Filter serviceListData based on the search input
		const filteredList = serviceBackupData.filter((item) =>
			item.title?.toLowerCase().includes(searchField.toLowerCase())
		);
		setServiceListData(filteredList); // Update the displayed service list
	};

	const handleEditorChange = (data: string) => {
	    setServiceDescription(data);
	};

	const handleEditorChangeUpdate = (data: string) => {
	    setServiceDescription(data); // Just set the data directly
	};

	return (
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">Update Category</h3>
					<p className="page-sub-title">Edit Details of Service Category</p>
				</div>

				<div>
					<Button
						onClick={navigateToService}
						style={{
						    borderRadius: "5px"
						}}
						icon={<ArrowLeftOutlined />}
						size="large"
					>
						<span style={{ marginLeft: "5px" }}>Return to Category</span>
					</Button>
				</div>
			</div>
			<Card style={{ width: "100%" }}>
				<Form>
					<Row gutter={24}>
						<Form form={form} onFinish={handleSubmit} layout="vertical">
							<Form.Item label="Title:" name="title">
								<Input
									name="title"
									defaultValue={serviceData?.title}
									onChange={onChange}
								/>
							</Form.Item>
						</Form>
					</Row>

					<div style={{ marginTop: "20px" }}>
						<Button
							onClick={handleSubmit}
							loading={loadingSubmit}
							style={{
							    borderRadius: "5px"
							}}
							icon={<CheckOutlined />}
							type="primary"
							size="large">
							Save
						</Button>
					</div>
				</Form>
			</Card>
			{/* Second service container */}
			<Card style={{ width: "100%", marginTop: "20px" }}>
				<div
					style={{
					    display: "flex",
					    justifyContent: "space-between",
					    alignItems: "center",
					    marginBottom: "10px"
					}}>
					<div>
						<h3 className="page-title">SERVICE LIST</h3>
						<p className="page-sub-title">
							View Service List of {serviceData.title}
						</p>
					</div>
					<div>
						<Input
							type="search"
							onChange={(e) => {
								onSearch(e.target.value);
							}}
							placeholder="Search..."
							prefix={<SearchOutlined />}
							size="large"
							style={{
							    width: 240
							}} />
						<Button
							style={{
							    marginLeft: "10px",
							    borderRadius: "5px",
							    cursor: "pointer"
							}}
							onClick={() => handleDelete(selectedRows)}
							disabled={!selectedRows.length}
							icon={<DeleteOutlined />}
							danger
							size="large" />
						<Button
							style={{
							    borderRadius: "5px",
							    marginLeft: "10px"
							}}
							// Open the modal on click
							onClick={handleOpenModal}
							icon={<PlusOutlined />}
							type="primary"
							size="large" />
					</div>
				</div>
				<div style={{ marginBottom: "20px" }}>
					<input type="file" accept=".csv" onChange={handleFileUpload} />
					<Button
						onClick={handleUploadClick}
						style={{
						    borderRadius: "5px"
						}}
						icon={<CloudUploadOutlined />}
						type="primary"
						size="large">Upload CSV</Button>
				</div>
				<Table
					columns={[
						{
							title: "S.No.",
							render: (_, record, index) => index + 1, // Auto-incrementing index
							width: "10%",
						},
						{
							title: "Service Name",
							dataIndex: "title",
							key: "title",
							width: "20%",
						},
						{
							title: "Service Description",
							dataIndex: "description",
							key: "description", // Change the key to "description" to match the dataIndex
							render: (text) => {
								const truncatedText =
									text && text.length > 30
										? `${text.substring(0, 30)}...`
										: text || "";
								return (
									<SafeHtml as="span" html={truncatedText} />
								);
							},
							width: "40%",
						},
						{
							title: "Created On",
							dataIndex: "created_at",
							width: "20%",
							render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
						},
						{
							title: "Action",
							dataIndex: "action",
							render: (_, record) => (
								<Space size="middle">
									<Button
										style={{ margin: "0px", borderRadius: "25px" }}
										onClick={() => handleOpenEditModal(record)}
										icon={<EditOutlined />}
										shape="circle" />
									<Button
										style={{
											borderRadius: "25px",
											color: "var(--color-error)",
											borderColor: "var(--color-error)",
										}}
										onClick={() => handleDelete([record.id])}
										icon={<DeleteOutlined />}
										danger
										shape="circle" />
								</Space>
							),
						},
					]}
					dataSource={serviceListData}
					rowKey={(record) => record.id}
					pagination={false}
					rowSelection={rowSelection}
				/>

				<Modal
					centered
					width={600}
					title="Add New Service"
					open={isModalVisible} // Control the modal visibility
					onCancel={handleCloseModal} // Handle modal close
					footer={null}
				>
					<Form form={form} onFinish={handleServiceSubmit} layout="vertical">
						<Form.Item
							name="setServiceTitle"
							label="Service Name"
							rules={[{ required: true, message: "Please enter Service Name" }]}
						>
							<Input
								placeholder="Service Name"
								onChange={(e) => setServiceTitle(e.target.value)} // Update serviceTitle state
							/>
						</Form.Item>

						<Form.Item
							label="Description"
							name="description"
						>
							<RichTextEditor onChange={handleEditorChange} />
						</Form.Item>
						<Form.Item>
							<Button
								style={{
								    borderRadius: "5px"
								}}
								icon={<CheckOutlined />}
								htmlType="submit"
								type="primary"
								size="large">Save</Button>

							<Button
								onClick={handleCloseModal}
								style={{
								    marginLeft: "10px",
								    marginTop: "10px",
								    borderRadius: "5px"
								}}
								icon={<CloseOutlined />}
								size="large">Cancel</Button>
						</Form.Item>
					</Form>
				</Modal>

				<Modal
					title="Edit Service"
					open={isEditModalVisible}
					onOk={handleServiceEditSubmit}
					onCancel={handleCloseEditModal}
					centered
					width={600}
					footer={null}
				>
					<Form layout="vertical">
						<Form.Item label="Service Title:">
							<Input
								value={serviceTitle}
								onChange={(e) => setServiceTitle(e.target.value)}
							/>
						</Form.Item>

						<Form.Item label="Description:" name="description">
							<RichTextEditor value={serviceDescription} onChange={handleEditorChangeUpdate} />
						</Form.Item>
						<Form.Item>
							<Button
								onClick={handleServiceEditSubmit}
								style={{
								    borderRadius: "5px"
								}}
								icon={<CheckOutlined />}
								htmlType="submit"
								type="primary"
								size="large">Save</Button>

							<Button
								onClick={handleCloseEditModal}
								style={{
								    marginLeft: "10px",
								    marginTop: "10px",
								    borderRadius: "5px"
								}}
								icon={<CloseOutlined />}
								size="large">Cancel</Button>
						</Form.Item>
					</Form>
				</Modal>
			</Card>
		</div>
	);
};

export default EditServiceCategory;
