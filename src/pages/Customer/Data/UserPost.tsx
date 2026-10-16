/** @format */

import React, { useEffect, useState } from "react";
import { Table, Modal, Spin, message, Button, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { BASE_URL_IMAGE, BASE_URL_VIDEO } from "../../../services/Host";
import {
	GetPostByUserId,
	GetLikesByPostId,
	GetCommentsByPostId,
} from "../../../services/Api/PostApi";
import { ArrowLeftOutlined, RightCircleOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../../utils/table";
import { useIdParam } from "../../../utils/routing";
import type { Post, PostComment, PostLike } from "../../../types/social";
import type { Attachment } from "../../../types/user";

// Likes/comments modal rows, numbered for display.
type LikeRow = PostLike & { autoIncrementId: number };
type CommentRow = PostComment & { autoIncrementId: number };

const UserPost = () => {
	const navigate = useNavigate();
	const id = useIdParam();
	const [serviceData, setServiceData] = useState<WithIndex<Post>[]>([]);
	const [loading, setLoading] = useState(false);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [mediaSrc, setMediaSrc] = useState<string | null>(null);
	const [mediaType, setMediaType] = useState("");
	const [isMediaLoading, setIsMediaLoading] = useState(false);
	const [isLikesModalVisible, setIsLikesModalVisible] = useState(false);
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

	const columns: TableColumnsType<WithIndex<Post>> = [
		{
			title: "S.No.",
			dataIndex: "index",
			sorter: (a, b) => a.index - b.index,
			width: "5%",
		},
		{
			title: "Content",
			dataIndex: "content",
			width: "20%",
			render: (text) => {
				const words = text.split(" ");
				const truncatedText =
					words.length > 10 ? words.slice(0, 10).join(" ") + " ..." : text;
				return <span>{truncatedText}</span>;
			},
		},
		{
			title: "Media Type",
			dataIndex: "attachements", // Reference the entire attachments array
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
			dataIndex: "attachements",
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
			title: "Posted By",
			dataIndex: ["created_by", "user_profile", "name"],
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
			const result = await GetPostByUserId(id); // Just pass the user ID

			const newData = result.data.data.map((item, index) => ({
				...item,
				index: index + 1, // You can maintain the index if you want
			}));

			setServiceData(newData);
		} catch (e) {
			console.error(e);
			if (apiErrorStatus(e) === 401) {
				navigate("/error401");
				console.error("You do not have access to this page as a sub-admin.");
			} else {
				console.error("Error loading data. Please try again later.");
			}
		} finally {
			setLoading(false);
		}
	};

	const handleTableChange: TableChangeHandler<WithIndex<Post>> = (pagination, filters, sorter) => {
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

	const handleMediaLoaded = () => {
		setIsMediaLoading(false); // Stop loading spinner once media is fully loaded
	};

	const handleViewMedia = (attachments: Attachment[]) => {
		const firstAttachment = attachments[0];
		setMediaSrc(null);
		if (firstAttachment) {
			const mediaUrl =
				firstAttachment.file_type === "Video"
					? `${BASE_URL_VIDEO}${firstAttachment.file_name}`
					: `${BASE_URL_IMAGE}${firstAttachment.file_name}`;

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

	const handleLikesClick = async (postId: number) => {
		try {
			const result = await GetLikesByPostId(postId);
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
			const result = await GetCommentsByPostId(postId);
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
					<h3 className="page-title">Post Management</h3>
					<p className="page-sub-title">View Post List</p>
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
						src={mediaSrc ?? undefined}
						alt="Media"
						style={{ width: "100%", height: "100%" }}
						onLoad={handleMediaLoaded}
					/>
				) : mediaType === "Video" ? (
					<video
						src={mediaSrc ?? undefined}
						controls
						style={{ width: "100%", height: 360 }}
						onCanPlay={handleVideoReady} // When video is ready to play
						onEnded={handleVideoEnd} // When video completes playing
					/>
				) : null}
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
							dataIndex: ["liked_by", "user_profile", "name"],
							key: "name",
							width: "30%",
						},
						{
							title: "Liked On",
							dataIndex: "created_at",
							width: "30%",
							render: (date: string) => dayjs(date).format("YYYY-MM-DD HH:mm:ss"),
						},
					]}
					rowKey={(record) => record.id}
					pagination={false}
				/>
			</Modal>

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
							dataIndex: ["commented_by", "user_profile", "name"],
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

export default UserPost;
