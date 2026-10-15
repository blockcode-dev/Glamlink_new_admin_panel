/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "primereact/card";
import Form from "react-bootstrap/Form";
import "./Service.css";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../services/Host";
import { GetServiceById } from "../../services/Api/ServiceApi";
import { Row, Col } from "react-bootstrap";

const ViewService = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState(null);

	useLayoutEffect(() => {
		GetServiceById(id)
			.then((res) => {
				setServiceData(res.data.data);
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const navigateToService = () => {
		navigate("/services");
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
					<h3 className="page-title">About Service</h3>
					<p className="page-sub-title">Details of Service</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={(e) => {
							navigateToService();
						}}
						style={{ borderRadius: "5px", height: "40px" }}
					>
						<span style={{ marginLeft: "5px" }}> Return to Services</span>
					</Button>
				</div>
			</Box>
			<Card style={{ width: "100%" }}>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label>Service Name:</Form.Label>
						<Form.Control
							name="name"
							defaultValue={serviceData?.name}
							type="text"
							rows={9}
							disabled
						/>
					</Form.Group>
					<Form.Group className="mb-3">
						<Form.Label>Description:</Form.Label>
						<div
							style={{
								backgroundColor: "#EBECF2",
								borderRadius: "5px",
								padding: "10px",
								border: "1px solid #ced4da ",
							}}
							dangerouslySetInnerHTML={{
								__html: serviceData?.description,
							}}
						/>
					</Form.Group>
					<Row>
						<Col>
							<Form.Group className="mb-3">
								<Form.Label>Abbreviation:</Form.Label>
								<Form.Control
									name="name"
									defaultValue={serviceData?.abbreviation}
									type="text"
									rows={9}
									disabled
								/>
							</Form.Group>
						</Col>
						<Col>
							<Form.Group className="mb-3">
								<Form.Label>Price:</Form.Label>
								<Form.Control
									name="name"
									defaultValue={serviceData?.price}
									type="text"
									rows={9}
									disabled
								/>
							</Form.Group>
						</Col>
					</Row>
					<Form.Group className="mb-3">
						<Form.Label>Images:</Form.Label>
						<Row gutter={[16, 16]}>
							{serviceData?.service_attachments.map((attachment, index) => (
								<Col key={index} span={6}>
									<img
										crossOrigin="anonymous"
										src={`${BASE_URL_IMAGE}${attachment.file_name}`}
										alt={`Service graphic ${index + 1}`}
										style={{
											height: "150px",
											width: "150px",
											borderRadius: "10px",
										}}
									/>
								</Col>
							))}
						</Row>
					</Form.Group>
				</Form>
			</Card>
		</Box>
	);
};

export default ViewService;
