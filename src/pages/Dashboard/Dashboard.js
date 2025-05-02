/** @format */

import React, { useEffect, useState } from "react";
import { Column } from "@ant-design/plots";
import { Table, Select } from "antd";
import { Button } from "primereact/button";
import { FaThumbsUp, FaComment, FaFilm } from "react-icons/fa";
import { FaClapperboard } from "react-icons/fa6";
import "./Dashboard.css";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
} from "chart.js";
import {
	GetProfessionalCount,
	GetUserCount,
	GetPostCount,
	GetClipsCount,
	GetAverageLikesPerPostCount,
	GetAverageLikesPerClipCount,
	GetAverageCommentPerClipCount,
	GetAverageCommentPerPostCount,
	GetAverageFollowersPerUser,
	GetAverageFollowingPerUser,
	GetAverageFollowerPerProfessional,
	GetAverageFollowingPerProfessional,
	GetAveragePostByUser,
	GetAveragePostByProfessional,
	GetMostPostedServices,
	GetMostBookedServices,
	GetMostBookedProfessionals,
	GetAverageBookingByProfessional,
	GetMostBookedTimeSlots,
	GetPostUploadedStatistics,
	GetClipsUploadedStatistics,
	GetAverageServicesByProfessional,
	GetUserRegisteredStatistics,
	GetCorporateRegisteredStatistics,
} from "../../services/Api/DashboardApi";
import { Card } from "primereact/card";
import { useNavigate } from "react-router";
ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

const { Option } = Select;

