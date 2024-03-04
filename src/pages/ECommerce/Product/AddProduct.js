import React, { useState } from "react";
import { Box } from "@mui/material";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { message } from "antd";
import { CreateProduct } from "../../../services/Api/ProductApi";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "./Product.css";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import DeleteIcon from "@mui/icons-material/Delete";
import Form from "react-bootstrap/Form";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("");
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

  const handleSubmit = async (event) => {
    event.preventDefault();
    setDisable(true);
    if (!name) {
      message.error("Please enter Product Name");
      setDisable(false);
      return;
    }
    if (!description) {
      message.error("Please enter description");
      setDisable(false);
      return;
    }
    if (!price) {
      message.error("Please enter Price");
      setDisable(false);
      return;
    }
    if (!stock) {
      message.error("Please enter stock");
      setDisable(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("price", price);
      formData.append("weight", weight);
      formData.append("size", size);
      formData.append("stock", stock);
      if (images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images`, image, `compressed_image_${index}.jpg`);
        });
      }

      const response = await CreateProduct(formData);

      if (response.status === 201) {
        message.success("Product addedd successfully!");
      }
      navigate("/productList");
      setDisable(false);
    } catch (error) {
      if (error.response.status === 401) {
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

  const handleEditorChange = (event, editor) => {
    const data = editor.getData();
    setDescription(data);
  };

  const navigateToProduct = () => {
    navigate("/productList");
  };

  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">Create Product</h3>
        <p className="page-sub-title">Add new Product</p>
      </Box>
      <Form onSubmit={handleSubmit}>
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Card
            className="service_card"
            style={{ width: "50%", marginRight: "20px", borderRadius: "0px" }}
          >
            <div>
              <Form.Group className="mb-3">
                <Form.Label> Product Name:</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Please enter your Product Name!"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="new_form_control"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label> Product Description:</Form.Label>

                <CKEditor
                  editor={ClassicEditor}
                  onChange={handleEditorChange}
                  config={{
                    height: "1000px",
                  }}
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label> Price:</Form.Label>
                <Form.Control
                  type="number"
                  required
                  placeholder="Please enter your Price!"
                  value={price}
                  onChange={(event) => setPrice(event.target.value)}
                  className="new_form_control"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label> Quantity:</Form.Label>
                <Form.Control
                  type="number"
                  required
                  placeholder="Please enter your Stock!"
                  value={stock}
                  onChange={(event) => setStock(event.target.value)}
                  className="new_form_control"
                />
              </Form.Group>

              {/* <Form.Group className="mb-3">
                <Form.Label> Weight:</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Please enter your Weight!"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  className="new_form_control"
                />
              </Form.Group>

              <Form.Group className="mb-3">
                <Form.Label> Size:</Form.Label>
                <Form.Control
                  type="text"
                  required
                  placeholder="Please enter your Size!"
                  value={size}
                  onChange={(e) => setSize(e.target.value)}
                  className="new_form_control"
                />
              </Form.Group> */}
            </div>
          </Card>
          <Card
            style={{ position: "relative", width: "50%", borderRadius: "0px" }}
          >
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

            <div
              style={{
                position: "absolute",
                bottom: "0",
                right: "0",
                marginBottom: "16px",
                marginRight: "16px",
              }}
            >
              <Button
                icon="pi pi-check"
                severity="success"
                htmlType="submit"
                onClick={handleSubmit}
                disabled={disable}
                style={{
                  borderRadius: "5px",
                  margin: "0px 0px",
                  height: "40px",
                }}
              >
                {disable ? "Saving...." : "Save"}
              </Button>

              <Button
                icon="pi pi-times"
                severity="secondary"
                onClick={navigateToProduct}
                style={{
                  borderRadius: "5px",
                  marginLeft: "10px",
                  height: "40px",
                }}
              >
                Cancel
              </Button>
            </div>
          </Card>
        </div>
      </Form>
    </Box>
  );
};
export default AddProduct;
