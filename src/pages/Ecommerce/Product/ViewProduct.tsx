/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate } from "react-router";
import { BASE_URL_IMAGE } from "../../../services/Host";
import { GetProductById, GetReviewsByProductId } from "../../../services/Api/EcommeceApi";

import { Button, Card, Col, Form, Input, Row, Tabs } from "antd";
import { ArrowLeftOutlined, StarFilled } from "@ant-design/icons";
import { useIdParam } from "../../../utils/routing";
import SafeHtml from "../../../components/SafeHtml";
import type { Product, ProductReview } from "../../../types/ecommerce";

const ViewProduct = () => {
	const id = useIdParam();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState<Product | null>(null);
	const [key, setKey] = useState("details"); // Tab state to switch between details and reviews

	useLayoutEffect(() => {
		GetProductById(id)
			.then((res) => {
		    setServiceData(res.data.data);
		})
			.catch((err) => {
				console.error(err, "error");
			});
	}, [id]);

	const navigateToService = () => {
		navigate("/product-list");
	};

	const [reviewData, setReviewData] = useState<ProductReview[]>([]);

	useLayoutEffect(() => {
		GetReviewsByProductId(id)
			.then((res) => {
				setReviewData(res.data.data);
			})
			.catch((err) => {
				console.error(err, "error");
			});
	}, [id]);

	// Function to render the rating stars (full, half, empty)
	const renderStars = (rating: number | string) => {
		const validRating = parseFloat(String(rating)); // Ensure rating is a valid number
		if (isNaN(validRating) || validRating < 0) return null; // Return null if the rating is invalid

		const fullStars = Math.floor(validRating); // Full stars
		const halfStar = validRating % 1 >= 0.5; // Half star check
		const emptyStars = 5 - fullStars - (halfStar ? 1 : 0); // Empty stars

		return (
			<div style={{ display: "flex", alignItems: "center" }}>
				{/* Full Stars */}
				{[...Array(fullStars)].map((_, i) => (
					<StarFilled
						key={`full-${i}`}
						style={{
						    color: "var(--color-rating)",
						    marginRight: "2px"
						}} />
				))}
				{/* Half Star */}
				{halfStar && (
					<StarFilled
						key="half"
						style={{
						    color: "var(--color-rating)",
						    marginRight: "2px",
						    opacity: 0.5
						}} />
				)}
				{/* Empty Stars */}
				{[...Array(emptyStars)].map((_, i) => (
					<StarFilled
						key={`empty-${i}`}
						style={{
						    color: "var(--color-text-disabled)",
						    marginRight: "2px"
						}} />
				))}
			</div>
		);
	};

	return (
		<div>
			<div
				style={{
				    display: "flex",
				    justifyContent: "space-between",
				    alignItems: "center",
				    marginBottom: "30px"
				}}>
				<div>
					<h3 className="page-title">PRODUCT MANAGEMENT</h3>
					<p className="page-sub-title">View Details of Product</p>
				</div>
				<div>
					<Button
						onClick={navigateToService}
						style={{
						    borderRadius: "5px"
						}}
						icon={<ArrowLeftOutlined />}
						size="large"
					>
						<span style={{ marginLeft: "5px" }}> Return to Product</span>
					</Button>
				</div>
			</div>

			{/* Tabs for Details and Reviews */}
			<Tabs
				id="product-tabs"
				activeKey={key}
				onChange={(k) => setKey(k)}
				style={{
				    marginBottom: 16
				}}
				items={[
				{
					key: "details",
					label: "Details",
					children: (
					<Card style={{ padding: "20px" }}>
						<Form layout="vertical">
							<Form.Item label="Product Name:">

								<Input name="name" value={serviceData?.name} disabled />
							</Form.Item>
							<Form.Item label="Price">

								<Input name="name" value={serviceData?.price} type="number" disabled />
							</Form.Item>
							<Form.Item label="Quantity">

								<Input name="name" value={serviceData?.stock} type="number" disabled />
							</Form.Item>
							<Form.Item label="Description:">

								<SafeHtml
									style={{
										backgroundColor: "var(--color-surface-muted)",
										borderRadius: "5px",
										padding: "10px",
										border: "1px solid var(--color-border-strong) ",
									}}
									html={serviceData?.description}
								/>
							</Form.Item>
							<Row gutter={24}>
								<Col flex="1">
									<Form.Item label="Product's Categories:">

										<Input
											name="name"
											value={
												serviceData?.product_categories?.length
													? serviceData.product_categories
															.map((category) => category.title)
															.join(", ")
													: "No category selected"
											}
											disabled />
									</Form.Item>
								</Col>
							</Row>
							<Form.Item label="Images:">

								<Row gutter={[16, 16]}>
									{serviceData?.product_attachments.map((attachment, index) => (
										<Col key={index} span={6}>
											<img
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
							</Form.Item>
						</Form>
					</Card>
					),
				},
				{
					key: "reviews",
					label: "Reviews",
					children: (
					<div className="reviews-container">
						{reviewData?.length === 0 && (
							<Card className="no-reviews-card">
								<div>
									<p>No reviews available for this product.</p>
								</div>
							</Card>
						)}

						{reviewData?.map((review) => (
							<Card key={review.id} className="review-card">
								<div>
									<Row gutter={24}>
										<Col md={2} className="user-icon">
											<div className="user-circle">
												{review.review_product.user_profile.name.charAt(0)}
											</div>
										</Col>
										<Col md={22}>
											<div className="review-header">
												<div style={{ display: "flex", flexDirection: "row" }}>
													<div>
														<div className="review-name">
															{review.review_product.user_profile.name}
														</div>
														<div className="review-rating">
															{renderStars(parseFloat(String(review.rating)))}{" "}
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
											<div className="review-comment">
												{review.review}
											</div>
										</Col>
									</Row>
								</div>
							</Card>
						))}
					</div>
					),
				},
				]}
			/>
		</div>
	);
};

export default ViewProduct;
