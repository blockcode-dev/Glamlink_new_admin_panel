/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { GetUserById } from "../../services/Api/UserApi";
import "./Customers.css";
import { BASE_URL_IMAGE } from "../../services/Host";
import { Button, Card, Avatar, Col, Row, Typography } from "antd";

import {
    AppstoreFilled,
	ArrowLeftOutlined,
	BarChartOutlined,
	CalendarOutlined,
	CommentOutlined,
	LikeFilled,
	MessageFilled,
	RightCircleFilled,
	TeamOutlined,
	UserOutlined,
	UsergroupAddOutlined,
	VideoCameraFilled,
} from "@ant-design/icons";
import { useIdParam } from "../../utils/routing";
import AccountFields from "./AccountFields";
import type { UserDetail } from "../../types/user";

const ViewCustomer = () => {
	const navigate = useNavigate();
	const id = useIdParam();
	const [userData, setUserData] = useState<Partial<UserDetail>>({});

	useLayoutEffect(() => {
		// Fetching user data logic here
		GetUserById(id)
			.then((res) => {
				setUserData(res.data.data);
			})
			.catch((err) => {
				console.error(err, "error");
			});
	}, [id]);

	const navigateToUser = () => {
		navigate("/users");
	};

	const handleNavigateToUserPosts = () => {
		navigate(`/viewUserPost/${userData?.id}`);
	};

	const handleFollowerClick = () => {
		navigate(`/viewUserFollower/${userData?.id}`);
	};

	const handleFollowingClick = () => {
		navigate(`/viewUserFollowing/${userData?.id}`);
	};

	const handleUserClipClick = () => {
		navigate(`/viewUserClips/${userData?.id}`);
	};

	const handleUserPostLikeClick = () => {
		navigate(`/viewUserPostLikes/${userData?.id}`);
	};

	const handleUserPostCommentClick = () => {
		navigate(`/viewUserPostComment/${userData?.id}`);
	};

	const handleUserClipsLikeClick = () => {
		navigate(`/viewUserClipsLiked/${userData?.id}`);
	};

	const handleUserClipsCommentClick = () => {
		navigate(`/viewUserClipsCommented/${userData?.id}`);
	};

	const handleUserReviewGivenClick = () => {
		navigate(`/viewUserReviewsGiven/${userData?.id}`);
	};

	const handleUserBookings = () => {
		navigate(`/viewUserBookings/${userData?.id}`);
	};

	return (
		<div>
			{/* Header Section */}
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "30px"
				}}>
				<div>
					<h3 className="page-title">USER MANAGEMENT</h3>
					<p className="page-sub-title">View Information related to User</p>
				</div>
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

			<Row gutter={[16, 16]}>
				{/* Card 1: Personal Information */}
				<Col xs={12} md={8}>
					<Card style={{ padding: "10px",height:"100%" }}>
						<div
							style={{
							    textAlign: "center",
							    marginBottom: "20px"
							}}>
							<Avatar
								alt={userData?.user_profile?.name}
								src={
									userData?.user_attachments?.[0]?.file_name?.startsWith(
										"https:"
									)
										? userData?.user_attachments?.[0]?.file_name
										: `${BASE_URL_IMAGE}${userData?.user_attachments?.[0]?.file_name}`
								}
								size={120}
								style={{
								    display: "block",
								    margin: "0 auto"
								}} />

							<Typography.Text
								style={{
								    display: "block",
								    margin: 0,
								    fontSize: 24,
								    fontWeight: "bold",
								    marginTop: "10px"
								}}>
								{userData?.user_profile?.name}
							</Typography.Text>
							<Typography.Text
								style={{
								    display: "block",
								    margin: 0,
								    fontSize: 16,
								    color: "var(--color-text-tertiary)"
								}}>
								@{userData?.user_name}
							</Typography.Text>
							<Typography.Text
								style={{
								    display: "block",
								    margin: 0,
								    fontSize: 14,
								    fontWeight: 500,
								    color: "var(--color-text-tertiary)",
								    marginTop: "5px"
								}}>
								Profession: {userData?.user_profile?.profession || "N/A"}
							</Typography.Text>
						</div>
						<div className="personal_informtaion_box">
							<UserOutlined style={{ fontSize: "25px", marginRight: "15px" }} />
							<h5 className="personal_informtaion">Personal Information</h5>
						</div>

						<div style={{
						    padding: "20px"
						}}>
							<h4 className="heading_pi">About me:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.user_profile?.about
									? userData?.user_profile?.about
									: "Not Provided"}
							</p>

							<h4 className="heading_pi">Email:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.email ? userData?.email : "Not Provided"}
							</p>

							<AccountFields user={userData} />

							<h4 className="heading_pi">Address:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.user_profile?.address
									? userData?.user_profile?.address
									: "Not Provided"}
							</p>

							<h4 className="heading_pi">Account Created On:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.user_profile?.created_at
									? new Date(
											userData?.user_profile?.created_at
									  ).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
									  })
									: "Not Provided"}
							</p>

							<h4 className="heading_pi">Last Updated On:</h4>
							<p style={{ marginBottom: "20px", fontSize: "13px" }}>
								{userData?.user_profile?.created_at
									? new Date(
											userData?.user_profile?.created_at
									  ).toLocaleDateString("en-US", {
											year: "numeric",
											month: "long",
											day: "numeric",
									  })
									: "Not Provided"}
							</p>
						</div>
					</Card>
				</Col>

				{/* Card 2: User Counts */}
				<Col xs={12} md={16}>
					<Card style={{ padding: "20px",height:"100%" }}>
						<div className="personal_informtaion_box">
							<BarChartOutlined style={{ fontSize: "25px", marginRight: "15px" }} />
							<h5 className="personal_informtaion">User Activity Overview</h5>
						</div>

						<div>
							<Row gutter={[16, 16]}>
								{/* First Row: 2 cards */}
								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<AppstoreFilled style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Posts:</div>
												<div>
													{userData?.user_profile?.no_of_post_posted || 0}
												</div>
											</div>
											<div
												onClick={handleNavigateToUserPosts}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<VideoCameraFilled style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Clips:</div>
												<div>{userData?.number_of_reels || 0}</div>
											</div>
											<div
												onClick={handleUserClipClick}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								{/* Second Row: 2 cards */}
								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<LikeFilled style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Post Liked:</div>
												<div>{userData?.number_of_post_liked || 0}</div>
											</div>
											<div
												onClick={handleUserPostLikeClick}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<MessageFilled style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Post Commented:</div>
												<div>{userData?.number_of_post_commented || 0}</div>
											</div>
											<div
												onClick={handleUserPostCommentClick}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								{/* Third Row: 2 cards */}
								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<LikeFilled style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Clips Liked:</div>
												<div>{userData?.number_of_clips_liked || 0}</div>
											</div>
											<div
												onClick={handleUserClipsLikeClick}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<MessageFilled style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Clips Commented:</div>
												<div>{userData?.number_of_clips_commented || 0}</div>
											</div>
											<div
												onClick={handleUserClipsCommentClick}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								{/* fourth Row: 2 cards */}
								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<UsergroupAddOutlined style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Followers:</div>
												<div>{userData?.user_profile?.follower_count || 0}</div>
											</div>
											<div
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
												onClick={handleFollowerClick}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<TeamOutlined style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Following:</div>
												<div>{userData?.user_profile?.followee_count || 0}</div>
											</div>
											<div
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
												onClick={handleFollowingClick}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								{/* fifth Row: 2 cards */}
								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<CalendarOutlined style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Bookings:</div>
												<div>{userData?.number_of_user_bookings || 0}</div>
											</div>
											<div
											onClick={handleUserBookings}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>

								<Col span={12}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<CommentOutlined style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Reviews Given:</div>
												<div>{userData?.number_of_reviews_given || 0}</div>
											</div>
											<div
												onClick={handleUserReviewGivenClick}
												style={{
													backgroundColor: "var(--color-primary-soft)",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<RightCircleFilled
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Col>
							</Row>
						</div>
					</Card>
				</Col>
			</Row>
		</div>
	);
};

export default ViewCustomer;
