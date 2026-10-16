/** @format */

import React, { useEffect, useState } from "react";
import { Table, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import { GetAllAppointments } from "../../services/Api/AppointmentsApi";

import { SearchOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { Appointment } from "../../types/user";

const Appointments = () => {
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState<WithIndex<Appointment>[]>([]);
	const [serviceBackupData, setServiceBackupData] = useState<WithIndex<Appointment>[]>([]);
	const [loading, setLoading] = useState(false);

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<Appointment>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "5%",
		},
		{
			title: "Profesisonal's Name",
			dataIndex: ["appointment_counselor", "user_profile", "name"],
			width: "20%",
		},
		{
			title: "User's Name",
			dataIndex: ["appointment_user", "user_profile", "name"],
			width: "20%",
		},
		{
			title: "Status",
			dataIndex: "status",
			width: "20%",
			render: (status) => {
				let textColor = "var(--color-text)";

				switch (status) {
					case "PENDING":
						textColor = "var(--color-warning)";
						break;
					case "ACCEPTED":
						textColor = "var(--color-accent-purple)";
						break;
					case "COMPLETED":
						textColor = "var(--color-success)";
						break;
					case "ONGOING":
						textColor = "var(--color-accent-coral)";
						break;
					case "REJECTED":
					case "CANCELED":
						textColor = "var(--color-error)";
						break;
					default:
						textColor = "var(--color-text)";
				}

				return (
					<span
						style={{
							color: textColor,
							padding: "5px 10px",
							borderRadius: "5px",
							fontWeight: "bold",
							backgroundColor: "var(--color-surface)", // Set background to white
						}}
					>
						{status}
					</span>
				);
			},
		},
		{
			title: "Notes",
			dataIndex: "notes",
			width: "20%",
		},

		{
			title: "Date",
			dataIndex: ["appointment_slot", "date"],
			width: "20%",
		},
		{
			title: "Time",
			dataIndex: ["appointment_slot", "start_time"],
			width: "20%",
		},
	];


	const getData = async (params: TableParams) => {
		try {
		    setLoading(true);

			const { pagination, sortField } = params;

			// Fetch appointments with pagination and sorting
			const result = await GetAllAppointments(
				localStorage.getItem("adminToken"),
				{
					page: pagination.current,
					limit: pagination.pageSize,
					sortBy: sortField,
				}
			);

			// Sort the rows based on appointment_slot.date in descending order
			const sortedData = result.data.rows.sort((a, b) => 
				new Date(b['appointment_slot'].date).getTime() - new Date(a['appointment_slot'].date).getTime()
			);

			// Adding index for serial number
			const newData = sortedData.map((item, index) => ({
				...item,
				index: index + 1 + ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 100), // Adjusting index based on pagination
			}));

			// Update state with fetched data
			setServiceData(newData);
			setServiceBackupData(newData);
			setTableParams({
				...tableParams,
				pagination: {
					...pagination,
					total: result.count, // Update total count
				},
			});
		} catch (e) {
			// Log the full error object to inspect the structure
			console.error("Error object: ", e);
	
			if (apiErrorStatus(e) === 401) {
				navigate("/error401");
				console.error("You do not have access to this page as a sub-admin.");
			} else if (apiErrorStatus(e) === 500) {
				// An expired session is handled for every request (utils/session.ts).
				console.error("Server error. Please try again later.");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};
	
	
	

	const handleTableChange: TableChangeHandler<WithIndex<Appointment>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			sortField: field,
			sortOrder: order,
		});
	};

	const onSearch = (searchField: string) => {
		const LIST = [...serviceBackupData];
		const searchList = LIST.filter(
			(item) =>
				item.appointment_counselor.user_profile.name
					.toLowerCase()
					.includes(searchField.toLowerCase()) || // Professional's Name
				item.appointment_user.user_profile.name
					.toLowerCase()
					.includes(searchField.toLowerCase()) || // User's Name
				item.appointment_slot.date
					.toLowerCase()
					.includes(searchField.toLowerCase()) || // Date
				item.status.toLowerCase().includes(searchField.toLowerCase()) // Status
		);
		setServiceData(searchList);
	};

	useEffect(() => {
		getData({
			pagination: tableParams.pagination,
			sortField: tableParams.sortField,
			sortOrder: tableParams.sortOrder,
		});
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);


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
					<h3 className="page-title">Appointment Management</h3>
					<p className="page-sub-title">View Appointment List</p>
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

export default Appointments;
