/** @format */

import React, { useEffect, useState } from "react";
import { Space, Table, message } from "antd";
import { useNavigate } from "react-router";
import { InputText } from "primereact/inputtext";
import { Box } from "@material-ui/core";
import { Button } from "primereact/button";
import Alert from "../../Customer/Alert";
import { GetFAQ, DeleteFAQ } from "../../../services/Api/ContentApi";

const Faq = () => {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [userBackupData, setUserBackupData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [tableParams, setTableParams] = useState({
		pagination: {
			current: 1,
			pageSize: 50,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "10%",
		},
		{
			title: "Question",
			dataIndex: "question",
			width: "30%",
		},
		{
			title: "Answer",
			dataIndex: "answer",
			width: "40%",
			render: (answer) => (
				<span style={{ color: answer ? "inherit" : "red" }}>
					{answer ? (
						<div
							dangerouslySetInnerHTML={{
								__html: truncateText(answer, 10),
							}}
						/>
					) : (
						"Answer is not provided by admin yet"
					)}
				</span>
			),
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
						style={{ borderRadius: "25px" }}
						onClick={(event) => navigateToEditForum(event, record.id)}
					/>
					<Alert title="Question" handleDelete={() => removeUser(record.id)} />
				</Space>
			),
		},
	];

	const truncateText = (text, maxWords) => {
		const words = text.split(" ");
		return words.length > maxWords
			? words.slice(0, maxWords).join(" ") + "..."
			: text;
	};

	const navigateToEditForum = (event, id) => {
		navigate(`/editFaq/${id}`);
	};

	// Get all support queries
	const getData = async (params = {}) => {
		try {
			setLoading(true);
			let result = await GetFAQ(localStorage.getItem("adminToken"), params);
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
				console.log("Access denied. You do not have the required permissions.");
			} else {
				console.log("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData({
			page: tableParams.pagination.current,
			pageSize: tableParams.pagination.pageSize,
			sortField: tableParams.sortField,
			sortOrder: tableParams.sortOrder,
		});
	}, [tableParams]);

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			filters,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

const onSearch = (searchField) => {
	const LIST = [...userBackupData];
	const searchList = LIST.filter((item) => {
		const questionMatch = item.question
			?.toLowerCase()
			.includes(searchField.toLowerCase());
		const answerMatch = item.answer
			?.toLowerCase()
			.includes(searchField.toLowerCase());

		return questionMatch || answerMatch;
	});
	setData(searchList);
};

	const removeUser = (user_id) => {
		DeleteFAQ(user_id, localStorage.getItem("adminToken"))
			.then((res) => {
				message.success(res?.data?.message);
				getData();
			})
			.catch((error) => {
				console.log(error);
			});
	};

	const navigateToAddBlog = () => {
		navigate(`/createFaq`);
	};

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<div>
					<h3 className="page-title">FORUM MANAGEMENT</h3>
					<p className="page-sub-title">
						Manage User Queries By Answering Them
					</p>
				</div>
				<Box display="flex" justifyContent="space-between" alignItems="center">
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
							icon="pi pi-plus"
							severity="info"
							style={{
								margin: "0px 10px",
								borderRadius: "5px",
								height: "47px",
							}}
							onClick={navigateToAddBlog}
						/>
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
		</Box>
	);
};

export default Faq;
