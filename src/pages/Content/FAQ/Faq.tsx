/** @format */

import React, { useEffect, useState } from "react";
import { Space, Table, message, Button, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import Alert from "../../Customer/Alert";
import { GetFAQ, DeleteFAQ } from "../../../services/Api/ContentApi";

import { EditOutlined, PlusOutlined, SearchOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import SafeHtml from "../../../components/SafeHtml";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import type { Faq } from "../../../types/content";

const Faq = () => {
	const navigate = useNavigate();
	const [data, setData] = useState<WithIndex<Faq>[]>([]);
	const [userBackupData, setUserBackupData] = useState<WithIndex<Faq>[]>([]);
	const [loading, setLoading] = useState(false);
	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 50,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<Faq>> = [
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
				<span style={{ color: answer ? "inherit" : "var(--color-error)" }}>
					{answer ? (
						<SafeHtml html={truncateText(answer, 10)} />
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
						style={{ borderRadius: "25px" }}
						onClick={(event) => navigateToEditForum(event, record.id)}
						icon={<EditOutlined />}
						shape="circle" />
					<Alert title="Question" handleDelete={() => removeUser(record.id)} />
				</Space>
			),
		},
	];

	const truncateText = (text: string, maxWords: number) => {
		const words = text.split(" ");
		return words.length > maxWords
			? words.slice(0, maxWords).join(" ") + "..."
			: text;
	};

	const navigateToEditForum = (event: React.MouseEvent<HTMLElement>, id: number) => {
		navigate(`/editFaq/${id}`);
	};

	// Get all support queries
	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetFAQ();
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
				console.error("Access denied. You do not have the required permissions.");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, [tableParams]);

	const handleTableChange: TableChangeHandler<WithIndex<Faq>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			filters,
			sortField: field,
			sortOrder: order,
		});
	};

const onSearch = (searchField: string) => {
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

	const removeUser = (user_id: number) => {
		DeleteFAQ(user_id)
			.then((res) => {
				message.success(res?.data?.message);
				getData();
			})
			.catch((error) => {
				console.error(error);
			});
	};

	const navigateToAddBlog = () => {
		navigate(`/createFaq`);
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
					<h3 className="page-title">FORUM MANAGEMENT</h3>
					<p className="page-sub-title">
						Manage User Queries By Answering Them
					</p>
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
							    margin: "0px 10px",
							    borderRadius: "5px"
							}}
							onClick={navigateToAddBlog}
							icon={<PlusOutlined />}
							type="primary"
							size="large" />
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
		</div>
	);
};

export default Faq;
