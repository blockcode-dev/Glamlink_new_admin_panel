import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { useNavigate } from "react-router-dom";
import {
	GetSalesCountByMonth,
	GetUserCount,
	GetServiceCount,
	GetDriverCount,
	GetMostBookedService,
} from "../../services/Api/Api";
import "./Dashboard.css";
import { Doughnut } from "react-chartjs-2";
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from "chart.js";

const getAllMonths = () => {
	const months = [
		"Jan",
		"February",
		"March",
		"April",
		"May",
		"June",
		"July",
		"August",
		"September",
		"October",
		"November",
		"December",
	];
	return months.map((month) => ({ type: month, sales: 0 }));
};

const Dashboard = () => {
	const navigate = useNavigate();
	const [salesCount, setSalesCount] = useState([]);
	const [driverData, setDriverData] = useState([]);
	const [customerData, setCustomerData] = useState([]);
	const [serviceData, setServiceData] = useState([]);
	const [mostBookedService, setMostBookedService] = useState([]);

	ChartJS.register(ArcElement, Tooltip, Legend);
	const data = {
		labels: mostBookedService.map((item) => item.service_name || ""),

		datasets: [
			{
				data: mostBookedService.map((item) => item.booking_count || 0),
				backgroundColor: ["#798BFF", "#B8ACFF", "#FFA9CE", "#F9DB7C"],
				borderColor: ["#798BFF", "#B8ACFF", "#FFA9CE", "#F9DB7C"],
				borderWidth: 1,
			},
		],
	};

	mostBookedService.forEach((item) => {
		console.log("Service Booking Name:", item.service_id);
	});

	//get customer count
	const getMostBookedService = async () => {
		try {
			const result = await GetMostBookedService(
				localStorage.getItem("adminToken")
			);
			setMostBookedService(result.data.data);
			console.log("customerdata====>", customerData);
		} catch (e) {
			console.log(e);
		}
	};


	//get customer count
	const getCustomerData = async () => {
		try {
			const result = await GetUserCount(localStorage.getItem("adminToken"));
			setCustomerData(result.data.data);
			console.log("customerdata====>", customerData);
		} catch (e) {
			console.log(e);
		}
	};


	//get customer count
	const getDriverData = async () => {
		try {
			const result = await GetDriverCount(localStorage.getItem("adminToken"));
			setDriverData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	//get likes count
	const getServiceCount = async () => {
		try {
			const result = await GetServiceCount(localStorage.getItem("adminToken"));
			setServiceData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	//get usercount by month api
	const getData = async () => {
		try {
			const result = await GetSalesCountByMonth(
				localStorage.getItem("adminToken")
			);
			setSalesCount(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		getData();
    getServiceCount();
    getDriverData();
    getCustomerData();
    getMostBookedService();
	}, []);

	const formattedData =
		salesCount.length > 0
			? salesCount.map(({ month, userCount }) => ({
					type: month,
					sales: userCount,
			  }))
			: getAllMonths();

	const config = {
		data: formattedData,
		xField: "type",
		yField: "sales",
		color: ({ type }) => "#C5ABFF",
		label: {
			position: "middle",
			style: {
				fill: "#FFFFFF",
				opacity: 1,
			},
		},
		xAxis: {
			label: {
				autoHide: true,
				autoRotate: false,
			},
		},
		meta: {
			type: {
				alias: "Month",
			},
			sales: {
				alias: "User Count",
			},
		},
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					flexDirection: "column",

					marginBottom: "20PX",
				}}
			>
				<h3 className="dashboard_title">Dashboard</h3>
				<p className="page-sub-title" style={{ color: "green" }}>
					Welcome to Web Admin Panel!
				</p>
			</div>

			<div className="d-flex justify-content-between align-items-center gap-3 mb-3">
				<div
					className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3"
					style={{ borderRight: "5px solid #1677FF" }}
				>
					<div>
						<p className="desc">Total Users</p>
						<h4 className="mb-0 sub-title">{customerData}</h4>
					</div>
				</div>
				<div
					className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3"
					style={{ borderRight: "5px solid #1677FF" }}
				>
					<div>
						<p className="desc">Total Drivers</p>
						<h4 className="mb-0 sub-title">{driverData}</h4>
					</div>
				</div>

				<div
					className="d-flex justify-content-between align-items-end flex-grow-1 bg-white p-3 roudned-3"
					style={{ borderRight: "5px solid #1677FF" }}
				>
					<div>
						<p className="desc">Total Services</p>
						<h4 className="mb-0 sub-title">{serviceData}</h4>
					</div>
				</div>
			</div>

			<div style={{ display: "flex", flexDirection: "row", width: "100%" }}>
				{/* <div className="left_graph">
					<h3 className="mb-5 title">Sales Count(2023-2024)</h3>
					<div>
						<Column {...config} />
					</div>
				</div> */}
				<div className="right_graph">
					<h3 className="mb-5 title" style={{ marginBottom: "20px" }}>
						Booking Overview
					</h3>
					<Doughnut data={data} />
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
