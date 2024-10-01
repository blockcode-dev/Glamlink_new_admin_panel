/** @format */

import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { message } from "antd";
import Form from "react-bootstrap/Form";
import { Row, Col } from "react-bootstrap";
import "./Service.css";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../services/Host";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

import DeleteIcon from "@mui/icons-material/Delete";
import { GetServiceById, UpdateService } from "../../services/Api/ServiceApi";

const EditService = () => {
	const { id } = useParams();
	const navigate = useNavigate();
	const [serviceData, setServiceData] = useState({
		name: "",
		description: "",
		price: "",
		abbreviation: "",
		service_attachments: [],
	});
	const [images, setImages] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [removeImageIds, setRemoveImageIds] = useState([]);

	useLayoutEffect(() => {
		GetServiceById(id)
			.then((res) => {
				setServiceData(res.data.data);

				if (
					res.data.data.service_attachments &&
					res.data.data.service_attachments.length > 0
				) {
					const previews = res.data.data.service_attachments.map(
						(attachment) => `${BASE_URL_IMAGE}${attachment.file_name}`
					);
					setImagePreviews(previews);
				}
			})
			.catch((err) => {
				console.log(err, "error");
			});
	}, [id]);

	const handleEditorChange = (event, editor) => {
		const data = editor.getData();
		setServiceData((prevData) => ({
			...prevData,
			description: data,
		}));
	};

	const handleImageChange = (e) => {
		const selectedImages = Array.from(e.target.files);

		// Update state for image previews
		const newPreviews = selectedImages.map((image) =>
			URL.createObjectURL(image)
		);
		setImagePreviews((prevPreviews) => [...prevPreviews, ...newPreviews]);

		// Update state for images
		setImages(selectedImages);
	};
	const handleRemoveImage = (index) => {
		const removedImage = serviceData.service_attachments[index];
		const updatedImages = [...images];
		const updatedPreviews = [...imagePreviews];
		const updatedRemoveImageIds = [...removeImageIds]; // Assuming you have a state for removeImageIds

		updatedImages.splice(index, 1);
		updatedPreviews.splice(index, 1);

		// Add the ID to removeImageIds if available
		if (removedImage && removedImage.id) {
			updatedRemoveImageIds.push(removedImage.id);
		}

		setImages(updatedImages);
		setImagePreviews(updatedPreviews);
		setRemoveImageIds(updatedRemoveImageIds); // Set the updated removeImageIds in your state
	};

	const onChange = (e) => {
		setServiceData({ ...serviceData, [e.target.name]: e.target.value });
	};

	const handleSubmit = (e) => {
		e.preventDefault();
		const formData = new FormData();
		formData.append("name", serviceData?.name ? serviceData?.name : "");
		formData.append(
			"description",
			serviceData?.description ? serviceData?.description : ""
		);
		formData.append("price", serviceData?.price ? serviceData?.price : "");
		formData.append(
			"abbreviation",
			serviceData?.abbreviation ? serviceData?.abbreviation : ""
		);

		images.forEach((image, index) => {
			formData.append("images", image);
		});

		// Append removeImageIds to formData
		removeImageIds.forEach((id) => {
			formData.append("removeImageIds", id);
		});

		UpdateService(id, formData)
			.then((res) => {
				if (res.status === 200) {
					message.success("Service edited successfully!");
				}
				navigate("/services");
			})
			.catch((err) => {
				if (err.response && err.response.status === 401) {
					message.error("Token expired!");
					localStorage.removeItem("adminToken");
					setTimeout(() => {
						navigate("/login");
					}, 3000);
				} else {
					message.error("Something went wrong");
				}
			});
	};

	const navigateToService = () => {
		navigate("/services");
	};

	return (
		<Box>
			<Box style={{ marginBottom: "30px" }}>
				<h3 className="page-title">Update Service</h3>
				<p className="page-sub-title">Edit Details of Service</p>
			</Box>
			<Card style={{ width: "100%" }}>
				<Form>
					<Row>
						<Form.Group className="mb-3">
							<Form.Label>Service Name:</Form.Label>
							<Form.Control
								name="name"
								defaultValue={serviceData?.name}
								type="text"
								onChange={(e) => onChange(e)}
							/>
						</Form.Group>
					</Row>
					<Row>
						<Col>
							<Form.Group className="mb-3">
								<Form.Label>Abbreviation:</Form.Label>
								<Form.Control
									name="abbreviation"
									defaultValue={serviceData?.abbreviation}
									type="text"
									onChange={(e) => onChange(e)}
								/>
							</Form.Group>
						</Col>

						<Col>
							<Form.Group className="mb-3">
								<Form.Label>Price:</Form.Label>
								<Form.Control
									name="price"
									defaultValue={serviceData?.price}
									type="number"
									onChange={(e) => onChange(e)}
								/>
							</Form.Group>
						</Col>
					</Row>

					<Row>
						<Form.Group className="mb-3">
							<Form.Label>Images:</Form.Label>
							<Form.Control
								type="file"
								name="images"
								onChange={handleImageChange}
								multiple
							/>
							{imagePreviews.map((preview, index) => (
								<div
									key={index}
									style={{
										border: "1px solid #ccc",
										borderRadius: "5px",
										padding: "10px",
										marginBottom: "10px",
										marginTop: "20px",
									}}
								>
									<div style={{ display: "flex", alignItems: "center" }}>
										<img
											src={preview}
											alt={`Preview ${index}`}
											crossOrigin="anonymous"
											style={{
												height: "80px",
												width: "80px",
												marginRight: "10px",
											}}
										/>
										<span>{preview.name}</span>
										<DeleteIcon
											fontSize="large"
											color="warning"
											style={{ marginLeft: "auto", cursor: "pointer" }}
											onClick={() => handleRemoveImage(index)}
										/>
									</div>
								</div>
							))}
						</Form.Group>
					</Row>

					<Row>
						<Form.Group className="mb-3">
							<Form.Label>Description::</Form.Label>
							<CKEditor
								editor={ClassicEditor}
								onChange={handleEditorChange}
								data={serviceData.description}
								config={{
									height: "50%",
								}}
							/>
						</Form.Group>
					</Row>

					<div>
						<Button
							icon="pi pi-check"
							severity="info"
							onClick={handleSubmit}
							style={{
								height: "45px",
								padding: "20px",
								borderRadius: "5px",
							}}
						>
							Save
						</Button>

						<Button
							icon="pi pi-times"
							severity="secondary"
							onClick={navigateToService}
							style={{
								marginLeft: "10px",
								marginTop: "10px",
								height: "45px",
								padding: "20px",
								borderRadius: "5px",
							}}
						>
							Cancel
						</Button>
					</div>
				</Form>
			</Card>
		</Box>
	);
};

export default EditService;
