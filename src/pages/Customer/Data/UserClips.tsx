/** @format */

import React, { useEffect, useState } from "react";
import { Table, Modal, Spin, message, Button, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { BASE_URL_IMAGE, BASE_URL_VIDEO } from "../../../services/Host";
import {
	GetCommentsByClipId,
	GetLikesByClipId,
} from "../../../services/Api/ClipsApi";
import { GetClipsByUserId } from "../../../services/Api/PostApi";

import { ArrowLeftOutlined, RightCircleOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import { useIdParam } from "../../../utils/routing";
import type { Clip, ClipComment, ClipLike } from "../../../types/social";

// Likes/comments modal rows, numbered for display.
type LikeRow = ClipLike & { autoIncrementId: number };
type CommentRow = ClipComment & { autoIncrementId: number };

const UserClips = () => {
    const navigate = useNavigate();
	const id = useIdParam();
	const [serviceData, setServiceData] = useState<WithIndex<Clip>[]>([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [mediaSrc, setMediaSrc] = useState("");
	const [isMediaLoading, setIsMediaLoading] = useState(false);
	const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
	const [isThumbNailModalVisible, setIsThumbNailModalVisible] = useState(false);
	const [thumbaNailSrc, setThumbNailSrc] = useState("");
	const [isThumnbNailLoading, setIsThumnbNailIsLoading] = useState(false);

	const [likedUsers, setLikedUsers] = useState<LikeRow[]>([]);
	const [isCommentsModalVisible, setIsCommentsModalVisible] = useState(false);
	const [commentedUsers, setCommentedUsers] = useState<CommentRow[]>([]);

	const [tableParams, setTableParams] = useState<TableParams>({
		pagination: {
			current: 1,
			pageSize: 100,
		},
		sortField: null,
		sortOrder: null,
	});

	const columns: TableColumnsType<WithIndex<Clip>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "5%",
		},
		{
			title: "Content",
			dataIndex: "description",
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
			dataIndex: "file_name",
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
			title: "View ThumbNail",
			dataIndex: "thumbnail_file_name",
			render: (thumbnail_file_name) => {
				if (thumbnail_file_name) {
					return (
						<a
							href="#"
							onClick={() => handleViewThumbNail(thumbnail_file_name)}
						>
							View ThumbNail
						</a>
					);
				}
				return "No Clip";
			},
			width: "20%",
		},
		{
			title: "Posted By",
			dataIndex: ["reel_user", "user_profile", "name"],
			width: "10%",
		},
		{
			title: "Likes Count",
			dataIndex: "likes_count",
			width: "10%",
			render: (likes_count, record) =>
				likes_count > 0 ? (
					<span
						style={{ cursor: "pointer", color: "var(--color-primary)" }}
						onClick={() => handleLikesClick(record.id)}
					>
						{likes_count}{" "}
						<RightCircleOutlined
							style={{ fontSize: "20px", marginLeft: "5px" }}
						/>
					</span>
				) : (
					<span>{likes_count}</span>
				),
		},
		{
			title: "Comment Count",
			dataIndex: "comment_count",
			width: "10%",
			render: (comment_count, record) =>
				comment_count > 0 ? (
					<span
						style={{ cursor: "pointer", color: "var(--color-primary)" }}
						onClick={() => handleCommentClick(record.id)}
					>
						{comment_count}{" "}
						<RightCircleOutlined
							style={{ fontSize: "20px", marginLeft: "5px" }}
						/>
					</span>
				) : (
					<span>{comment_count}</span>
				),
		},
		{
			title: "Post Date",
			dataIndex: "created_at",
			width: "40%",
			render: (date) => dayjs(date).format("YYYY-MM-DD"),
		},
	];

	const getData = async () => {
		try {
			setLoading(true);

			// Call GetPostByUserId API with user ID from params
			const result = await GetClipsByUserId(id); // Just pass the user ID

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

	const handleTableChange: TableChangeHandler<WithIndex<Clip>> = (pagination, filters, sorter) => {
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

	const handleViewThumbNail = (fileName: string) => {
		if (fileName) {
			const mediaUrl =
				fileName.split("//")[0] === "https:"
					? fileName
					: `${BASE_URL_IMAGE}${fileName}`;
			setThumbNailSrc(mediaUrl);

			setIsThumnbNailIsLoading(true);
			setIsThumbNailModalVisible(true);
		}
	};

	const handleVideoReady = () => {
		setIsMediaLoading(false);
	};

	const handleModalCancel = () => {
		setIsModalVisible(false);
		setIsMediaLoading(false);
	};

	const handleThumbNailModalCancel = () => {
		setIsThumbNailModalVisible(false);
		setIsThumnbNailIsLoading(false);
	};

	const handleThumbNailMediaLoaded = () => {
		setIsThumnbNailIsLoading(false); // Stop loading spinner once media is fully loaded
	};

	const navigateToUser = () => {
		navigate(`/viewUser/${id}`);
	};
	const handleLikesClick = async (postId: number) => {
		try {
			const result = await GetLikesByClipId(postId);
			const dataWithIndex = result.data.data.map((item, index) => ({
				...item,
				autoIncrementId: index + 1,
			}));

			setLikedUsers(dataWithIndex);
			setIsLikesModalVisible(true);
		} catch (error) {
			console.error("Error fetching liked users", error);
			message.error("Failed to fetch liked users");
		}
	};

	const handleCommentClick = async (postId: number) => {
		try {
			const result = await GetCommentsByClipId(postId);
			const dataWithIndex = result.data.data.map((item, index) => ({
				...item,
				autoIncrementId: index + 1,
			}));

			setCommentedUsers(dataWithIndex);
			setIsCommentsModalVisible(true);
		} catch (error) {
			console.error("Error fetching commented users", error);
			message.error("Failed to fetch commented users");
		}
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
					<h3 className="page-title">Clip Management</h3>
					<p className="page-sub-title">View Clip List</p>
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

			{/* THUMNAIL */}
			<Modal
				centered
				open={isThumbNailModalVisible}
				onCancel={handleThumbNailModalCancel}
				footer={null}
				width={500}
			>
				{isThumnbNailLoading && (
					<div style={{ textAlign: "center" }}>
						<Spin size="large" />
					</div>
				)}

				<img
					src={thumbaNailSrc}
					alt="Media"
					style={{ width: "100%", height: "100%" }}
					onLoad={handleThumbNailMediaLoaded}
				/>
			</Modal>

			{/* likes count modal */}
			<Modal
				centered
				open={isLikesModalVisible}
				onCancel={() => setIsLikesModalVisible(false)}
				footer={null}
				width={800}
			>
				<Table<LikeRow>
					dataSource={likedUsers}
					columns={[
						{
							title: "S.No.",
							dataIndex: "index",
							render: (_, __, index) => index + 1,
							width: "10%",
						},
						{
							title: "Name",
							dataIndex: ["reel_liked_by", "user_profile", "name"],
							key: "name",
							width: "30%",
						},
						{
							title: "Liked On",
							dataIndex: "created_at",
							width: "30%",
							render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
						},
					]}
					rowKey={(record) => record.id}
					pagination={false}
				/>
			</Modal>

			{/* commented modal */}
			<Modal
				centered
				open={isCommentsModalVisible}
				onCancel={() => setIsCommentsModalVisible(false)}
				footer={null}
				width={800}
			>
				<Table<CommentRow>
					dataSource={commentedUsers}
					columns={[
						{
							title: "S.No.",
							dataIndex: "index",
							render: (_, __, index) => index + 1,
							width: "10%",
						},
						{
							title: "Name",
							dataIndex: ["reel_commented_by", "user_profile", "name"],
							key: "name",
							width: "30%",
						},
						{
							title: "Comment",
							dataIndex: "comment",
							width: "30%",
						},
						{
							title: "Commented On",
							dataIndex: "created_at",
							width: "30%",
							render: (date) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
						},
					]}
					rowKey={(record) => record.id}
					pagination={false}
				/>
			</Modal>
		</div>
	);
};

export default UserClips;
