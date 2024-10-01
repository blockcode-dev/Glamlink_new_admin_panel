/** @format */

import React, { useEffect, useLayoutEffect, useState } from "react";
import { Button } from "primereact/button";
import { Box } from "@mui/material";
import { useNavigate, useParams } from "react-router-dom";

import { Card } from "primereact/card";
import { Row, Col, Form } from "react-bootstrap";
import "./Customers.css";
import { GetUserById } from "../../services/Api/UserApi";

const ViewCustomer = () => {
	const navigate = useNavigate();
	const { id } = useParams();
	const [userData, setUserData] = useState([]);
	const [activeTab, setActiveTab] = useState("all");

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
				return "green";
			case "ACCEPTED":
				return "purple";
			case "PENDING":
				return "yellow";
			case "COMPLETED":
				return "green"; // Assuming you want COMPLETED to have the same color as SUCCESS
			default:
				return "geekblue"; // Default color
		}
	};

	return (
		<Box>
			<Box
				display="flex"
				justifyContent="space-between"
				alignItems="center"
				marginBottom="30px"
			>
				<div>
					<h3 className="page-title">User MANAGEMENT</h3>
					<p className="page-sub-title">View Information related with User</p>
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

			<Card>
				<div className="admin_profile">
					<Form className="admin_details_form">
						<div>
							<Row>
								<Col>
									<Form.Group className="mb-3">
										<Form.Label>User's Name:</Form.Label>
										<Form.Control
											name="name"
											defaultValue={userData?.user_profile?.name}
											type="text"
											rows={9}
											disabled
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group className="mb-3">
										<Form.Label>User's Email:</Form.Label>
										<Form.Control
											name="name"
											defaultValue={userData?.email}
											type="text"
											rows={9}
											disabled
										/>
									</Form.Group>
								</Col>
								<Col>
									<Form.Group className="mb-3">
										<Form.Label>User's Mobile:</Form.Label>
										<Form.Control
											name="name"
											defaultValue={userData?.user_profile?.mobile}
											type="text"
											rows={9}
											disabled
										/>
									</Form.Group>
								</Col>
							</Row>

							<Row>
								<Col>
									<Form.Group className="mb-3">
										<Form.Label>User's Addresses:</Form.Label>
										<ul>
											{userData?.user_address?.length > 0 ? (
												userData.user_address.map((address, index) => (
													<li key={index}>{address.full_address}</li>
												))
											) : (
												<p>No address available</p>
											)}
										</ul>
									</Form.Group>
								</Col>
							</Row>
						</div>
					</Form>
				</div>
			</Card>
		</Box>
	);
};

export default ViewCustomer;
