/** @format */

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "primereact/button";
import { Box, Avatar, Typography, Grid } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";
import { Card } from "primereact/card";
import { Row, Col, Form } from "react-bootstrap";
import "./Customers.css";
import { GetUserById } from "../../services/Api/UserApi";

const ViewCustomer = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [userData, setUserData] = useState([]);

	useLayoutEffect(() => {
		GetUserById(id)
			.then((res) => {
				setUserData(res.data.data);
				console.log("user", res.data.data);
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const navigateToUser = () => {
		navigate("/users");
	};

	const formatDate = (dateString) => {
		if (!dateString) return "";
		return dateString.split("T")[0];
	};

	const getStatusColor = (status) => {
		switch (status) {
			case "DELETED":
			case "REJECTED":
				return "red";
			case "SUCCESS":
			case "COMPLETED":
				return "green";
			case "ACCEPTED":
				return "purple";
			case "PENDING":
				return "yellow";
			default:
				return "geekblue";
		}
	};

	return (
		<Box >
			{/* Header Section */}
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="30px"
			>
				<div>
					<h3 className="page-title">User Management</h3>
					<p className="page-sub-title">View Information related to User</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToUser}
						style={{ borderRadius: "5px", height: "47px" }}
					>
						<span style={{ marginLeft: "5px" }}>Return to User</span>
					</Button>
				</div>
			</Box>

			{/* Card Section */}
			<Card>
				<div className="admin_profile">
					{/* Profile Section */}
					<Box sx={{ textAlign: "center", marginBottom: "20px" }}>
						<Avatar
							alt={userData?.user_profile?.name}
							src={userData?.user_attachments?.[0]?.file_name}
							sx={{ width: 120, height: 120, margin: "auto" }}
						/>
						<Typography variant="h5" sx={{ fontWeight: "bold", marginTop: "10px" }}>
							{userData?.user_profile?.name}
						</Typography>
						<Typography variant="subtitle1" sx={{ color: "gray" }}>
							@{userData?.user_name}
						</Typography>
						<Typography variant="subtitle2" sx={{ color: "gray", marginTop: "5px" }}>
							Profession: {userData?.user_profile?.profession || "N/A"}
						</Typography>
					</Box>

					{/* User Details Section */}
					<Form className="admin_details_form">
						<Grid container spacing={2}>
							{/* Email, Mobile, Followers, Following */}
							<Grid item xs={12} md={6}>
								<Form.Group className="mb-3">
									<Form.Label>User's Email:</Form.Label>
									<Form.Control
										name="email"
										defaultValue={userData?.email}
										type="text"
										disabled
									/>
								</Form.Group>
							</Grid>

							<Grid item xs={12} md={6}>
								<Form.Group className="mb-3">
									<Form.Label>User's Mobile:</Form.Label>
									<Form.Control
										name="mobile"
										defaultValue={userData?.user_profile?.mobile}
										type="text"
										disabled
									/>
								</Form.Group>
							</Grid>

							<Grid item xs={12} md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Followers:</Form.Label>
									<Form.Control
										name="followers"
										defaultValue={userData?.user_profile?.follower_count}
										type="text"
										disabled
									/>
								</Form.Group>
							</Grid>

							<Grid item xs={12} md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Following:</Form.Label>
									<Form.Control
										name="following"
										defaultValue={userData?.user_profile?.followee_count}
										type="text"
										disabled
									/>
								</Form.Group>
							</Grid>

							{/* Reels and Post Counts */}
							<Grid item xs={12} md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Reels Count:</Form.Label>
									<Form.Control
										name="reelsCount"
										defaultValue={userData?.user_profile?.no_of_service_provided}
										type="text"
										disabled
									/>
								</Form.Group>
							</Grid>

							<Grid item xs={12} md={6}>
								<Form.Group className="mb-3">
									<Form.Label>Post Count:</Form.Label>
									<Form.Control
										name="postCount"
										defaultValue={userData?.user_profile?.no_of_post_posted}
										type="text"
										disabled
									/>
								</Form.Group>
							</Grid>

							{/* Address */}
							<Grid item xs={12}>
								<Form.Group className="mb-3">
									<Form.Label>User's Address:</Form.Label>
									<Form.Control
										name="postCount"
										defaultValue={userData?.user_profile?.address}
										type="text"
										disabled
									/>
								</Form.Group>
							</Grid>
						</Grid>
					</Form>
				</div>
			</Card>
		</Box>
	);
};

export default ViewCustomer;
