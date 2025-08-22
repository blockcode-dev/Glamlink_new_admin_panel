/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, message } from "antd";
import { Button } from "primereact/button";
import "primereact/resources/themes/lara-light-indigo/theme.css";
import "primeicons/primeicons.css";
import { useNavigate } from "react-router";
import { InputText } from "primereact/inputtext";
import { Box, Switch } from "@material-ui/core";

import { GetPromotionRequest, PromoteUser } from "../../services/Api/UserApi";

const PromotionRequest = () => {
	const navigate = useNavigate();
	const [data, setData] = useState([]);
	const [userBackupData, setUserBackupData] = useState([]);
	const [isPromoted, setIsPromoted] = useState(false);
	const [loading, setLoading] = useState(false);

	const [tableParams, setTableParams] = useState({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "5%",
			sorter: (a, b) => a.index - b.index,
		},
		{
			title: "User Name",
			dataIndex: ["user_profile", "name"],
			sorter: (a, b) => a.user_profile.name.localeCompare(b.user_profile.name),
			width: "30%",
		},
		{
			title: "Email",
			dataIndex: "email",
			width: "30%",
		},
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Switch
						checked={record.is_promoted} // Now this will reflect the actual state
						// onChange={() => handlePromotionToggle(record.id)} // Pass correct ID
						color="primary"
					/>
				</Space>
			),
		},
	];

	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetPromotionRequest(
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
		const searchList = userBackupData.filter((item) =>
			item.user_profile?.name
				?.toLowerCase()
				.includes(searchField?.toLowerCase())
		);
		setData(searchList);
	};

	// const handlePromotionToggle = async (userId) => {
	// 	setLoading(true);
	// 	try {
	// 		// Ensure userId is passed correctly
	// 		if (!userId) {
	// 			message.error("Invalid user ID. Cannot promote user.");
	// 			return;
	// 		}

	// 		// Call the PromoteUser API with the correct user ID
	// 		const response = await PromoteUser(userId);

	// 		if (response.status === 200) {
	// 			// Find the updated user and toggle their promotion status
	// 			setData((prevData) =>
	// 				prevData.map((user) =>
	// 					user.id === userId
	// 						? { ...user, is_promoted: !user.is_promoted }
	// 						: user
	// 				)
	// 			);

	// 			message.success(
	// 				!isPromoted
	// 					? "Professional promoted successfully."
	// 					: "Professional no longer promoted."
	// 			);
	// 		} else {
	// 			message.error("Something went wrong. Please try again.");
	// 		}
	// 	} catch (error) {
	// 		console.error("Error promoting user:", error);
	// 		message.error("Failed to promote the user. Please try again.");
	// 	} finally {
	// 		setLoading(false);
	// 	}
	// };

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="20px"
			>
				<div>
					<h3 className="page-title">Promotion Requests</h3>
					<p className="page-sub-title">
						Manage and approve promotion requests from users.
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

export default PromotionRequest;
