/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "primereact/card";
import Form from "react-bootstrap/Form";
import { Button } from "primereact/button";
import { GetServiceCategoryById } from "../../services/Api/ServiceApi";

const ViewSericeCategory = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState(null);

	useLayoutEffect(() => {
		GetServiceCategoryById(id)
			.then((res) => {
				setServiceData(res.data.data);
				console.log(res.data.data, "dd");
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const navigateToService = () => {
		navigate("/service-categories");
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
					<h3 className="page-title">SERVICE-CATEGORY</h3>
					<p className="page-sub-title">
						Details of Services & their categories
					</p>
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
						<span style={{ marginLeft: "5px" }}>
							{" "}
							Return to Service Categories
						</span>
					</Button>
				</div>
			</Box>
			<Card style={{ width: "100%" }}>
				<Form>
					<Form.Group className="mb-3">
						<Form.Label>Service Category Name:</Form.Label>
						<Form.Control
							name="name"
							defaultValue={serviceData?.title}
							type="text"
							rows={9}
							disabled
						/>
					</Form.Group>
				</Form>
			</Card>
		</Box>
	);
};

export default ViewSericeCategory;
