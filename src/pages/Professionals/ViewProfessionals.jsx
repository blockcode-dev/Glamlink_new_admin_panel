/** @format */

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "primereact/button";
import { Box, Avatar, Typography, Switch } from "@mui/material"; // Import Grid correctly
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { GetUserById, PromoteUser } from "../../services/Api/UserApi";
import Grid from "@mui/material/Grid2";
import "./Professionals.css";
import { BASE_URL_IMAGE } from "../../services/Host";
import { FaCircleUser } from "react-icons/fa6";
import { SiReactivex } from "react-icons/si";
import { PiVideoFill } from "react-icons/pi";
import { IoArrowForwardCircleSharp } from "react-icons/io5";
import { AiFillLike } from "react-icons/ai";
import { BiSolidCommentDetail } from "react-icons/bi";
import { GiShadowFollower } from "react-icons/gi";
import { FaCalendarAlt } from "react-icons/fa";
import { MdReviews } from "react-icons/md";
import { BsFillGridFill } from "react-icons/bs";
import { IoIosPeople } from "react-icons/io";
import { GrServices } from "react-icons/gr";
import { FaUserClock } from "react-icons/fa6";
import { message } from "antd";

const ViewProfessionals = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [userData, setUserData] = useState([]);

	useLayoutEffect(() => {
		// Fetching user data logic here
		GetUserById(id)
			.then((res) => {
				setUserData(res.data.data);
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const navigateToUser = () => {
		navigate("/professionals");
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

	const handleUserBookings = () => {
		navigate(`/viewProfessionalBooking/${userData?.id}`);
	};

	const handleUserReviewTakenClick = () => {
		navigate(`/viewUserReviewsTaken/${userData?.id}`);
	};

	const handleUserServiceClick = () => {
		navigate(`/viewUserService/${userData?.id}`);
	};

	const handleAvailability = () => {
		navigate(`/viewAvailability/${userData?.id}`);
	};

	const [isPromoted, setIsPromoted] = useState(false);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (userData?.is_promoted !== undefined) {
			setIsPromoted(userData?.is_promoted);
		}
	}, [userData?.is_promoted]);

	const handlePromotionToggle = async () => {
		setLoading(true); // Start loading

		try {
			// Call the PromoteUser API
			const response = await PromoteUser(
				userData?.id,

			);

			if (response.status === 200) {
				// Toggle the promotion state based on the API response
				setIsPromoted(!isPromoted);

				if (isPromoted) {
					message.success("Professional no longer promoted.");
				} else {
					message.success("Professional promoted successfully.");
				}
			} else {
				// If the status is not 200, show an error
				message.error("Something went wrong. Please try again.");
			}
		} catch (error) {
			console.error("Error promoting user:", error);
			message.error("Failed to promote the user. Please try again.");
		} finally {
			setLoading(false); // Stop loading after the API call is done
		}
	};
	return (
		<Box>
			{/* Header Section */}
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="30px"
			>
				<div>
					<h3 className="page-title">Professionals MANAGEMENT</h3>
					<p className="page-sub-title">
						View Information related to Professionals
					</p>
				</div>
				<Button
					icon="pi pi-arrow-left"
					severity="secondary"
					onClick={navigateToUser}
					style={{ borderRadius: "5px", height: "47px" }}
				>
					<span style={{ marginLeft: "5px" }}>Return to Users</span>
				</Button>
			</Box>

			<Grid container spacing={2}>
				{/* Card 1: Personal Information */}
				<Grid item size={{ xs: 6, md: 4 }}>
					<Card style={{ padding: "10px",height:"100%" }}>
						<Box textAlign="center" marginBottom="20px">
							<Avatar
								alt={userData?.user_profile?.name}
								src={
									userData?.user_attachments?.[0]?.file_name?.startsWith(
										"https:"
									)
										? userData?.user_attachments?.[0]?.file_name
										: `${BASE_URL_IMAGE}${userData?.user_attachments?.[0]?.file_name}`
								}
								sx={{ width: 120, height: 120, margin: "auto" }}
							/>

							<Typography variant="h5" fontWeight="bold" marginTop="10px">
								{userData?.user_profile?.name}
							</Typography>
							<Typography variant="subtitle1" color="gray">
								@{userData?.user_name}
							</Typography>
							<Typography variant="subtitle2" color="gray" marginTop="5px">
								Profession: {userData?.user_profile?.profession || "N/A"}
							</Typography>
						</Box>

						{/* Promotion Toggle */}
						<Box
							display="flex"
							justifyContent="center"
							alignItems="center"
							marginBottom="20px"
						>
							<Typography variant="subtitle2" color="gray" marginRight="10px">
								Promoted:
							</Typography>
							<Switch
								checked={isPromoted} // Now this will properly reflect the initial state
								onChange={handlePromotionToggle}
								color="primary"
							/>
						</Box>

						<Box className="personal_informtaion_box">
							<FaCircleUser style={{ fontSize: "25px", marginRight: "15px" }} />
							<h5 className="personal_informtaion">Personal Information</h5>
						</Box>

						<Box padding="20px">
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
						</Box>
					</Card>
				</Grid>

				{/* Card 2: User Counts */}
				<Grid item size={{ xs: 6, md: 8 }}>
					<Card style={{ padding: "20px",height:"100%" }}>
						<Box className="personal_informtaion_box">
							<SiReactivex style={{ fontSize: "25px", marginRight: "15px" }} />
							<h5 className="personal_informtaion">
								Professionals Activity Overview
							</h5>
						</Box>

						<Box>
							<Grid container spacing={2}>
								{/* First Row: 2 cards */}
								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<BsFillGridFill style={{ fontSize: "30px" }} />
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
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<PiVideoFill style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Clips:</div>
												<div>{userData?.number_of_reels || 0}</div>
											</div>
											<div
												onClick={handleUserClipClick}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								{/* Second Row: 2 cards */}
								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<AiFillLike style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Post Liked:</div>
												<div>{userData?.number_of_post_liked || 0}</div>
											</div>
											<div
												onClick={handleUserPostLikeClick}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<BiSolidCommentDetail style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Post Commented:</div>
												<div>{userData?.number_of_post_commented || 0}</div>
											</div>
											<div
												onClick={handleUserPostCommentClick}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								{/* Third Row: 2 cards */}
								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<AiFillLike style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Clips Liked:</div>
												<div>{userData?.number_of_clips_liked || 0}</div>
											</div>
											<div
												onClick={handleUserClipsLikeClick}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<BiSolidCommentDetail style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Clips Commented:</div>
												<div>{userData?.number_of_clips_commented || 0}</div>
											</div>
											<div
												onClick={handleUserClipsCommentClick}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								{/* fourth Row: 2 cards */}
								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<GiShadowFollower style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Followers:</div>
												<div>{userData?.user_profile?.follower_count || 0}</div>
											</div>
											<div
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
												onClick={handleFollowerClick}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<IoIosPeople style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Following:</div>
												<div>{userData?.user_profile?.followee_count || 0}</div>
											</div>
											<div
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
												onClick={handleFollowingClick}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								{/* fifth Row: 2 cards */}
								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<FaCalendarAlt style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> Number of Bookings:</div>
												<div>{userData?.user_profile?.total_bookings || 0}</div>
											</div>
											<div
												onClick={handleUserBookings}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<MdReviews style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Reviews Taken:</div>
												<div>{userData?.number_of_reviews_taken || 0}</div>
											</div>
											<div
												onClick={handleUserReviewTakenClick}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								{/* sixth row:2 cards */}

								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<FaUserClock style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> View Availability:</div>
												{/* <div>{userData?.user_profile?.total_bookings || 0}</div> */}
											</div>
											<div
												onClick={handleAvailability}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>

								<Grid item size={6}>
									<Card className="card_two">
										<div className="card_2_div">
											<div
												style={{
													// backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "10px",
												}}
											>
												<GrServices style={{ fontSize: "30px" }} />
											</div>
											<div style={{ display: "flex", flexDirection: "column" }}>
												<div> No. of Services Provided:</div>
												<div>
													{userData?.user_profile?.no_of_service_provided || 0}
												</div>
											</div>
											<div
												onClick={handleUserServiceClick}
												style={{
													backgroundColor: "#E3E1F9",
													padding: "10px",
													borderRadius: "20px",
													cursor: "pointer",
												}}
											>
												<IoArrowForwardCircleSharp
													style={{ fontSize: "28px", color: "mediumpurple" }}
												/>
											</div>
										</div>
									</Card>
								</Grid>
							</Grid>
						</Box>
					</Card>
				</Grid>
			</Grid>
		</Box>
	);
};

export default ViewProfessionals;
