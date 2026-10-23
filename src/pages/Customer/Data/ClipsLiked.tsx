/** @format */

import React, { useEffect, useState } from "react";
import { Table, Modal, Spin, Button, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { BASE_URL_VIDEO } from "../../../services/Host";

import { GetClipsLikedByUserId } from "../../../services/Api/UserApi";

import { ArrowLeftOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import { useIdParam } from "../../../utils/routing";
import type { UserClipLike } from "../../../types/social";

const ClipsLiked = () => {
	const navigate = useNavigate();
	const id = useIdParam();
	const [serviceData, setServiceData] = useState<WithIndex<UserClipLike>[]>([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [mediaSrc, setMediaSrc] = useState("");
	const [isMediaLoading, setIsMediaLoading] = useState(false);

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<UserClipLike>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "5%",
		},
		{
			title: "Posted By",
			dataIndex: ["reel_like_reel","reel_user", "user_profile", "name"],
			width: "15%",
		},
		{
			title: "Liked By",
			dataIndex: ["reel_liked_by", "user_profile", "name"],
			width: "15%",
		},
		{
			title: "Content",
			dataIndex: ["reel_like_reel","description"],
			width: "20%",
			render: (text) => {
				const words = text.split(" ");
				const truncatedText =
					words.length > 10 ? words.slice(0, 10).join(" ") + " ..." : text;
				return <span>{truncatedText}</span>;
			},
		},
		{
			title: "View Clip",
			dataIndex: ["reel_like_reel","file_name"],
			render: (file_name) => {
				if (file_name) {
					return (
						<a href="#" onClick={() => handleViewMedia(file_name)}>
							View Clip
						</a>
					);
				}
				return "No Clip";
			},
			width: "10%",
		},
		{
			title: "Liked On",
			dataIndex: "created_at",
			width: "20%",
			render: (date) => dayjs(date).format("YYYY-MM-DD"),
		},
		{
			title: "Uploaded On",
			dataIndex: ["reel_like_reel","created_at"],
			width: "20%",
			render: (date) => dayjs(date).format("YYYY-MM-DD"),
		},
	];

	const getData = async () => {
		try {
			setLoading(true);

			// Call GetPostByUserId API with user ID from params
			const result = await GetClipsLikedByUserId(id); // Just pass the user ID

			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1, // You can maintain the index if you want
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

	const handleTableChange: TableChangeHandler<WithIndex<UserClipLike>> = (pagination, filters, sorter) => {
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

	const handleViewMedia = (fileName: string) => {
		if (fileName) {
			const mediaUrl =
				fileName.split("//")[0] === "https:"
					? fileName
					: `${BASE_URL_VIDEO}${fileName}`;
			setMediaSrc(mediaUrl);
			setIsMediaLoading(true);
			setIsModalVisible(true);
		}
	};

	const handleVideoReady = () => {
		setIsMediaLoading(false);
	};

	const handleModalCancel = () => {
		setIsModalVisible(false);
		setIsMediaLoading(false);
	};

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
					<h3 className="page-title">Clip Likes Management</h3>
					<p className="page-sub-title">View Clip Likes By User</p>
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
			{/* REEL  */}
			<Modal
				centered
				open={isModalVisible}
				onCancel={handleModalCancel}
				footer={null}
				width={500}
			>
				{isMediaLoading && (
					<div style={{ textAlign: "center" }}>
						<Spin size="large" />
					</div>
				)}

				<video
					src={mediaSrc}
					controls
					style={{ width: "100%", height: 360 }}
					onCanPlay={handleVideoReady} // This will stop the loader once the video is ready
				/>
			</Modal>

		</div>
	);
};

export default ClipsLiked;
