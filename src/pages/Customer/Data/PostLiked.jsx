/** @format */

import React, { useEffect, useState } from "react";
import { Table, Spin, Modal } from "antd";
import { useNavigate, useParams } from "react-router";
import { Box } from "@material-ui/core";
import moment from "moment";
import { Button } from "primereact/button";
import ReactPlayer from "react-player";
import { GetPostLikedByUserId } from "../../../services/Api/UserApi";
import { BASE_URL_IMAGE, BASE_URL_VIDEO } from "../../../services/Host";

const PostLiked = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [serviceData, setServiceData] = useState([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [mediaSrc, setMediaSrc] = useState(null);
	const [mediaType, setMediaType] = useState("");
	const [isMediaLoading, setIsMediaLoading] = useState(false);
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
			width: "5%",
		},
		{
			title: "Post By",
			dataIndex: ["user_like_post_post", "created_by", "user_profile", "name"],
			width: "15%",
		},
		{
			title: "Liked By",
			dataIndex: ["liked_by", "user_profile", "name"],
			width: "15%",
		},
		{
			title: "Media Type",
			dataIndex: ["user_like_post_post", "attachements"], // Reference attachments inside user_like_post_post
			width: "10%",
			render: (attachements) => {
				// Check if there are any attachments
				if (Array.isArray(attachements) && attachements.length > 0) {
					// Map over the array and return the file_type values as a comma-separated string or another format
					return attachements
						.map((attachement) => attachement.file_type)
						.join(", ");
				}
				return "No attachments"; // Fallback when there are no attachments
			},
		},
		{
			title: "View Media",
			dataIndex: ["user_like_post_post", "attachements"],
			render: (attachments) => {
				if (attachments && attachments.length > 0) {
					return (
						<a href="#" onClick={() => handleViewMedia(attachments)}>
							View Media
						</a>
					);
				}
				return null;
			},
			width: "20%",
		},
		{
			title: "Post On",
			dataIndex: ["user_like_post_post","created_at"],
			width: "20%",
			render: (date) => moment(date).format("YYYY-MM-DD"),
		},
		{
			title: "Liked On",
			dataIndex: "created_at",
			width: "20%",
			render: (date) => moment(date).format("YYYY-MM-DD"),
		},
	];

	// Fetching data
	const getData = async () => {
		try {
			setLoading(true);
			// Fetch followers by user ID
			const result = await GetPostLikedByUserId(id); // Just pass the user ID

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
		navigate(`/viewUser/${id}`);
	};

	const handleMediaLoaded = () => {
		setIsMediaLoading(false); // Stop loading spinner once media is fully loaded
	};

	const handleViewMedia = (attachments) => {
		const firstAttachment = attachments[0];
		setMediaSrc(null);

		if (firstAttachment) {
			// Apply the condition to check if the file_name starts with "https:"
			const mediaUrl =
				firstAttachment.file_name.split("//")[0] === "https:"
					? firstAttachment.file_name // Use the full URL if it's already an https URL
					: firstAttachment.file_type === "Video"
					? `${BASE_URL_VIDEO}${firstAttachment.file_name}` // Use BASE_URL_VIDEO if it's a video
					: `${BASE_URL_IMAGE}${firstAttachment.file_name}`; // Use BASE_URL_IMAGE if it's an image

			setMediaSrc(mediaUrl);
			setMediaType(firstAttachment.file_type);
			setIsMediaLoading(true);
			setIsModalVisible(true);
		}
	};

	const handleVideoReady = () => {
		// Video has loaded, so stop showing the spinner
		setIsMediaLoading(false);
	};

	const handleVideoEnd = () => {
		// When video finishes playing, stop the spinner just in case
		setIsMediaLoading(false);
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
					<h3 className="page-title">POST LIKE Management</h3>
					<p className="page-sub-title">View Post liked by User</p>
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

			<Modal
				centered
				open={isModalVisible}
				onCancel={() => setIsModalVisible(false)}
				footer={null}
				width={500}
			>
				{isMediaLoading ? (
					<div style={{ textAlign: "center" }}>
						<Spin size="large" />{" "}
					</div>
				) : null}

				{mediaType === "Image" ? (
					<img
						src={mediaSrc}
						alt="Media"
						style={{ width: "100%", height: "100%" }}
						onLoad={handleMediaLoaded}
					/>
				) : mediaType === "Video" ? (
					<ReactPlayer
						url={mediaSrc}
						controls
						width="100%"
						onReady={handleVideoReady} // When video is ready to play
						onEnded={handleVideoEnd} // When video completes playing
					/>
				) : null}
			</Modal>
		</Box>
	);
};

export default PostLiked;
