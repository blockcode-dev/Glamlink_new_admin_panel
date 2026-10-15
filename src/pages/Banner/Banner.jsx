/** @format */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Table } from "antd";
import { GetAllBanner } from "../../services/Api/Banner";
import moment from "moment/moment";

const Banner = () => {
	const navigate = useNavigate();
	const [locationData, setLocationData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState([]);

	// Fetch all locations
	const getData = async () => {
		try {
			setLoading(true);
			let result = await GetAllBanner(localStorage.getItem("adminToken"));
			const formattedData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1,
			}));
			setLocationData(formattedData);
		} catch (e) {
			console.log(e);
			if (e.response && e.response.data && e.response.data.message) {
				const errorMessage = e.response.data.message;

				if (
					errorMessage ===
					"Your free trial has expired. Please subscribe to continue using this feature."
				) {
					navigate("/trial-expired");
					return;
				} else if (
					errorMessage ===
					"You need to start a free trial or purchase a premium plan to access this feature."
				) {
					navigate("/ecommerce-activate");
					return;
				} else if (
					errorMessage ===
					"Your form is under review. Please wait for admin approval."
				) {
					navigate("/approval-waiting");
					return;
				} else if (errorMessage === "Your form is rejected.") {
					navigate("/approval-failed");
					return;
				} else if (
					errorMessage === "Only promoted beauticians can access this API."
				) {
					navigate("/promotion-needed");
					return;
				} else if (
					errorMessage === "Your promotion request is still pending approval."
				) {
					navigate("/promotion-request-pending");
					return;
				}
			} else {
				console.log("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		getData();
	}, []);

	const columns = [
		{
			title: "S.No.",
			dataIndex: "index",
			width: "10%",
			sorter: (a, b) => a.index - b.index,
		},
		{
			title: "Media",
			dataIndex: "file_name",
			key: "media",
			width: "40%",
			render: (text, record) => {
				if (record.file_type === "Image") {
					return (
						<img
							src={record.file_name}
							alt="Banner"
							style={{ width: "100px", height: "auto", borderRadius: "8px" }}
						/>
					);
				} else if (record.file_type === "Video") {
					return (
						<video
							controls
							width="160"
							height="90"
							style={{ borderRadius: "8px" }}
						>
							<source src={record.file_name} type="video/mp4" />
							Your browser does not support the video tag.
						</video>
					);
				}
				return "Unsupported media";
			},
		},
		{
			title: "Uploaded By",
			dataIndex: ["banner_user", "user_profile", "name"],
			sorter: (a, b) => a.user_profile.name.localeCompare(b.user_profile.name),
			width: "20%",
		},
		{
			title: "Uploaded On",
			dataIndex: "created_at",
			width: "30%",
			render: (date) => moment(date).format("YYYY-MM-DD HH:mm:ss"),
		},

		// {
		// 	title: "Action",
		// 	dataIndex: "action",
		// 	render: (_, record) => (
		// 		<Space size="middle">
		// 			<Button
		// 				shape="circle"
		// 				icon={<EditOutlined />}
		// 				size="large"
		// 				onClick={() => navigateToEditBanner([record.id])}
		// 			/>
		// 			<Button
		// 				shape="circle"
		// 				icon={<DeleteOutlined />}
		// 				size="large"
		// 				onClick={() => handleDelete([record.id])}
		// 			/>
		// 		</Space>
		// 	),
		// },
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: setSelectedRowKeys,
	};

	return (
		<div>
			<div
				style={{
					display: "flex",
					flexDirection: "row",
					justifyContent: "space-between",
					marginBottom: "40px",
				}}
			>
				<div>
					<h3 className="page-title">BANNER CONTENT</h3>
					<p className="page-sub-title">View Banner Content</p>
				</div>
				{/* <div
					style={{
						display: "flex",
						flexDirection: "row",
						alignItems: "flex-start",
						gap: "10px",
					}}
				>
					<Button
						icon={<DeleteOutlined />}
						size="large"
						onClick={() => handleDelete(selectedRowKeys)}
						disabled={!selectedRowKeys.length}
						danger
					/>
					<Button
						type="primary"
						icon={<PlusOutlined />}
						size="large"
						onClick={navigateToAddBanner}
					>
						Add Banner
					</Button>
				</div> */}
			</div>
			<Table
				columns={columns}
				dataSource={locationData}
				rowKey="id"
				// pagination={{ pageSize: 5 }}
				loading={loading}
				rowSelection={rowSelection}
			/>
		</div>
	);
};

export default Banner;
