/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import Form from "react-bootstrap/Form";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../../services/Host";
import { Row, Col, Tabs, Tab, Container,Card } from "react-bootstrap"; 
import { FaStar } from "react-icons/fa";
import { GetProductById, GetReviewsByProductId } from "../../../services/Api/EcommeceApi";

const ViewProduct = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState(null);
	const [key, setKey] = useState("details"); // Tab state to switch between details and reviews

	useLayoutEffect(() => {
		GetProductById(id)
			.then((res) => {
				setServiceData(res.data.data);
				console.log(res.data.data, "dd");
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const navigateToService = () => {
		navigate("/product-list");
	};

	const [reviewData, setReviewData] = useState([]);

	useLayoutEffect(() => {
		GetReviewsByProductId(id)
			.then((res) => {
				setReviewData(res.data.data);
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	// Function to render the rating stars (full, half, empty)
	const renderStars = (rating) => {
		const validRating = parseFloat(rating); // Ensure rating is a valid number
		if (isNaN(validRating) || validRating < 0) return null; // Return null if the rating is invalid

		const fullStars = Math.floor(validRating); // Full stars
		const halfStar = validRating % 1 >= 0.5; // Half star check
		const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Empty stars

		return (
			<div style={{ display: "flex", alignItems: "center" }}>
				{/* Full Stars */}
				{[...Array(fullStars)].map((_, i) => (
					<FaStar
						key={`full-${i}`}
						color="#ffc107"
						style={{ marginRight: "2px" }}
					/>
				))}
				{/* Half Star */}
				{halfStar && (
					<FaStar
						key="half"
						color="#ffc107"
						style={{ marginRight: "2px", opacity: 0.5 }}
					/>
				)}
				{/* Empty Stars */}
				{[...Array(emptyStars)].map((_, i) => (
					<FaStar
						key={`empty-${i}`}
						color="#e4e5e9"
						style={{ marginRight: "2px" }}
					/>
				))}
			</div>
		);
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
					<h3 className="page-title">PRODUCT MANAGEMENT</h3>
					<p className="page-sub-title">View Details of Product</p>
				</div>
				<div>
					<Button
						icon="pi pi-arrow-left"
						severity="secondary"
						onClick={navigateToService}
						style={{ borderRadius: "5px", height: "40px" }}
					>
						<span style={{ marginLeft: "5px" }}> Return to Product</span>
					</Button>
				</div>
			</Box>

			{/* Tabs for Details and Reviews */}
			<Tabs
				id="product-tabs"
				activeKey={key}
				onSelect={(k) => setKey(k)}
				className="mb-3"
			>
				{/* Details Tab */}
				<Tab eventKey="details" title="Details">
					<Card style={{ padding: "20px" }}>
						<Form>
							<Form.Group className="mb-3">
								<Form.Label>Product Name:</Form.Label>
								<Form.Control
									name="name"
									defaultValue={serviceData?.name}
									type="text"
									rows={9}
									disabled
								/>
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label>Price</Form.Label>
								<Form.Control
									name="name"
									defaultValue={serviceData?.price}
									type="number"
									rows={9}
									disabled
								/>
							</Form.Group>
							<Form.Group className="mb-3">
								<Form.Label>Quantity</Form.Label>
								<Form.Control
									name="name"
									defaultValue={serviceData?.stock}
									type="number"
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
										<Form.Label>Product's Categories:</Form.Label>
										<Form.Control
											name="name"
											value={
												serviceData?.product_categories?.length > 0
													? serviceData.product_categories
															.map((category) => category.title)
															.join(", ")
													: "No category selected"
											}
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
									{serviceData?.product_attachments.map((attachment, index) => (
										<Col key={index} span={6}>
											<img
												// crossOrigin="anonymous"
												src={
													attachment?.file_name.split("//")[0] === "https:"
														? attachment?.file_name
														: `${BASE_URL_IMAGE}${attachment?.file_name}`
												}
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
				</Tab>

				{/* Reviews Tab */}
				<Tab eventKey="reviews" title="Reviews">
					<Container className="reviews-container">
						{reviewData?.length === 0 && (
							<Card className="no-reviews-card">
								<Card.Body>
									<p>No reviews available for this product.</p>
								</Card.Body>
							</Card>
						)}

						{reviewData?.map((review) => (
							<Card key={review.id} className="review-card">
								<Card.Body>
									<Row>
										<Col md={1} className="user-icon">
											<div className="user-circle">
												{review.review_product.user_profile.name.charAt(0)}
											</div>
										</Col>
										<Col md={11}>
											<div className="review-header">
												<div style={{ display: "flex", flexDirection: "row" }}>
													<div>
														<div className="review-name">
															{review.review_product.user_profile.name}
														</div>
														<div className="review-rating">
															{renderStars(parseFloat(review.rating))}{" "}
															{/* Individual rating stars */}
															<div className="rating-number">
																{review.rating}
															</div>
														</div>
													</div>
													<div className="review-date">
														{new Date(review.created_at).toLocaleDateString()}
													</div>
												</div>
											</div>
											<Card.Text className="review-comment">
												{review.review}
											</Card.Text>
										</Col>
									</Row>
								</Card.Body>
							</Card>
						))}
					</Container>
				</Tab>
			</Tabs>
		</Box>
	);
};

export default ViewProduct;
