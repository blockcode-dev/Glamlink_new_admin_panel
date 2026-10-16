/** @format */

import React, { useEffect, useState } from "react";
import { Table, Button, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { GetFollowingByUserId } from "../../../services/Api/UserApi";

import { ArrowLeftOutlined, UserOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import { useIdParam } from "../../../utils/routing";
import type { Followee } from "../../../types/user";

const UserFollowing = () => {
	const navigate = useNavigate();
	const id = useIdParam();
	const [serviceData, setServiceData] = useState<WithIndex<Followee>[]>([]);
	const [loading, setLoading] = useState(false);
	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	// Columns definition
	const columns: TableColumnsType<WithIndex<Followee>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "10%",
		},
		{
			title: "Followee Name",
			dataIndex: ["followee_user", "user_profile", "name"],
			width: "30%",
			
		},
		{
			title: "Followed On",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => dayjs(date).format("YYYY-MM-DD"),
		},
		{
			title: "Visit Profile",
			dataIndex: ["followee_user", "id"], 
			width: "20%",
			render: (followerId) => (
				<Button
					size="small"
					onClick={() => navigate(`/viewUser/${followerId}`)}
					style={{ borderRadius: "5px" }}
					icon={<UserOutlined />}>Visit Profile</Button>
			),
		},
	];

	// Fetching data
	const getData = async () => {
		try {
			setLoading(true);
			// Fetch followers by user ID
			const result = await GetFollowingByUserId(id); // Just pass the user ID

			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1, // Maintain the index
			}));

			setServiceData(newData);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 401) {
				navigate("/error401");
				console.error("You do not have access to this page as a sub-admin.");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange: TableChangeHandler<WithIndex<Followee>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			sortField: field,
			sortOrder: order,
		});
	};

	useEffect(() => {
		getData();
	}, []);

	const navigateToUser = () => {
		navigate(`/viewUser/${id}`);
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
					<h3 className="page-title">Following Management</h3>
					<p className="page-sub-title">View Followers</p>
				</div>
				<div
					style={{
					    display: "flex",
					    justifyContent: "space-between",
					    alignItems: "center"
					}}>
					<div>
						<Button
							onClick={navigateToUser}
							style={{
							    borderRadius: "5px"
							}}
							icon={<ArrowLeftOutlined />}
							size="large"
						>
							<span style={{ marginLeft: "5px" }}>Return to Users</span>
						</Button>
					</div>
				</div>
			</div>
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={serviceData}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
			/>
		</div>
	);
};

export default UserFollowing;