const Dashboard = () => {
	const navigate = useNavigate();
	const [customerData, setCustomerData] = useState([]);
	const [professionalCountData, setProfessionalCountData] = useState([]);
	const [postCountData, setPostCounteData] = useState([]);
	const [clipsCounteData, setClipsCountCount] = useState([]);
	const [averagePostLikeData, setAveragePostLikeData] = useState([]);
	const [averageClipLikeData, setAverageClipLikeData] = useState([]);
	const [averagePostCommentData, setAveragePostCommentData] = useState([]);
	const [averageClipCommentData, setAverageClipCommentData] = useState([]);
	const [averageFollowerPerUserData, setAverageFollowerPerUserData] = useState(
		[]
	);
	const [averageFollowingPerUserData, setAverageFollowingPerUserData] =
		useState([]);
	const [
		averageFollowerPerProfessionalData,
		setAverageFollowerPerProfessionalData,
	] = useState([]);
	const [
		averageFollowingPerProfessionalData,
		setAverageFollowingPerProfessionalData,
	] = useState([]);
	const [averagePostByUserData, setAveragePostByUserData] = useState([]);
	const [averagePostByProfessionalData, setAveragePostByProfessionalData] =
		useState([]);
	const [
		averageServicesByProfessionalData,
		setAverageServicesByProfessionalData,
	] = useState([]);
	const [mostPostedService, setMostPostedService] = useState("");
	const [mostPostedServiceCount, setMostPostedServiceCount] = useState(0);

	const [mostBookedService, setMostBookedService] = useState("");
	const [mostBookedServiceCount, setMostBookedServiceCount] = useState(0);

	const [mostBookedTimeSlots, setMostBookedTimeSlots] = useState("");
	const [mostBookedTimeSlotCount, setMostBookedTimeSlotCount] = useState(0);

	const [mostBookedProfessional, setMostBookedProfessional] = useState([]);
	const [averageBookingPerProfessional, setAverageBookingPerProfessional] =
		useState([]);

	const [newUserRegisteredData, setNewUserRegisteredData] = useState([]);
	const [period, setPeriod] = useState("today");
	const [newProfessionalRegisteredData, setNewProfessionalRegisteredData] =
		useState([]);
	const [professionalPeriod, setProfessionalPeriod] = useState("today");

	const getCustomerData = async () => {
		try {
			const result = await GetUserCount(localStorage.getItem("adminToken"));
			setCustomerData(result.data.data);
			console.log("customerdata====>", customerData);
		} catch (e) {
			console.log(e);
		}
	};

	const getProfessionalCountData = async () => {
		try {
			const result = await GetProfessionalCount(
				localStorage.getItem("adminToken")
			);
			setProfessionalCountData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getPostCountData = async () => {
		try {
			const result = await GetPostCount(localStorage.getItem("adminToken"));
			setPostCounteData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getClipsCountCount = async () => {
		try {
			const result = await GetClipsCount(localStorage.getItem("adminToken"));
			setClipsCountCount(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageLikesPerPost = async () => {
		try {
			const result = await GetAverageLikesPerPostCount(
				localStorage.getItem("adminToken")
			);
			setAveragePostLikeData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageLikesPerClip = async () => {
		try {
			const result = await GetAverageLikesPerClipCount(
				localStorage.getItem("adminToken")
			);
			setAverageClipLikeData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageCommentsPerPost = async () => {
		try {
			const result = await GetAverageCommentPerPostCount(
				localStorage.getItem("adminToken")
			);
			setAveragePostCommentData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageCommentsPerClip = async () => {
		try {
			const result = await GetAverageCommentPerClipCount(
				localStorage.getItem("adminToken")
			);
			setAverageClipCommentData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageFollowersPerUser = async () => {
		try {
			const result = await GetAverageFollowersPerUser(
				localStorage.getItem("adminToken")
			);
			setAverageFollowerPerUserData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageFollowingPerUser = async () => {
		try {
			const result = await GetAverageFollowingPerUser(
				localStorage.getItem("adminToken")
			);
			setAverageFollowingPerUserData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageFollowersPerProfessional = async () => {
		try {
			const result = await GetAverageFollowerPerProfessional(
				localStorage.getItem("adminToken")
			);
			setAverageFollowerPerProfessionalData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageFollowingPerProfessional = async () => {
		try {
			const result = await GetAverageFollowingPerProfessional(
				localStorage.getItem("adminToken")
			);
			setAverageFollowingPerProfessionalData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAveragePostByUser = async () => {
		try {
			const result = await GetAveragePostByUser(
				localStorage.getItem("adminToken")
			);
			setAveragePostByUserData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAveragePostByProfessional = async () => {
		try {
			const result = await GetAveragePostByProfessional(
				localStorage.getItem("adminToken")
			);
			setAveragePostByProfessionalData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageServicesByProfessional = async () => {
		try {
			const result = await GetAverageServicesByProfessional(
				localStorage.getItem("adminToken")
			);
			setAverageServicesByProfessionalData(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getMostPostedService = async () => {
		try {
			const result = await GetMostPostedServices(
				localStorage.getItem("adminToken")
			);
			setMostPostedService(result.data.data.name);
			setMostPostedServiceCount(result.data.data.service_count);
		} catch (e) {
			console.log(e);
		}
	};

	const getMostBookedService = async () => {
		try {
			const result = await GetMostBookedServices(
				localStorage.getItem("adminToken")
			);
			setMostBookedService(result.data.data.appointment_service?.name); // Set the booked service name
			setMostBookedServiceCount(result.data.data.booking_count); // Set the booking count
		} catch (e) {
			console.log(e);
		}
	};

	// For most booked time slot (including the booking count)
	const getMostBookedTimeSlot = async () => {
		try {
			const result = await GetMostBookedTimeSlots(
				localStorage.getItem("adminToken")
			);

			if (result.data && result.data.data.length > 0) {
				const timeSlot = result.data.data[0];
				const formattedTimeSlot = `${timeSlot.start_time.slice(
					0,
					5
				)} - ${timeSlot.end_time.slice(0, 5)}`;
				setMostBookedTimeSlots(formattedTimeSlot); // Set the time slot
				setMostBookedTimeSlotCount(timeSlot.booking_count); // Set the booking count
			}
		} catch (e) {
			console.log(e);
		}
	};

	const getMostBookedProfessional = async () => {
		try {
			const result = await GetMostBookedProfessionals(
				localStorage.getItem("adminToken")
			);
			setMostBookedProfessional(result.data.data);
			console.log(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	const getAverageBookingByProfessional = async () => {
		try {
			const result = await GetAverageBookingByProfessional(
				localStorage.getItem("adminToken")
			);
			setAverageBookingPerProfessional(result.data.data);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		getCustomerData();
		getProfessionalCountData();
		getPostCountData();
		getClipsCountCount();
		getAverageLikesPerPost();
		getAverageLikesPerClip();
		getAverageCommentsPerClip();
		getAverageCommentsPerPost();
		getAverageFollowersPerUser();
		getAverageFollowingPerUser();
		getAverageFollowersPerProfessional();
		getAverageFollowingPerProfessional();
		getAveragePostByUser();
		getAveragePostByProfessional();
		getAverageServicesByProfessional();
		getMostPostedService();
		getMostBookedService();
		getMostBookedProfessional();
		getAverageBookingByProfessional();
		getMostBookedTimeSlot();
	}, []);

	const handlePeriodChange = async (newPeriod) => {
		setPeriod(newPeriod); // Update the period state
		try {
			const result = await GetUserRegisteredStatistics(newPeriod); // Call the API
			setNewUserRegisteredData(result.data.data || 0); // Update sales count with the result data
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		handlePeriodChange(period); // Fetch data for the default period when the component loads
	}, []);

	const handleGetCorporateRegisteredStatistics = async (newPeriod) => {
		setProfessionalPeriod(newPeriod);
		try {
			const result = await GetCorporateRegisteredStatistics(newPeriod); // Call the API
			setNewProfessionalRegisteredData(result.data.data || 0); // Update sales count with the result data
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		handleGetCorporateRegisteredStatistics(professionalPeriod); // Fetch data for the default period when the component loads
	}, []);

	const [postUploadData, setPostUploadData] = useState([]);
	const [postUploadPeriod, setPostUploadPeriod] = useState("weekly");
	const handlePostUploadedStatistics = async (newPeriod) => {
		setPostUploadPeriod(newPeriod);
		try {
			const result = await GetPostUploadedStatistics(newPeriod);
			setPostUploadData(result.data.data || 0);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		handlePostUploadedStatistics(postUploadPeriod);
	}, []);

	const [clipUploadData, setClipUploadData] = useState([]);
	const [clipUploadPeriod, setClipUploadPeriod] = useState("weekly");
	const handlelCipsUploadedStatistics = async (newPeriod) => {
		setClipUploadPeriod(newPeriod);
		try {
			const result = await GetClipsUploadedStatistics(newPeriod);
			setClipUploadData(result.data.data || 0);
		} catch (e) {
			console.log(e);
		}
	};

	useEffect(() => {
		handlelCipsUploadedStatistics(clipUploadPeriod);
	}, []);

	const config = {
		data: [{ type: period, sales: newUserRegisteredData }],
		xField: "type",
		yField: "sales",
		color: "#4CAF50",
		columnWidthRatio: 0.2, // Adjust column width (0.6 is an example; adjust as needed)
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
		yAxis: {
			min: 0, // Start the y-axis from 0
			max: 50, // End the y-axis at 50 or adjust based on your data
			tickInterval: 10, // Set interval to display ticks as 10, 20, 30, etc.
			label: {
				formatter: (v) => `${v}`, // Format y-axis labels as numbers
			},
		},
		meta: {
			type: {
				alias: "Period", // Label for the x-axis
			},
			sales: {
				alias: "Number of Registered Users", // Label for the y-axis
			},
		},
	};

	const corporateConfig = {
		data: [{ type: period, sales: newProfessionalRegisteredData }],
		xField: "type",
		yField: "sales",
		color: "#1677FF",
		columnWidthRatio: 0.2, // Adjust column width (0.6 is an example; adjust as needed)
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
		yAxis: {
			min: 0, // Start the y-axis from 0
			max: 50, // End the y-axis at 50 or adjust based on your data
			tickInterval: 10, // Set interval to display ticks as 10, 20, 30, etc.
			label: {
				formatter: (v) => `${v}`, // Format y-axis labels as numbers
			},
		},
		meta: {
			type: {
				alias: "Period", // Label for the x-axis
			},
			sales: {
				alias: "Number of Registered Professionals", // Label for the y-axis
			},
		},
	};

	const data = {
		labels: [
			"Avg Followers/User",
			"Avg Following/User",
			"Avg Followers/Professional",
			"Avg Following/Professional",
		],
		datasets: [
			{
				label: "Statistics",
				data: [
					averageFollowerPerUserData,
					averageFollowingPerUserData,
					averageFollowerPerProfessionalData,
					averageFollowingPerProfessionalData,
				],
				backgroundColor: [
					"rgba(54, 162, 235, 0.6)",
					"rgba(255, 206, 86, 0.6)",
					"rgba(75, 192, 192, 0.6)",
					"rgba(153, 102, 255, 0.6)",
				],
				borderColor: [
					"rgba(54, 162, 235, 1)",
					"rgba(255, 206, 86, 1)",
					"rgba(75, 192, 192, 1)",
					"rgba(153, 102, 255, 1)",
				],
				borderWidth: 1,
			},
		],
	};

	// Chart options for better presentation
	const options = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
			},
			title: {
				display: true,
				text: "User and Professional Statistics",
			},
		},
	};

	const postData = {
		labels: ["Average Post/User", "Average Post/Professional"],
		datasets: [
			{
				label: "User and Professional Posts",
				data: [averagePostByUserData, averagePostByProfessionalData],
				backgroundColor: [
					"rgba(75, 192, 192, 0.6)", // Teal for Avg Post/User
					"rgba(153, 102, 255, 0.6)", // Purple for Avg Post/Professional
				],
				borderColor: [
					"rgba(75, 192, 192, 1)", // Teal
					"rgba(153, 102, 255, 1)", // Purple
				],
				borderWidth: 1,
			},
		],
	};

	// Chart options for better presentation
	const PostOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
				labels: {
					color: "#333", // Legend text color
				},
			},
			title: {
				display: true,
				text: "Statistics of Posts by Users and Professionals", // Updated title
				color: "#333", // Title color
				font: {
					size: 20, // Title font size
					weight: "bold", // Title font weight
				},
			},
		},
	};

	const bookingAndServiceOptions = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
				labels: {
					color: "#333", // Legend text color
				},
			},
			title: {
				display: true,
				text: "Booking and Service Statistics Of Professional", // Updated title
				color: "#333", // Title color
				font: {
					size: 20, // Title font size
					weight: "bold", // Title font weight
				},
			},
		},
	};

	const bookingAndServiceData = {
		labels: ["Average Booking/Professional", "Average Service/Professional"],
		datasets: [
			{
				label: "Statistics",
				data: [
					averageBookingPerProfessional,
					averageServicesByProfessionalData,
				],
				backgroundColor: [
					"rgba(0, 191, 255, 0.6)", // Cyan for Avg Booking
					"rgba(255, 0, 255, 0.6)", // Magenta for Avg Service
				],
				borderColor: [
					"rgba(0, 191, 255, 1)", // Cyan border
					"rgba(255, 0, 255, 1)", // Magenta border
				],
				borderWidth: 1,
			},
		],
	};

	const topMostBookedProfessional = [
		{
			title: "Professional Name",
			dataIndex: ["appointment_counselor", "user_profile", "name"],
			key: "name",
			width: "20%",
		},
		{
			title: "Booking Count",
			dataIndex: "booking_count",
			key: "booking_count",
			width: "20%",
		},
	];

	return (
		<div>
			{/* header */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					flexDirection: "column",
					backgroundColor: "white", // Changed to camelCase
					padding: "20px",
					borderRadius: "8px", // Changed to camelCase
					boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
					marginBottom: "20px", // Keep quotes for string values
				}}
			>
				<h3 className="dashboard_title">Welcome Melanie 👋🏻</h3>
				<p className="page-sub-title" style={{ color: "green" }}>
					Here’s a snapshot of your latest statistics and insights to help you
					manage the platform effectively.
				</p>
			</div>
			{/* first section */}
			<div className="d-flex flex-row gap-3 mb-3">
				<div
					style={{
						width: "50%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div
						className="d-flex justify-content-between gap-3"
						style={{
							height: "50%",
							marginBottom: "20px",
						}}
					>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Users Registered</p>
								<h4 className="mb-0 sub-title">{customerData}</h4>
							</div>
							<Button
								label="	View Users"
								icon="pi pi-arrow-right"
								iconPos="right"
								style={{
									backgroundColor: "#EFF5FB",
									marginTop: "10px",
									border: "#EFF5FB",
									color: "black",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/users")}
								onMouseOver={(e) => {
									e.target.style.backgroundColor = "#D7E8F8";
									e.target.style.color = "#black";
								}}
								onMouseOut={(e) => {
									e.target.style.backgroundColor = "#EFF5FB";
									e.target.style.color = "#black";
								}}
							></Button>
						</div>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Professionals Registered</p>
								<h4 className="mb-0 sub-title">{professionalCountData}</h4>
							</div>
							<Button
								label="	View Professionals"
								icon="pi pi-arrow-right"
								iconPos="right"
								style={{
									backgroundColor: "#E8F7F0",
									marginTop: "10px",
									border: "#E8F7F0",
									color: "black",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/professionals")}
								onMouseOver={(e) => {
									e.target.style.backgroundColor = "#CDE7DB";
									e.target.style.color = "#black";
								}}
								onMouseOut={(e) => {
									e.target.style.backgroundColor = "#E8F7F0";
									e.target.style.color = "#black";
								}}
							></Button>
						</div>
					</div>

					<div
						className="d-flex justify-content-between gap-3"
						style={{
							height: "50%",
						}}
					>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Posts</p>
								<h4 className="mb-0 sub-title">{postCountData}</h4>
							</div>
							<Button
								label="	View Posts"
								icon="pi pi-arrow-right"
								iconPos="right"
								style={{
									backgroundColor: "#FFF0EF",
									marginTop: "10px",
									border: "#FFF0EF",
									color: "black",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/posts-list")}
								onMouseOver={(e) => {
									e.target.style.backgroundColor = "#F8D9D7";
									e.target.style.color = "#black";
								}}
								onMouseOut={(e) => {
									e.target.style.backgroundColor = "#FFF0EF";
									e.target.style.color = "#black";
								}}
							></Button>
						</div>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Clips</p>
								<h4 className="mb-0 sub-title">{clipsCounteData}</h4>
							</div>
							<Button
								label="	View Clips"
								icon="pi pi-arrow-right"
								iconPos="right"
								style={{
									backgroundColor: "#F3E5F5",
									marginTop: "10px",
									border: "#F3E5F5",
									color: "black",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/clips-list")}
								onMouseOver={(e) => {
									e.target.style.backgroundColor = "#DEC3E8";
									e.target.style.color = "#black";
								}}
								onMouseOut={(e) => {
									e.target.style.backgroundColor = "#F3E5F5";
									e.target.style.color = "#black";
								}}
							></Button>
						</div>
					</div>
				</div>

				<div
					style={{
						backgroundColor: "white",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0 2px 8px rgba(0, 0, 0, 0.1)",
						width: "50%",
					}}
				>
					<h4 className="mb-3" style={{ fontWeight: "bold" }}>
						Statistics
					</h4>
					<div className="d-flex flex-column gap-4">
						{/* Section 1 - Average Likes per Post */}
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<p className="mb-0" style={{ color: "#6B7280" }}>
									Average Likes per Post
								</p>
								<h4 className="mb-0">{averagePostLikeData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "#E0F2FF",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<FaThumbsUp color="#007BFF" size={24} />
							</div>
						</div>

						{/* Section 2 - Average Comments per Post */}
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<p className="mb-0" style={{ color: "#6B7280" }}>
									Average Comments per Post
								</p>
								<h4 className="mb-0">{averagePostCommentData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "#FFF3E0",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<FaComment color="#FF8A00" size={24} />
							</div>
						</div>

						{/* Section 3 - Average Likes per Clip */}
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<p className="mb-0" style={{ color: "#6B7280" }}>
									Average Likes per Clip
								</p>
								<h4 className="mb-0">{averageClipLikeData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "#E0F7FA",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<FaFilm color="#00B8D4" size={24} />
							</div>
						</div>

						{/* Section 4 - Average Comments per Clip */}
						<div className="d-flex justify-content-between align-items-center">
							<div>
								<p className="mb-0" style={{ color: "#6B7280" }}>
									Average Comments per Clip
								</p>
								<h4 className="mb-0">{averageClipCommentData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "#FDE0E0",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<FaClapperboard color="#D50000" size={24} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* second section */}
			<div className="d-flex flex-row mb-3 gap-3">
				<div style={{ width: "50%" }}>
					<Card
						style={{
							borderRadius: "8px",
							padding: "10px",
						}}
					>
						<Bar data={data} options={options} />
					</Card>
				</div>

				<div style={{ width: "50%" }}>
					<Card
						style={{
							borderRadius: "8px",
							padding: "10px",
						}}
					>
						<Bar data={postData} options={PostOptions} />
					</Card>
				</div>
			</div>

			{/* third section */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					flexDirection: "row",
					marginBottom: "20px",
				}}
			>
				<div style={{ width: "50%", marginRight: "20px" }}>
					<Card
						style={{
							background: "linear-gradient(to right, #FFB8B1, #FFEDD5)", // Lighter gradient for Post Upload
							boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
							borderRadius: "8px",
							padding: "10px",
						}}
					>
						<div style={{ display: "flex", flexDirection: "column" }}>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "space-between",
								}}
							>
								<div>
									<h5 className="mb-5 title">Post Upload</h5>
								</div>
								<div style={{ marginBottom: "20px" }}>
									<Select
										defaultValue="weekly"
										style={{ width: 200 }}
										onChange={handlePostUploadedStatistics}
									>
										<Option value="weekly">Weekly</Option>
										<Option value="monthly">Monthly</Option>
										<Option value="quarterly">Quarterly</Option>
										<Option value="annually">Annually</Option>
									</Select>
								</div>
							</div>
						</div>

						{/* Graph Section */}
						<div>
							<h5 style={{ color: "black" }}>{postUploadData}</h5>{" "}
							{/* Changed text color to black for visibility */}
						</div>
					</Card>
				</div>

				<div style={{ width: "50%" }}>
					<Card
						style={{
							background: "linear-gradient(to right, #B7E3F8, #C9D5E6)", // Lighter gradient for Clips Upload
							boxShadow: "0 4px 8px rgba(0, 0, 0, 0.1)",
							borderRadius: "8px",
							padding: "10px",
						}}
					>
						<div style={{ display: "flex", flexDirection: "column" }}>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "space-between",
								}}
							>
								<div>
									<h5 className="mb-5 title">Clips Upload</h5>
								</div>
								<div>
									<Select
										defaultValue="weekly"
										style={{ width: 200 }}
										onChange={handlelCipsUploadedStatistics}
									>
										<Option value="weekly">Weekly</Option>
										<Option value="monthly">Monthly</Option>
										<Option value="quarterly">Quarterly</Option>
										<Option value="annually">Annually</Option>
									</Select>
								</div>
							</div>
						</div>

						{/* Graph Section */}
						<div>
							<h5 style={{ color: "black" }}>{clipUploadData}</h5>{" "}
							{/* Changed text color to black for visibility */}
						</div>
					</Card>
				</div>
			</div>
			{/* fouth section */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					flexDirection: "row",
					marginBottom: "20px",
				}}
			>
				<div style={{ width: "50%", marginRight: "20px" }}>
					<Card style={{ padding: "10px", borderRadius: "8px" }}>
						<h4 className="headingTitle">Most Booked Professionals </h4>
						<Table
							columns={topMostBookedProfessional}
							dataSource={mostBookedProfessional}
							rowKey="course_id"
							pagination={false}
						/>
					</Card>
				</div>

				<div style={{ width: "50%" }}>
					<Card
						style={{
							borderRadius: "8px",
							padding: "10px",
						}}
					>
						<Bar
							data={bookingAndServiceData}
							options={bookingAndServiceOptions}
						/>
					</Card>
				</div>
			</div>

			{/* fifth section */}
			<div className="d-flex justify-content-between gap-3 mb-3">
				{/* Most Booked Service */}
				<div
					className="card-box small-card"
					style={{
						backgroundColor: "#f0f8ff", // Subtle light blue
						padding: "20px",
						borderRadius: "12px",
						boxShadow: "0 6px 12px rgba(0, 0, 0, 0.05)", // Subtle shadow
						textAlign: "center", // Centering text
						width: "30%", // Uniform card size
					}}
				>
					<p
						className="desc"
						style={{ fontWeight: "500", fontSize: "16px", color: "#0077b6" }}
					>
						Most Booked Service
					</p>
					<h4
						style={{
							fontSize: "28px",
							fontWeight: "bold",
							margin: "10px 0",
							color: "#0077b6",
						}}
					>
						{mostBookedService}
					</h4>
					<h2
						style={{ fontSize: "36px", fontWeight: "bold", color: "#0077b6" }}
					>
						{mostBookedServiceCount}
					</h2>
				</div>

				{/* Most Posted Service */}
				<div
					className="card-box small-card"
					style={{
						backgroundColor: "#fff5e6", // Subtle light orange
						padding: "20px",
						borderRadius: "12px",
						boxShadow: "0 6px 12px rgba(0, 0, 0, 0.05)", // Subtle shadow
						textAlign: "center", // Centering text
						width: "30%", // Uniform card size
					}}
				>
					<p
						className="desc"
						style={{ fontWeight: "500", fontSize: "16px", color: "#ff8c00" }}
					>
						Most Posted Service
					</p>
					<h4
						style={{
							fontSize: "28px",
							fontWeight: "bold",
							margin: "10px 0",
							color: "#ff8c00",
						}}
					>
						{mostPostedService}
					</h4>
					<h2
						style={{ fontSize: "36px", fontWeight: "bold", color: "#ff8c00" }}
					>
						{mostPostedServiceCount}
					</h2>
				</div>

				{/* Most Booked Time Slot */}
				<div
					className="card-box small-card"
					style={{
						backgroundColor: "#ffe4e1", // Subtle light pink
						padding: "20px",
						borderRadius: "12px",
						boxShadow: "0 6px 12px rgba(0, 0, 0, 0.05)", // Subtle shadow
						textAlign: "center", // Centering text
						width: "30%", // Uniform card size
					}}
				>
					<p
						className="desc"
						style={{ fontWeight: "500", fontSize: "16px", color: "#dc143c" }}
					>
						Most Booked Time Slot
					</p>
					<h4
						style={{
							fontSize: "28px",
							fontWeight: "bold",
							margin: "10px 0",
							color: "#dc143c",
						}}
					>
						{mostBookedTimeSlots}
					</h4>
					<h2
						style={{ fontSize: "36px", fontWeight: "bold", color: "#dc143c" }}
					>
						{mostBookedTimeSlotCount}
					</h2>
				</div>
			</div>

			{/* sixth section */}
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					flexDirection: "row",
					marginTop: "20px",
				}}
			>
				<div style={{ width: "50%", marginRight: "20px" }}>
					<Card style={{ padding: "10px" }}>
						<div style={{ display: "flex", flexDirection: "column" }}>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "space-between",
								}}
							>
								<div>
									<h5 className="mb-5 title">Users Registered</h5>
								</div>
								<div style={{ marginBottom: "20px" }}>
									<Select
										defaultValue="week"
										style={{ width: 100 }}
										onChange={handlePeriodChange}
									>
										<Option value="today">Today</Option>
										<Option value="week">This Week</Option>
										<Option value="month">This Month</Option>
									</Select>
								</div>
							</div>
						</div>

						{/* Graph Section */}
						<div>
							<Column {...config} />
						</div>
					</Card>
				</div>
				<div style={{ width: "50%" }}>
					<Card style={{ padding: "10px" }}>
						<div style={{ display: "flex", flexDirection: "column" }}>
							<div
								style={{
									display: "flex",
									flexDirection: "row",
									justifyContent: "space-between",
								}}
							>
								<div>
									<h5 className="mb-5 title">Professional Registered</h5>
								</div>
								<div>
									<Select
										defaultValue="week"
										style={{ width: 100 }}
										onChange={handleGetCorporateRegisteredStatistics}
									>
										<Option value="today">Today</Option>
										<Option value="week">This Week</Option>
										<Option value="month">This Month</Option>
									</Select>
								</div>
							</div>
						</div>

						{/* Graph Section */}
						<div>
							<Column {...corporateConfig} />
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
