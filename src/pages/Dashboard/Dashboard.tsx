/** @format */

import React, { useEffect, useState } from "react";
import { Table, Select, Button, Card, type TableColumnsType } from "antd";
import "./Dashboard.css";
// Chart.js draws on a canvas, which can't read var(--…), so charts take the tokens from index.css.
import { cssVar, withAlpha } from "../../config/theme";
import { Bar } from "react-chartjs-2";
import {
	Chart as ChartJS,
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend,
	type ChartOptions,
	type Plugin,
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
import { useNavigate } from "react-router";

import {
    ArrowRightOutlined,
	LikeFilled,
	MessageFilled,
	PlaySquareFilled,
	VideoCameraFilled,
} from "@ant-design/icons";
import type { BookedProfessional, RegistrationPeriod, UploadPeriod } from "../../types/dashboard";

ChartJS.register(
	CategoryScale,
	LinearScale,
	BarElement,
	Title,
	Tooltip,
	Legend
);

// Writes each bar's value in white at the middle of the bar.
const barValueLabels: Plugin<"bar"> = {
	id: "barValueLabels",
	afterDatasetsDraw(chart) {
		const { ctx } = chart;
		chart.data.datasets.forEach((dataset, i) => {
			chart.getDatasetMeta(i).data.forEach((bar, index) => {
				const value: unknown = dataset.data[index];
				if (!Number.isFinite(Number(value)) || value === "" || value === null) return;
				const { x, y, base } = bar.getProps(["x", "y", "base"], true);
				ctx.save();
				ctx.fillStyle = cssVar("--color-on-primary");
				ctx.textAlign = "center";
				ctx.textBaseline = "middle";
				ctx.fillText(String(value), x, (y + base) / 2);
				ctx.restore();
			});
		});
	},
};

// Single-bar registration chart for the selected period (y axis fixed at 0-50).
const registrationChart = (period: string, value: number | null, color: string, label: string) => ({
	data: {
		labels: [period],
		datasets: [
			{ label, data: [value], backgroundColor: color, barPercentage: 0.2 },
		],
	},
	options: {
		responsive: true,
		plugins: { legend: { display: false } },
		scales: { y: { min: 0, max: 50, ticks: { stepSize: 10 } } },
	},
	plugins: [barValueLabels],
});

const { Option } = Select;

const Dashboard = () => {
	const navigate = useNavigate();
	const [customerData, setCustomerData] = useState<number | null>(null);
	const [professionalCountData, setProfessionalCountData] = useState<number | null>(null);
	const [postCountData, setPostCounteData] = useState<number | null>(null);
	const [clipsCounteData, setClipsCountCount] = useState<number | null>(null);
	const [averagePostLikeData, setAveragePostLikeData] = useState<number | null>(null);
	const [averageClipLikeData, setAverageClipLikeData] = useState<number | null>(null);
	const [averagePostCommentData, setAveragePostCommentData] = useState<number | null>(null);
	const [averageClipCommentData, setAverageClipCommentData] = useState<number | null>(null);
	const [averageFollowerPerUserData, setAverageFollowerPerUserData] = useState<number | null>(null);
	const [averageFollowingPerUserData, setAverageFollowingPerUserData] =
		useState<number | null>(null);
	const [
		averageFollowerPerProfessionalData,
		setAverageFollowerPerProfessionalData,
	] = useState<number | null>(null);
	const [
		averageFollowingPerProfessionalData,
		setAverageFollowingPerProfessionalData,
	] = useState<number | null>(null);
	const [averagePostByUserData, setAveragePostByUserData] = useState<number | null>(null);
	const [averagePostByProfessionalData, setAveragePostByProfessionalData] =
		useState<number | null>(null);
	const [
		averageServicesByProfessionalData,
		setAverageServicesByProfessionalData,
	] = useState<number | null>(null);
	const [mostPostedService, setMostPostedService] = useState("");
	const [mostPostedServiceCount, setMostPostedServiceCount] = useState(0);

	const [mostBookedService, setMostBookedService] = useState<string | undefined>("");
	const [mostBookedServiceCount, setMostBookedServiceCount] = useState(0);

	const [mostBookedTimeSlots, setMostBookedTimeSlots] = useState("");
	const [mostBookedTimeSlotCount, setMostBookedTimeSlotCount] = useState(0);

	const [mostBookedProfessional, setMostBookedProfessional] = useState<BookedProfessional[]>([]);
	const [averageBookingPerProfessional, setAverageBookingPerProfessional] =
		useState<number | null>(null);

	const [newUserRegisteredData, setNewUserRegisteredData] = useState<number | null>(null);
	const [period, setPeriod] = useState<RegistrationPeriod>("today");
	const [newProfessionalRegisteredData, setNewProfessionalRegisteredData] =
		useState<number | null>(null);
	const [professionalPeriod, setProfessionalPeriod] = useState<RegistrationPeriod>("today");

	const getCustomerData = async () => {
		try {
		    const result = await GetUserCount();
			setCustomerData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getProfessionalCountData = async () => {
		try {
			const result = await GetProfessionalCount();
			setProfessionalCountData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getPostCountData = async () => {
		try {
			const result = await GetPostCount();
			setPostCounteData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getClipsCountCount = async () => {
		try {
			const result = await GetClipsCount();
			setClipsCountCount(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageLikesPerPost = async () => {
		try {
			const result = await GetAverageLikesPerPostCount();
			setAveragePostLikeData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageLikesPerClip = async () => {
		try {
			const result = await GetAverageLikesPerClipCount();
			setAverageClipLikeData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageCommentsPerPost = async () => {
		try {
			const result = await GetAverageCommentPerPostCount();
			setAveragePostCommentData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageCommentsPerClip = async () => {
		try {
			const result = await GetAverageCommentPerClipCount();
			setAverageClipCommentData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageFollowersPerUser = async () => {
		try {
			const result = await GetAverageFollowersPerUser();
			setAverageFollowerPerUserData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageFollowingPerUser = async () => {
		try {
			const result = await GetAverageFollowingPerUser();
			setAverageFollowingPerUserData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageFollowersPerProfessional = async () => {
		try {
			const result = await GetAverageFollowerPerProfessional();
			setAverageFollowerPerProfessionalData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageFollowingPerProfessional = async () => {
		try {
			const result = await GetAverageFollowingPerProfessional();
			setAverageFollowingPerProfessionalData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAveragePostByUser = async () => {
		try {
			const result = await GetAveragePostByUser();
			setAveragePostByUserData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAveragePostByProfessional = async () => {
		try {
			const result = await GetAveragePostByProfessional();
			setAveragePostByProfessionalData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageServicesByProfessional = async () => {
		try {
			const result = await GetAverageServicesByProfessional();
			setAverageServicesByProfessionalData(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getMostPostedService = async () => {
		try {
			const result = await GetMostPostedServices();
			setMostPostedService(result.data.data.name);
			setMostPostedServiceCount(result.data.data.service_count);
		} catch (e) {
			console.error(e);
		}
	};

	const getMostBookedService = async () => {
		try {
			const result = await GetMostBookedServices();
			setMostBookedService(result.data.data.appointment_service?.name); // Set the booked service name
			setMostBookedServiceCount(result.data.data.booking_count); // Set the booking count
		} catch (e) {
			console.error(e);
		}
	};

	// For most booked time slot (including the booking count)
	const getMostBookedTimeSlot = async () => {
		try {
			const result = await GetMostBookedTimeSlots();

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
			console.error(e);
		}
	};

	const getMostBookedProfessional = async () => {
		try {
		    const result = await GetMostBookedProfessionals();
			setMostBookedProfessional(result.data.data);
		} catch (e) {
			console.error(e);
		}
	};

	const getAverageBookingByProfessional = async () => {
		try {
			const result = await GetAverageBookingByProfessional();
			setAverageBookingPerProfessional(result.data.data);
		} catch (e) {
			console.error(e);
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

	const handlePeriodChange = async (newPeriod: RegistrationPeriod) => {
		setPeriod(newPeriod); // Update the period state
		try {
			const result = await GetUserRegisteredStatistics(newPeriod); // Call the API
			setNewUserRegisteredData(result.data.data || 0); // Update sales count with the result data
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		handlePeriodChange(period); // Fetch data for the default period when the component loads
	}, []);

	const handleGetCorporateRegisteredStatistics = async (newPeriod: RegistrationPeriod) => {
		setProfessionalPeriod(newPeriod);
		try {
			const result = await GetCorporateRegisteredStatistics(newPeriod); // Call the API
			setNewProfessionalRegisteredData(result.data.data || 0); // Update sales count with the result data
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		handleGetCorporateRegisteredStatistics(professionalPeriod); // Fetch data for the default period when the component loads
	}, []);

	const [postUploadData, setPostUploadData] = useState<number | null>(null);
	const [postUploadPeriod, setPostUploadPeriod] = useState<UploadPeriod>("weekly");
	const handlePostUploadedStatistics = async (newPeriod: UploadPeriod) => {
		setPostUploadPeriod(newPeriod);
		try {
			const result = await GetPostUploadedStatistics(newPeriod);
			setPostUploadData(result.data.data || 0);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		handlePostUploadedStatistics(postUploadPeriod);
	}, []);

	const [clipUploadData, setClipUploadData] = useState<number | null>(null);
	const [clipUploadPeriod, setClipUploadPeriod] = useState<UploadPeriod>("weekly");
	const handlelCipsUploadedStatistics = async (newPeriod: UploadPeriod) => {
		setClipUploadPeriod(newPeriod);
		try {
			const result = await GetClipsUploadedStatistics(newPeriod);
			setClipUploadData(result.data.data || 0);
		} catch (e) {
			console.error(e);
		}
	};

	useEffect(() => {
		handlelCipsUploadedStatistics(clipUploadPeriod);
	}, []);

	const config = registrationChart(
		period,
		newUserRegisteredData,
		cssVar("--color-success"),
		"Number of Registered Users"
	);

	const corporateConfig = registrationChart(
		period,
		newProfessionalRegisteredData,
		cssVar("--color-primary"),
		"Number of Registered Professionals"
	);

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
					withAlpha(cssVar("--color-accent-blue"), 0.6),
					withAlpha(cssVar("--color-accent-amber"), 0.6),
					withAlpha(cssVar("--color-accent-teal"), 0.6),
					withAlpha(cssVar("--color-accent-purple"), 0.6),
				],
				borderColor: [
					cssVar("--color-accent-blue"),
					cssVar("--color-accent-amber"),
					cssVar("--color-accent-teal"),
					cssVar("--color-accent-purple"),
				],
				borderWidth: 1,
			},
		],
	};

	// Chart options for better presentation
	const options: ChartOptions<"bar"> = {
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
					withAlpha(cssVar("--color-accent-teal"), 0.6),
					withAlpha(cssVar("--color-accent-purple"), 0.6),
				],
				borderColor: [
					cssVar("--color-accent-teal"),
					cssVar("--color-accent-purple"),
				],
				borderWidth: 1,
			},
		],
	};

	// Chart options for better presentation
	const PostOptions: ChartOptions<"bar"> = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
				labels: {
					color: "var(--color-text)", // Legend text color
				},
			},
			title: {
				display: true,
				text: "Statistics of Posts by Users and Professionals", // Updated title
				color: "var(--color-text)", // Title color
				font: {
					size: 20, // Title font size
					weight: "bold", // Title font weight
				},
			},
		},
	};

	const bookingAndServiceOptions: ChartOptions<"bar"> = {
		responsive: true,
		plugins: {
			legend: {
				position: "top",
				labels: {
					color: "var(--color-text)", // Legend text color
				},
			},
			title: {
				display: true,
				text: "Booking and Service Statistics Of Professional", // Updated title
				color: "var(--color-text)", // Title color
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
					withAlpha(cssVar("--color-primary"), 0.6),
					withAlpha(cssVar("--color-accent-pink"), 0.6),
				],
				borderColor: [
					cssVar("--color-primary"),
					cssVar("--color-accent-pink"),
				],
				borderWidth: 1,
			},
		],
	};

	const topMostBookedProfessional: TableColumnsType<BookedProfessional> = [
		{
			title: "Professional Name",
			dataIndex: ["appointment_professional", "user_profile", "name"],
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
					backgroundColor: "var(--color-surface)", // Changed to camelCase
					padding: "20px",
					borderRadius: "8px", // Changed to camelCase
					boxShadow: "0 2px 8px var(--color-shadow)",
					marginBottom: "20px", // Keep quotes for string values
				}}
			>
				<h3 className="dashboard_title">Welcome Melanie 👋🏻</h3>
				<p className="page-sub-title" style={{ color: "var(--color-success)" }}>
					Here’s a snapshot of your latest statistics and insights to help you
					manage the platform effectively.
				</p>
			</div>
			{/* first section */}
			<div style={{
			    display: "flex",
			    flexDirection: "row",
			    gap: 16,
			    marginBottom: 16
			}}>
				<div
					style={{
						width: "50%",
						display: "flex",
						flexDirection: "column",
						justifyContent: "space-between",
					}}
				>
					<div
						style={{
						    display: "flex",
						    justifyContent: "space-between",
						    gap: 16,
						    height: "50%",
						    marginBottom: "20px"
						}}>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Users Registered</p>
								<h4
									className="sub-title"
									style={{
									    marginBottom: 0
									}}>{customerData}</h4>
							</div>
							<Button
								style={{
									backgroundColor: "var(--color-info-soft)",
									marginTop: "10px",
									border: "var(--color-border)",
									color: "var(--color-text)",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/users")}
								onMouseOver={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-info-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}
								onMouseOut={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-info-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}>View Users <ArrowRightOutlined /></Button>
						</div>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Professionals Registered</p>
								<h4
									className="sub-title"
									style={{
									    marginBottom: 0
									}}>{professionalCountData}</h4>
							</div>
							<Button
								style={{
									backgroundColor: "var(--color-success-soft)",
									marginTop: "10px",
									border: "var(--color-border)",
									color: "var(--color-text)",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/professionals")}
								onMouseOver={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-success-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}
								onMouseOut={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-success-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}>View Professionals <ArrowRightOutlined /></Button>
						</div>
					</div>

					<div
						style={{
						    display: "flex",
						    justifyContent: "space-between",
						    gap: 16,
						    height: "50%"
						}}>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Posts</p>
								<h4
									className="sub-title"
									style={{
									    marginBottom: 0
									}}>{postCountData}</h4>
							</div>
							<Button
								style={{
									backgroundColor: "var(--color-error-soft)",
									marginTop: "10px",
									border: "var(--color-border)",
									color: "var(--color-text)",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/posts-list")}
								onMouseOver={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-error-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}
								onMouseOut={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-error-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}>View Posts <ArrowRightOutlined /></Button>
						</div>
						<div className="card-box small-card">
							<div>
								<p className="desc">Total Clips</p>
								<h4
									className="sub-title"
									style={{
									    marginBottom: 0
									}}>{clipsCounteData}</h4>
							</div>
							<Button
								style={{
									backgroundColor: "var(--color-accent-purple-soft)",
									marginTop: "10px",
									border: "var(--color-border)",
									color: "var(--color-text)",
									borderRadius: "10px",
									fontSize: "13px",
									textAlign: "left",
									transition: "background-color 0.3s ease",
								}}
								onClick={() => navigate("/clips-list")}
								onMouseOver={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-accent-purple-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}
								onMouseOut={(e) => {
									(e.target as HTMLElement).style.backgroundColor = "var(--color-accent-purple-soft)";
									(e.target as HTMLElement).style.color = "#black";
								}}>View Clips <ArrowRightOutlined /></Button>
						</div>
					</div>
				</div>

				<div
					style={{
						backgroundColor: "var(--color-surface)",
						padding: "20px",
						borderRadius: "8px",
						boxShadow: "0 2px 8px var(--color-shadow)",
						width: "50%",
					}}
				>
					<h4
						style={{
						    marginBottom: 16,
						    fontWeight: "bold"
						}}>
						Statistics
					</h4>
					<div style={{
					    display: "flex",
					    flexDirection: "column",
					    gap: 24
					}}>
						{/* Section 1 - Average Likes per Post */}
						<div style={{
						    display: "flex",
						    justifyContent: "space-between",
						    alignItems: "center"
						}}>
							<div>
								<p
									style={{
									    marginBottom: 0,
									    color: "var(--color-text-secondary)"
									}}>
									Average Likes per Post
								</p>
								<h4 style={{
								    marginBottom: 0
								}}>{averagePostLikeData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "var(--color-info-soft)",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<LikeFilled
									style={{
									    fontSize: 24,
									    color: "var(--color-primary)"
									}} />
							</div>
						</div>

						{/* Section 2 - Average Comments per Post */}
						<div style={{
						    display: "flex",
						    justifyContent: "space-between",
						    alignItems: "center"
						}}>
							<div>
								<p
									style={{
									    marginBottom: 0,
									    color: "var(--color-text-secondary)"
									}}>
									Average Comments per Post
								</p>
								<h4 style={{
								    marginBottom: 0
								}}>{averagePostCommentData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "var(--color-warning-soft)",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<MessageFilled
									style={{
									    fontSize: 24,
									    color: "var(--color-warning)"
									}} />
							</div>
						</div>

						{/* Section 3 - Average Likes per Clip */}
						<div style={{
						    display: "flex",
						    justifyContent: "space-between",
						    alignItems: "center"
						}}>
							<div>
								<p
									style={{
									    marginBottom: 0,
									    color: "var(--color-text-secondary)"
									}}>
									Average Likes per Clip
								</p>
								<h4 style={{
								    marginBottom: 0
								}}>{averageClipLikeData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "var(--color-primary-soft)",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<VideoCameraFilled
									style={{
									    fontSize: 24,
									    color: "var(--color-primary)"
									}} />
							</div>
						</div>

						{/* Section 4 - Average Comments per Clip */}
						<div style={{
						    display: "flex",
						    justifyContent: "space-between",
						    alignItems: "center"
						}}>
							<div>
								<p
									style={{
									    marginBottom: 0,
									    color: "var(--color-text-secondary)"
									}}>
									Average Comments per Clip
								</p>
								<h4 style={{
								    marginBottom: 0
								}}>{averageClipCommentData}</h4>
							</div>
							<div
								style={{
									width: "50px",
									height: "50px",
									backgroundColor: "var(--color-error-soft)",
									borderRadius: "50%",
									display: "flex",
									justifyContent: "center",
									alignItems: "center",
								}}
							>
								<PlaySquareFilled
									style={{
									    fontSize: 24,
									    color: "var(--color-error)"
									}} />
							</div>
						</div>
					</div>
				</div>
			</div>

			{/* second section */}
			<div style={{
			    display: "flex",
			    flexDirection: "row",
			    marginBottom: 16,
			    gap: 16
			}}>
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
							background: "linear-gradient(to right, var(--color-error-soft), var(--color-warning-soft))", // Lighter gradient for Post Upload
							boxShadow: "0 4px 8px var(--color-shadow)",
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
									<h5
										className="title"
										style={{
										    marginBottom: 48
										}}>Post Upload</h5>
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
							<h5 style={{ color: "var(--color-text)" }}>{postUploadData}</h5>{" "}
							{/* Changed text color to black for visibility */}
						</div>
					</Card>
				</div>

				<div style={{ width: "50%" }}>
					<Card
						style={{
							background: "linear-gradient(to right, var(--color-primary-soft), var(--color-info-soft))", // Lighter gradient for Clips Upload
							boxShadow: "0 4px 8px var(--color-shadow)",
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
									<h5
										className="title"
										style={{
										    marginBottom: 48
										}}>Clips Upload</h5>
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
							<h5 style={{ color: "var(--color-text)" }}>{clipUploadData}</h5>{" "}
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
			<div style={{
			    display: "flex",
			    justifyContent: "space-between",
			    gap: 16,
			    marginBottom: 16
			}}>
				{/* Most Booked Service */}
				<div
					className="card-box small-card"
					style={{
						backgroundColor: "var(--color-info-soft)", // Subtle light blue
						padding: "20px",
						borderRadius: "12px",
						boxShadow: "0 6px 12px var(--color-shadow)", // Subtle shadow
						textAlign: "center", // Centering text
						width: "30%", // Uniform card size
					}}
				>
					<p
						className="desc"
						style={{ fontWeight: "500", fontSize: "16px", color: "var(--color-primary)" }}
					>
						Most Booked Service
					</p>
					<h4
						style={{
							fontSize: "28px",
							fontWeight: "bold",
							margin: "10px 0",
							color: "var(--color-primary)",
						}}
					>
						{mostBookedService}
					</h4>
					<h2
						style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-primary)" }}
					>
						{mostBookedServiceCount}
					</h2>
				</div>

				{/* Most Posted Service */}
				<div
					className="card-box small-card"
					style={{
						backgroundColor: "var(--color-warning-soft)", // Subtle light orange
						padding: "20px",
						borderRadius: "12px",
						boxShadow: "0 6px 12px var(--color-shadow)", // Subtle shadow
						textAlign: "center", // Centering text
						width: "30%", // Uniform card size
					}}
				>
					<p
						className="desc"
						style={{ fontWeight: "500", fontSize: "16px", color: "var(--color-warning)" }}
					>
						Most Posted Service
					</p>
					<h4
						style={{
							fontSize: "28px",
							fontWeight: "bold",
							margin: "10px 0",
							color: "var(--color-warning)",
						}}
					>
						{mostPostedService}
					</h4>
					<h2
						style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-warning)" }}
					>
						{mostPostedServiceCount}
					</h2>
				</div>

				{/* Most Booked Time Slot */}
				<div
					className="card-box small-card"
					style={{
						backgroundColor: "var(--color-error-soft)", // Subtle light pink
						padding: "20px",
						borderRadius: "12px",
						boxShadow: "0 6px 12px var(--color-shadow)", // Subtle shadow
						textAlign: "center", // Centering text
						width: "30%", // Uniform card size
					}}
				>
					<p
						className="desc"
						style={{ fontWeight: "500", fontSize: "16px", color: "var(--color-error)" }}
					>
						Most Booked Time Slot
					</p>
					<h4
						style={{
							fontSize: "28px",
							fontWeight: "bold",
							margin: "10px 0",
							color: "var(--color-error)",
						}}
					>
						{mostBookedTimeSlots}
					</h4>
					<h2
						style={{ fontSize: "36px", fontWeight: "bold", color: "var(--color-error)" }}
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
									<h5
										className="title"
										style={{
										    marginBottom: 48
										}}>Users Registered</h5>
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
							<Bar {...config} />
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
									<h5
										className="title"
										style={{
										    marginBottom: 48
										}}>Professional Registered</h5>
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
							<Bar {...corporateConfig} />
						</div>
					</Card>
				</div>
			</div>
		</div>
	);
};

export default Dashboard;
