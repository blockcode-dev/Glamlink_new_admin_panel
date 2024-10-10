/** @format */

import React, { useEffect, useState } from "react";
import { Table } from "antd";
import { useNavigate, useParams } from "react-router";
import { Box } from "@material-ui/core";
import moment from "moment";
import { Button } from "primereact/button";
import { GetAvailabilityByUserId } from "../../../services/Api/UserApi";

const Availability = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [serviceData, setServiceData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [tableParams, setTableParams] = useState({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	// Columns definition
	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "10%",
		},
		{
			title: "Day",
			dataIndex: "day_name",
			width: "20%",
		},
		{
			title: "Seats Available",
			dataIndex: "maximum_available_seats",
			width: "20%",
		},
        {
			title: "Start time",
			dataIndex: "start_time",
			width: "10%",
		},
        {
			title: "End time",
			dataIndex: "end_time",
			width: "10%",
		},
        {
			title: "Slot Duration",
			dataIndex: "duration",
			width: "15%",
		},
		{
			title: "Added On",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => moment(date).format("YYYY-MM-DD"),
		},
	];

	// Fetching data
	const getData = async () => {
		try {
			setLoading(true);
			// Fetch followers by user ID
			const result = await GetAvailabilityByUserId(id); // Just pass the user ID

			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1, // Maintain the index
			}));

			setServiceData(newData);
		} catch (e) {
			console.log(e);
			if (e.response && e.response.status === 401) {
				navigate("/error401");
				console.log("You do not have access to this page as a sub-admin.");
			} else {
				console.log("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange = (pagination, filters, sorter) => {
		setTableParams({
			pagination,
			sortField: sorter.field,
			sortOrder: sorter.order,
		});
	};

	useEffect(() => {
		getData({
			pagination: tableParams.pagination,
			sortField: tableParams.sortField,
			sortOrder: tableParams.sortOrder,
		});
	}, []);

	const navigateToUser = () => {
		navigate(`/viewProfessionals/${id}`);
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
					<h3 className="page-title">Availability Management</h3>
					<p className="page-sub-title">View Availability</p>
				</div>
				<Box display="flex" justifyContent="space-between" alignItems="center">
					<Box>
						<Button
							icon="pi pi-arrow-left"
							severity="secondary"
							onClick={navigateToUser}
							style={{ borderRadius: "5px", height: "47px" }}
						>
							<span style={{ marginLeft: "5px" }}>Return to Users</span>
						</Button>
					</Box>
				</Box>
			</Box>
			<Table
				columns={columns}
				rowKey={(record) => record.id}
				dataSource={serviceData}
				pagination={tableParams.pagination}
				loading={loading}
				onChange={handleTableChange}
			/>
		</Box>
	);
};

export default Availability;
