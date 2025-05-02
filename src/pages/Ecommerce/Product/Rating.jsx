import React, { useLayoutEffect, useState } from "react";
import { Container, Row, Col, Card } from "react-bootstrap";
import { FaStar } from "react-icons/fa";
import { useNavigate, useParams } from "react-router";
import "./Rating.scss";
import { Button } from "primereact/button";
import { Box } from "@mui/material";
import { GetReviewsByProductId } from "../../../services/Api/EcommeceApi";

const Ratings = () => {
    const navigate = useNavigate();
    const { id } = useParams();
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
                    <FaStar key={`full-${i}`} color="#ffc107" style={{ marginRight: "2px" }} />
                ))}
                {/* Half Star */}
                {halfStar && (
                    <FaStar key="half" color="#ffc107" style={{ marginRight: "2px", opacity: 0.5 }} />
                )}
                {/* Empty Stars */}
                {[...Array(emptyStars)].map((_, i) => (
                    <FaStar key={`empty-${i}`} color="#e4e5e9" style={{ marginRight: "2px" }} />
                ))}
            </div>
        );
    };

    return (
        <Container className="reviews-container">
            <Box
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                marginBottom="30px"
            >
                <div className="views-all">
                    <h3 className="page-title">REVIEWS MANAGEMENT</h3>
                </div>
                <div>
                    <Button
                        icon="pi pi-arrow-left"
                        severity="secondary"
                        onClick={() => navigate("/product-list")}
                        style={{ borderRadius: "5px", height: "40px" }}
                    >
                        <span style={{ marginLeft: "5px" }}> Return to Product</span>
                    </Button>
                </div>
            </Box>

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
                                                {renderStars(parseFloat(review.rating))} {/* Individual rating stars */}
                                                <div className="rating-number">{review.rating}</div>
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
    );
};

export default Ratings;
