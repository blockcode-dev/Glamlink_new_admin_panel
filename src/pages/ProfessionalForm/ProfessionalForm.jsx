/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, Button, Modal, message, Select } from "antd";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router";
import { InputText } from "primereact/inputtext";
import { Box } from "@material-ui/core";
import {
	GetUsersWhoSubmittedForm,
	GetAllAnswersByUserId,
	UpdateStatus,
	DeleteFormByUserId,
} from "../../services/Api/ProfessionalForm";
import { BASE_URL_IMAGE } from "../../services/Host";
import moment from "moment";

const ProfessionalForm = () => {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [userBackupData, setUserBackupData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedUserAnswers, setSelectedUserAnswers] = useState([]);

	const [tableParams, setTableParams] = useState({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	// Fetch list of users who submitted the form
	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetUsersWhoSubmittedForm(
				localStorage.getItem("adminToken")
			);
			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setData(newData);
			setUserBackupData(newData);
		} catch (e) {
			console.log(e);
			if (e.response && e.response.status === 403) {
				navigate("/error401");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	// Handle View Form - Fetch and Show Answers
	const handleViewForm = async (userId) => {
		try {
			setLoading(true);
			let response = await GetAllAnswersByUserId(userId);
			setSelectedUserAnswers(response.data.data);
			setModalVisible(true);
		} catch (e) {
			console.log("Error fetching user answers:", e);
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

	const onSearch = (searchField) => {
		const searchList = userBackupData.filter((item) =>
			item.answers_user?.user_profile?.name
				?.toLowerCase()
				.includes(searchField?.toLowerCase())
		);
		setData(searchList);
	};

	const handleStatusChange = async (userId, value) => {
		try {
			const response = await UpdateStatus(userId, { status: value });
			if (response.status === 201) {
				message.success(`Form marked as ${value.toUpperCase()}`);
				await getData(); // Refresh the table with updated data
			}
		} catch (error) {
			console.error(error);
			message.error(`Failed to update status to ${value}`);
		}
	};

	const handleDeleteForm = async (userId) => {
		Modal.confirm({
			title: "Are you sure you want to delete this form?",
			content: "This action cannot be undone.",
			okText: "Yes, Delete",
			okType: "danger",
			cancelText: "Cancel",
			onOk: async () => {
				try {
					await DeleteFormByUserId(userId);
					message.success("Form deleted successfully.");
					await getData(); // refresh list
				} catch (error) {
					console.error("Delete error:", error);
					message.error("Failed to delete form.");
				}
			},
		});
	};

	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "5%",
			sorter: (a, b) => a.index - b.index,
		},
		{
			title: "User Name",
			dataIndex: ["answers_user", "user_profile", "name"],
			sorter: (a, b) => a.user_profile.name.localeCompare(b.user_profile.name),
			width: "20%",
		},
		{
			title: "Email",
			dataIndex: ["answers_user", "email"],
			width: "20%",
		},
		{
			title: "Form Submitted Date",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button type="primary" onClick={() => handleViewForm(record.user_id)}>
						View Form
					</Button>

					<Select
						value={record.status}
						style={{
							width: 150,
							color:
								record.status === "approved"
									? "green"
									: record.status === "rejected"
									? "red"
									: "orange",
							fontWeight: "bold",
						}}
						onChange={(value) => handleStatusChange(record.user_id, value)}
					>
						<Select.Option value="pending">
							<span style={{ color: "orange" }}>PENDING</span>
						</Select.Option>
						<Select.Option value="approved">
							<span style={{ color: "green" }}>APPROVED</span>
						</Select.Option>
						<Select.Option value="rejected">
							<span style={{ color: "red" }}>REJECTED</span>
						</Select.Option>
					</Select>

					<Button danger onClick={() => handleDeleteForm(record.user_id)}>
						Delete
					</Button>
				</Space>
			),
		},
	];

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<div>
					<h3 className="page-title">Professional Form</h3>
					<p className="page-sub-title">Manage and approve form requests.</p>
				</div>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Box>
						<span className="p-input-icon-left">
							<i className="pi pi-search" />
							<InputText
								type="search"
								onChange={(e) => onSearch(e.target.value)}
								placeholder="Search..."
							/>
						</span>
					</Box>
				</Box>
			</Box>
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={data}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
			/>

			{/* Modal to show user form answers */}
			<Modal
				title="User Submitted Form"
				visible={modalVisible}
				onCancel={() => setModalVisible(false)}
				footer={null}
				width={800}
			>
				<Table
					dataSource={selectedUserAnswers}
					columns={[
						{
							title: "Question",
							dataIndex: ["questions_form", "question"],
							key: "question_text",
						},
						{
							title: "Answer",
							dataIndex: "answer",
							key: "answer",
							render: (answer, record) =>
								record.questions_form.type === "FILE_UPLOAD" ? (
									<a
										href={`${BASE_URL_IMAGE}${answer}`} // ✅ Append base URL to file name
										target="_blank"
										rel="noopener noreferrer"
									>
										View File
									</a>
								) : (
									answer
								),
						},
					]}
					rowKey={(record) => record.id}
					pagination={false}
				/>
			</Modal>
		</Box>
	);
};

export default ProfessionalForm;
