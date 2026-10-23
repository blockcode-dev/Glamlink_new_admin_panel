/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, Button, Modal, message, Select, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import {
	GetUsersWhoSubmittedForm,
	GetAllAnswersByUserId,
	UpdateStatus,
	DeleteFormByUserId,
} from "../../services/Api/ProfessionalForm";
import { BASE_URL_IMAGE } from "../../services/Host";
import dayjs from "dayjs";

import { SearchOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { FormAnswer, FormSubmission } from "../../types/content";

const ProfessionalForm = () => {
	const navigate = useNavigate();
	const [data, setData] = useState<WithIndex<FormSubmission>[]>([]);
	const [userBackupData, setUserBackupData] = useState<WithIndex<FormSubmission>[]>([]);
	const [loading, setLoading] = useState(false);
	const [modalVisible, setModalVisible] = useState(false);
	const [selectedUserAnswers, setSelectedUserAnswers] = useState<FormAnswer[]>([]);

	const [tableParams, setTableParams] = useState<TableParams>({
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
			let result = await GetUsersWhoSubmittedForm();
			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setData(newData);
			setUserBackupData(newData);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 403) {
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
	const handleViewForm = async (userId: number) => {
		try {
			setLoading(true);
			let response = await GetAllAnswersByUserId(userId);
			setSelectedUserAnswers(response.data.data);
			setModalVisible(true);
		} catch (e) {
			console.error("Error fetching user answers:", e);
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange: TableChangeHandler<WithIndex<FormSubmission>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
	};

	const onSearch = (searchField: string) => {
		const searchList = userBackupData.filter((item) =>
			item.answers_user?.user_profile?.name
				?.toLowerCase()
				.includes(searchField?.toLowerCase())
		);
		setData(searchList);
	};

	const handleStatusChange = async (userId: number, value: string) => {
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

	const handleDeleteForm = async (userId: number) => {
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

	const columns: TableColumnsType<WithIndex<FormSubmission>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "5%",
			sorter: (a, b) => a.index - b.index,
		},
		{
			title: "User Name",
			dataIndex: ["answers_user", "user_profile", "name"],
			sorter: (a, b) => a.answers_user.user_profile.name.localeCompare(b.answers_user.user_profile.name),
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
			render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
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
									? "var(--color-success)"
									: record.status === "rejected"
									? "var(--color-error)"
									: "var(--color-warning)",
							fontWeight: "bold",
						}}
						onChange={(value) => handleStatusChange(record.user_id, value)}
					>
						<Select.Option value="pending">
							<span style={{ color: "var(--color-warning)" }}>PENDING</span>
						</Select.Option>
						<Select.Option value="approved">
							<span style={{ color: "var(--color-success)" }}>APPROVED</span>
						</Select.Option>
						<Select.Option value="rejected">
							<span style={{ color: "var(--color-error)" }}>REJECTED</span>
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
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "20px"
				}}>
				<div>
					<h3 className="page-title">Professional Form</h3>
					<p className="page-sub-title">Manage and approve form requests.</p>
				</div>
				<div
					style={{
					    display: "flex",
					    justifyContent: "space-between",
					    alignItems: "center"
					}}>
					<div>
						<Input
							type="search"
							onChange={(e) => onSearch(e.target.value)}
							placeholder="Search..."
							prefix={<SearchOutlined />}
							size="large"
							style={{
							    width: 240
							}} />
					</div>
				</div>
			</div>
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
				open={modalVisible}
				onCancel={() => setModalVisible(false)}
				footer={null}
				width={800}
			>
				<Table<FormAnswer>
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
		</div>
	);
};

export default ProfessionalForm;
