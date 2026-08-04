/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card, Modal, Space, Table } from "antd";
import { message, Form, Input } from "antd";
import { Row } from "react-bootstrap";
import { Button } from "primereact/button";
import moment from "moment/moment";
import { InputText } from "primereact/inputtext";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import {
	GetServiceCategoryById,
	GetServiceListByCategoryId,
	UpdateServiceCategory,
	CreateSerice,
	UpdateService,
	DeleteService,
} from "../../services/Api/ServiceApi";
import Papa from "papaparse";


const EditServiceCategory = () => {
	const [form] = Form.useForm();
	const { id } = useParams();
	const navigate = useNavigate();
	const [serviceListData, setServiceListData] = useState([]);
	const [serviceTitle, setServiceTitle] = useState("");
	const [serviceDescription, setServiceDescription] = useState("");
	const [loading, setLoading] = useState(true);
	const [loadingSubmit, setLoadingSubmit] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [isEditModalVisible, setIsEditModalVisible] = useState(false);
	const [serviceListId, setServicelistId] = useState("");
	const [selectedRows, setSelectedRows] = useState([]);
	const [serviceData, setServiceData] = useState({ title: "" });
	const [serviceBackupData, setServiceBackupData] = useState([]);
	const [csvData, setCsvData] = useState([]);

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

	const handleSubmit = (e) => {
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
				if (err.response && err.response.status === 401) {
					message.error("Token expired!");
					localStorage.removeItem("adminToken");
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

	const onChange = (e) => {
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
			if (error.response.status === 401) {
				message.error("Token expired");
				localStorage.removeItem("adminToken");
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
			if (error.response.status === 401) {
				message.error("Token expired");
				localStorage.removeItem("adminToken");
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

	const handleOpenEditModal = (service) => {
		setServiceTitle(service.title);
		setServicelistId(service.id);
		setServiceDescription(service.description || "");
		setIsEditModalVisible(true); // Open the edit modal
	};

	const rowSelection = {
		onChange: (selectedRowKeys, selectedRows) => {
			const selectedIds = selectedRows.map((row) => row.id); // Collect only the IDs
			setSelectedRows(selectedIds); // Store the selected IDs
		},
	};

	const handleDelete = (blogIds) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Service" : "this Service"
			}?`,
			onOk: async () => {
				try {
					await DeleteService(blogIds, localStorage.getItem("adminToken"));
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

	const handleFileUpload = (event) => {
		const file = event.target.files[0];
		if (file) {
			Papa.parse(file, {
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
					"https://node.glamlink.net/api/v1/admin/create-service-list",
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

	const onSearch = (searchField) => {
		// Filter serviceListData based on the search input
		const filteredList = serviceBackupData.filter((item) =>
			item.title.toLowerCase().includes(searchField.toLowerCase())
		);
		setServiceListData(filteredList); // Update the displayed service list
	};

	const handleEditorChange = (event, editor) => {
		const data = editor.getData();
		setServiceDescription(data);
	};

	const handleEditorChangeUpdate = (event, editor) => {
		const data = editor.getData();
		setServiceDescription(data); // Just set the data directly
	};
	

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<Box>
					<h3 className="page-title">Update Category</h3>
					<p className="page-sub-title">Edit Details of Service Category</p>
				</Box>

				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToService}
						style={{ borderRadius: "5px", height: "47px" }}
					>
						<span style={{ marginLeft: "5px" }}>Return to Category</span>
					</Button>
				</div>
			</Box>
			<Card style={{ width: "100%" }}>
				<Form>
					<Row>
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
							icon="pi pi-check"
							severity="info"
							onClick={handleSubmit}
							loading={loadingSubmit}
							style={{
								height: "45px",
								padding: "20px",
								borderRadius: "5px",
							}}
						>
							Save
						</Button>
					</div>
				</Form>
			</Card>
			{/* Second service container */}
			<Card style={{ width: "100%", marginTop: "20px" }}>
				<Box
					display="flex"
					justifyContent="space-between"
					alignItems="center"
					marginBottom="10px"
				>
					<div>
						<h3 className="page-title">SERVICE LIST</h3>
						<p className="page-sub-title">
							View Service List of {serviceData.title}
						</p>
					</div>
					<Box>
						<span className="p-input-icon-left">
							<i className="pi pi-search" />
							<InputText
								type="search"
								onChange={(e) => {
									onSearch(e.target.value);
								}}
								placeholder="Search..."
							/>
						</span>
						<Button
							icon="pi pi-trash"
							severity="danger"
							style={{
								marginLeft: "10px",
								borderRadius: "5px",
								height: "47px",
								cursor: "pointer",
							}}
							onClick={() => handleDelete(selectedRows)}
							disabled={!selectedRows.length}
						/>
						<Button
							icon="pi pi-plus"
							severity="info"
							style={{
								borderRadius: "5px",
								height: "47px",
								marginLeft: "10px",
							}}
							onClick={handleOpenModal} // Open the modal on click
						/>
					</Box>
				</Box>
				<Box style={{ marginBottom: "20px" }}>
					<input type="file" accept=".csv" onChange={handleFileUpload} />
					<Button
						icon="pi pi-cloud-upload"
						label="Upload CSV"
						severity="success"
						onClick={handleUploadClick}
						style={{
							borderRadius: "5px",
							height: "47px",
						}}
					/>
				</Box>
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
									<span dangerouslySetInnerHTML={{ __html: truncatedText }} />
								);
							},
							width: "40%",
						},
						{
							title: "Created On",
							dataIndex: "created_at",
							width: "20%",
							render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
						},
						{
							title: "Action",
							dataIndex: "action",
							render: (_, record) => (
								<Space size="middle">
									<Button
										icon="pi pi-pencil"
										rounded
										outlined
										className="mr-2"
										style={{ margin: "0px", borderRadius: "25px" }}
										onClick={() => handleOpenEditModal(record)}
									/>
									<Button
										icon="pi pi-trash"
										rounded
										outlined
										severity="danger"
										style={{
											borderRadius: "25px",
											color: "red",
											borderColor: "red",
										}}
										onClick={() => handleDelete([record.id])}
									/>
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
					visible={isModalVisible} // Control the modal visibility
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
							// rules={[{ required: true, message: "Please enter Description" }]}
						>
							<CKEditor
								editor={ClassicEditor}
								onChange={handleEditorChange}
								config={{
									height: "50%",
								}}
							/>
						</Form.Item>
						<Form.Item>
							<Button
								icon="pi pi-check"
								label="Save"
								severity="info"
								type="submit"
								style={{
									height: "45px",
									padding: "20px",
									borderRadius: "5px",
								}}
							/>

							<Button
								icon="pi pi-times"
								label="Cancel"
								severity="secondary"
								onClick={handleCloseModal}
								style={{
									marginLeft: "10px",
									marginTop: "10px",
									height: "45px",
									padding: "20px",
									borderRadius: "5px",
								}}
							/>
						</Form.Item>
					</Form>
				</Modal>

				<Modal
					title="Edit Service"
					visible={isEditModalVisible}
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
							<CKEditor
								editor={ClassicEditor}
								data={serviceDescription}
								onChange={handleEditorChangeUpdate}
							/>
						</Form.Item>
						<Form.Item>
							<Button
								icon="pi pi-check"
								label="Save"
								severity="info"
								onClick={handleServiceEditSubmit}
								type="submit"
								style={{
									height: "45px",
									padding: "20px",
									borderRadius: "5px",
								}}
							/>

							<Button
								icon="pi pi-times"
								label="Cancel"
								severity="secondary"
								onClick={handleCloseEditModal}
								style={{
									marginLeft: "10px",
									marginTop: "10px",
									height: "45px",
									padding: "20px",
									borderRadius: "5px",
								}}
							/>
						</Form.Item>
					</Form>
				</Modal>
			</Card>
		</Box>
	);
};

export default EditServiceCategory;
