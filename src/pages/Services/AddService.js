/** @format */

import React, { useState } from "react";
import { Box } from "@mui/material";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import Form from "react-bootstrap/Form";
import { CreateSerice } from "../../services/Api/ServiceApi";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "./Service.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { message } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";
import { Row, Col } from "react-bootstrap";

const AddService = () => {
	const [name, setName] = useState("");
	const [description, setDescription] = useState("");
	const [abbreviation, setAbbreviation] = useState("");
	const [price, setPrice] = useState("");
	const [images, setImages] = useState([]);
	const [imagePreviews, setImagePreviews] = useState([]);
	const [disable, setDisable] = useState(false);
	const navigate = useNavigate();

	const handleImageChange = async (e) => {
		const files = e.target.files;

		if (files.length > 0) {
			const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

			const compressedImages = [];
			const imagePreviews = [];

			for (const file of files) {
				if (!allowedTypes.includes(file.type)) {
					console.error(
						"Error: Invalid file type. Images (JPEG, JPG, PNG) only!"
					);
					return;
				}

				const compressedFile =
					file.size <= 1024 * 1024
						? file
						: await imageCompression(file, {
								maxSizeMB: 1,
								maxWidthOrHeight: 1920,
						  });

				compressedImages.push(
					new Blob([compressedFile], { type: "image/jpeg" })
				);

				// Create image preview URL
				const previewUrl = URL.createObjectURL(compressedFile);
				imagePreviews.push({ name: file.name, previewUrl });
			}

			setImages(compressedImages);
			setImagePreviews(imagePreviews);
		}
	};

	const handleRemoveImage = (index) => {
		const updatedImages = [...images];
		const updatedPreviews = [...imagePreviews];

		updatedImages.splice(index, 1);
		updatedPreviews.splice(index, 1);

		setImages(updatedImages);
		setImagePreviews(updatedPreviews);
	};

	const handleEditorChange = (event, editor) => {
		const data = editor.getData();
		setDescription(data);
	};

	const handleSubmit = async (event) => {
		event.preventDefault();

		setDisable(true);

		if (!name) {
			message.error("Please enter name");
			setDisable(false);
			return;
		}
		if (!description) {
			message.error("Please enter description");
			setDisable(false);
			return;
		}

		try {
			const formData = new FormData();
			formData.append("name", name);
			formData.append("abbreviation", abbreviation);
			formData.append("price", price);
			formData.append("description", description);
			if (images.length > 0) {
				images.forEach((image, index) => {
					formData.append(`images`, image, `compressed_image_${index}.jpg`);
				});
			}

			const response = await CreateSerice(formData);

			if (response.status === 201) {
				message.success("Service addedd successfully!");
			}
			navigate("/services");
			setDisable(false);
		} catch (error) {
			if (error.response.status === 401) {
				message.error("Token expired");
				localStorage.removeItem("adminToken");
				setTimeout(() => {
					navigate("/Login");
				}, 1000);
			} else {
				message.error("Something went wrong");
			}
			setDisable(false);
		}
	};

	const navigateToService = () => {
		navigate("/services");
	};

	return (
		<Box>
			<Box style={{ marginBottom: "30px" }}>
				<h3 className="page-title">Create Service</h3>
				<p className="page-sub-title">Add new Service</p>
			</Box>
			<Card style={{padding:"20px"}}>
				<div>
					<Form onSubmit={handleSubmit}>
						<Form.Group className="mb-3">
							<Form.Label>Service Name:</Form.Label>
							<Form.Control
								type="text"
								required
								placeholder="Enter Service Name"
								value={name}
								onChange={(e) => setName(e.target.value)}
								className="new_form_control"
							/>
						</Form.Group>

						<Row>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>Abbreviation:</Form.Label>
									<Form.Control
										type="text"
										required
										placeholder="Enter Abbreviation"
										value={abbreviation}
										onChange={(e) => setAbbreviation(e.target.value)}
										className="new_form_control"
									/>
								</Form.Group>
							</Col>
							<Col>
								<Form.Group className="mb-3">
									<Form.Label>Price:</Form.Label>
									<Form.Control
										type="number"
										required
										placeholder="Enter Price"
										value={price}
										onChange={(e) => setPrice(e.target.value)}
										className="new_form_control"
									/>
								</Form.Group>
							</Col>
						</Row>

						<Form.Group className="mb-3">
							<Form.Label>Image:</Form.Label>
							<Form.Control
								type="file"
								required
								accept="image/*"
								id="imageInput"
								onChange={handleImageChange}
								multiple
							/>
						</Form.Group>

						{imagePreviews.map((preview, index) => (
							<div
								key={index}
								style={{
									border: "1px solid #ccc",
									borderRadius: "5px",
									padding: "10px",
									marginBottom: "10px",
								}}
							>
								<div style={{ display: "flex", alignItems: "center" }}>
									<img
										src={preview.previewUrl}
										alt={`Preview ${index}`}
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

						<Form.Group className="mb-3">
							<Form.Label>Description:</Form.Label>
							<CKEditor
								editor={ClassicEditor}
								onChange={handleEditorChange}
								config={{
									height: "50%",
								}}
							/>
						</Form.Group>

						<div>
							<Button
								icon="pi pi-check"
								severity="info"
								onClick={handleSubmit}
								disabled={disable}
								style={{
              
									height:"45px",
									padding:"20px",
									borderRadius:"5px"
								  }}
							>
								{disable ? "Saving...." : "Save"}
							</Button>
							<Button
								icon="pi pi-times"
								severity="secondary"
								onClick={navigateToService}
								style={{
									marginLeft: "10px",
									marginTop: "10px",
									height:"45px",
									padding:"20px",
									borderRadius:"5px"
								  }}
							>
								Cancel
							</Button>
						</div>
					</Form>
				</div>
			</Card>
		</Box>
	);
};

export default AddService;
