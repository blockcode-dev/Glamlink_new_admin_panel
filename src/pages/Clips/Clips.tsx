/** @format */

import React, { useEffect, useState } from "react";
import { Table, Space, Modal, Spin, message, Button, Input, type TableColumnsType } from "antd";
import { useNavigate } from "react-router";
import dayjs from "dayjs";
import { BASE_URL_IMAGE, BASE_URL_VIDEO } from "../../services/Host";
import {
	DeleteClip,
	GetAllClips,
	GetCommentsByClipId,
	GetLikesByClipId,
} from "../../services/Api/ClipsApi";

import { DeleteOutlined, RightCircleOutlined, SearchOutlined } from "@ant-design/icons";
import { apiErrorStatus } from "../../utils/apiError";
import { singleSorter, type TableChangeHandler, type TableParams, type WithIndex } from "../../utils/table";
import type { Clip, ClipComment, ClipLike } from "../../types/social";

// Likes/comments modal rows, numbered for display.
type LikeRow = ClipLike & { autoIncrementId: number };
type CommentRow = ClipComment & { autoIncrementId: number };

const Clips = () => {
    const navigate = useNavigate();
	const [serviceData, setServiceData] = useState<WithIndex<Clip>[]>([]);
	const [serviceBackupData, setServiceBackupData] = useState<WithIndex<Clip>[]>([]);
	const [loading, setLoading] = useState(false);
	const [selectedRowKeys, setSelectedRowKeys] = useState<React.Key[]>([]);
	const [isModalVisible, setIsModalVisible] = useState(false);
	const [mediaSrc, setMediaSrc] = useState<string | null>("");
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
		if (!text) return <span>No description</span>; // or just return null
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
		{
			title: "Action",
			dataIndex: "action",
			render: (_, record) => (
				<Space size="middle">
					<Button
						style={{ borderRadius: "25px", color: "var(--color-error)", borderColor: "var(--color-error)" }}
						onClick={() => handleDelete([record.id])}
						icon={<DeleteOutlined />}
						danger
						shape="circle" />
				</Space>
			),
		},
	];

	const rowSelection = {
		selectedRowKeys,
		onChange: (selectedRowKeys: React.Key[]) => {
			setSelectedRowKeys(selectedRowKeys);
		},
	};

	const getData = async (params: TableParams) => {
		try {
			setLoading(true);
			const { pagination, sortField } = params;

			// Fetch clips with pagination and sorting
			const result = await GetAllClips({
				page: pagination.current,
				limit: pagination.pageSize,
				sortBy: sortField,
			});

			// Sort the clips based on a date field (e.g., createdAt) in descending order
			const sortedData = result.data.sort(
				(a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
			); // Adjust "createdAt" as needed

			// Adding index for serial number based on pagination and sorted data
			const newData = sortedData.map((item, index) => ({
				...item,
				index: index + 1 + ((pagination.current ?? 1) - 1) * (pagination.pageSize ?? 100),
			}));

			// Update state with fetched data
			setServiceData(newData);
			setServiceBackupData(newData);

			// Update pagination with total count from the result
			setTableParams({
				...tableParams,
				pagination: {
					...pagination,
					total: result.count, // Total number of clips from API
				},
			});
		} catch (e) {
			// Log the full error object for debugging
			console.error("Error: ", e);

			if (apiErrorStatus(e) === 403) {
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

	const handleTableChange: TableChangeHandler<WithIndex<Clip>> = (pagination, filters, sorter) => {
		const { field, order } = singleSorter(sorter);
		setTableParams({
			pagination,
			sortField: field,
			sortOrder: order,
		});
	};

	const handleDelete = (blogIds: React.Key[]) => {
		Modal.confirm({
			title: "Confirm",
			content: `Are you sure you want to delete ${
				blogIds.length > 1 ? "these Posts" : "this Post"
			}?`,
			onOk: async () => {
				try {
					await DeleteClip(blogIds);
					message.success("Post(s) deleted successfully");
					setSelectedRowKeys([]);

					// Update serviceData to remove deleted blogs
					setServiceData((prevData) =>
						prevData.filter((item) => !blogIds.includes(item.id))
					);
				} catch (error) {
					console.error("Error deleting Post(s):", error);
					message.error("Error deleting Post(s)");
				}
			},
		});
	};

	const onSearch = (searchField: string) => {
		const LIST = [...serviceBackupData];
		const searchList = LIST.filter(
			(item) =>
				item.description?.toLowerCase().includes(searchField.toLowerCase()) ||
				item.description?.toLowerCase().includes(searchField.toLowerCase())
		);
		setServiceData(searchList);
	};

	useEffect(() => {
		getData({
			pagination: tableParams.pagination,
			sortField: tableParams.sortField,
			sortOrder: tableParams.sortOrder,
		});
	}, []);

	const handleViewMedia = (fileName: string) => {
		if (!fileName) return; // Prevent null/undefined from processing

		const mediaUrl =
			fileName?.includes("https://") || fileName?.includes("http://")
				? fileName
				: `${BASE_URL_VIDEO}${fileName}`;

		setMediaSrc(mediaUrl);
		setIsMediaLoading(true);
		setIsModalVisible(true);
	};

	const handleViewThumbNail = (fileName: string) => {
		if (!fileName) return;

		setMediaSrc(null);
		setIsMediaLoading(true);

		const mediaUrl =
			fileName?.includes("https://") || fileName?.includes("http://")
				? fileName
				: `${BASE_URL_IMAGE}${fileName}`;

		setThumbNailSrc(mediaUrl);
		setIsThumnbNailIsLoading(true);
		setIsThumbNailModalVisible(true);
	};

	const handleVideoReady = () => {
		setIsMediaLoading(false);
	};

	const handleModalCancel = () => {
		setIsModalVisible(false);
		setMediaSrc(null); // Set to null to ensure the player is unmounted
		setIsMediaLoading(false);
	};

	const handleThumbNailModalCancel = () => {
		setIsThumbNailModalVisible(false);
		setIsThumnbNailIsLoading(false);
	};

	const handleThumbNailMediaLoaded = () => {
		setIsThumnbNailIsLoading(false); // Stop loading spinner once media is fully loaded
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
						<Button
							style={{
							    marginLeft: "10px",
							    borderRadius: "5px",
							    cursor: "pointer"
							}}
							onClick={() => handleDelete(selectedRowKeys)}
							disabled={!selectedRowKeys.length}
							icon={<DeleteOutlined />}
							danger
							size="large" />
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
				rowSelection={rowSelection}
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
					src={mediaSrc ?? undefined}
					controls
					style={{ width: "100%", height: 360 }}
					onCanPlay={handleVideoReady} // This will stop the loader once the video is ready
				/>
			</Modal>

			{/* THUMNAIL */}
			<Modal
				centered
				open={isThumbNailModalVisible}
				onCancel={() => {
					setIsModalVisible(false);
					setMediaSrc(null);
					setIsMediaLoading(false);
					handleThumbNailModalCancel();
				}}
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

export default Clips;
