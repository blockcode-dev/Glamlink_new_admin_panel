/** @format */

import React, { useEffect, useState } from "react";
import { Table, Button, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { GetServiceByUserId } from "../../../services/Api/UserApi";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import { useIdParam } from "../../../utils/routing";
import type { ProfessionalService } from "../../../types/user";

const UserService = () => {
	const navigate = useNavigate();
	const id = useIdParam();
	const [serviceData, setServiceData] = useState<WithIndex<ProfessionalService>[]>([]);
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
	const columns: TableColumnsType<WithIndex<ProfessionalService>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "10%",
		},
		{
			title: "Service Name",
			dataIndex: "name",
			width: "30%",
			
		},
    {
			title: "Service Description",
			dataIndex: "description",
			width: "40%",

		},
		{
			title: "Added On",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => dayjs(date).format("YYYY-MM-DD"),
		},
		
	];

	// Fetching data
	const getData = async () => {
		try {
			setLoading(true);
			// Fetch followers by user ID
			const result = await GetServiceByUserId(id); // Just pass the user ID

			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1, // Maintain the index
			}));

			setServiceData(newData);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 403) {
				navigate("/error401");
				console.error("You do not have access to this page as a sub-admin.");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange: TableChangeHandler<WithIndex<ProfessionalService>> = (pagination, filters, sorter) => {
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
		navigate(`/viewProfessionals/${id}`);
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
					<h3 className="page-title">Service Management</h3>
					<p className="page-sub-title">View Service</p>
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

export default UserService;


