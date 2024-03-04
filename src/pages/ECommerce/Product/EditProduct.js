import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { message } from "antd";
import "./Product.css";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../../services/Host";
import Form from "react-bootstrap/Form";
import { Row, Col } from "react-bootstrap";
import DeleteIcon from "@mui/icons-material/Delete";
import {
  GetProductById,
  UpdateProduct,
} from "../../../services/Api/ProductApi";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";

const EditProduct = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);
  const [productData, setProductData] = useState({
    name: "",
    description: "",
    product_attachments: [],
    price: "",
    weight: "",
    stock: "",
    size: "",
  });

  useLayoutEffect(() => {
    GetProductById(id)
      .then((res) => {
        setProductData(res.data.data);

        if (
          res.data.data.product_attachments &&
          res.data.data.product_attachments.length > 0
        ) {
          const previews = res.data.data.product_attachments.map(
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
    setProductData((prevData) => ({
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
    const removedImage = productData.product_attachments[index];
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
    setProductData({ ...productData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append("name", productData?.name ? productData?.name : "");
    formData.append("price", productData?.price ? productData?.price : "");
    formData.append("weight", productData?.weight ? productData?.weight : "");
    formData.append("stock", productData?.stock ? productData?.stock : "");
    formData.append("size", productData?.size ? productData?.size : "");
    formData.append("description", productData.description || "");

    images.forEach((image, index) => {
      formData.append("images", image);
    });

    // Append removeImageIds to formData
    removeImageIds.forEach((id) => {
      formData.append("removeImageIds", id);
    });

    UpdateProduct(id, formData)
      .then((res) => {
        if (res.status === 200) {
          message.success("Product updated successfully!");
        }
        navigate("/productList");
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          message.error("Token expired!");
          localStorage.removeItem("adminToken");
          setTimeout(() => {
            navigate("/Login");
          }, 3000);
        } else {
          message.error("Something went wrong");
        }
      });
  };

  const navigateToService = () => {
    navigate("/productList");
  };

  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">Update Product</h3>
        <p className="page-sub-title">Edit Details of Product</p>
      </Box>
      <Card style={{ width: "100%" }}>
        <Form>
          <Form.Group className="mb-3">
            <Form.Label>Product Name::</Form.Label>
            <Form.Control
              name="name"
              defaultValue={productData?.name}
              type="text"
              onChange={(e) => onChange(e)}
            />
          </Form.Group>
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
                    marginTop: "10px",
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

          <Form.Group className="mb-3">
            <Form.Label>Product Description:</Form.Label>
            <CKEditor
              data={productData?.description}
              editor={ClassicEditor}
              onChange={handleEditorChange}
              config={{
                height: "50%",
              }}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Price:</Form.Label>
            <Form.Control
              name="price"
              defaultValue={productData?.price}
              type="price"
              onChange={(e) => onChange(e)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Quantity:</Form.Label>
            <Form.Control
              name="stock"
              defaultValue={productData?.stock}
              type="number"
              onChange={(e) => onChange(e)}
            />
          </Form.Group>

          {/* <Form.Group className="mb-3">
            <Form.Label>Size:</Form.Label>
            <Form.Control
              name="size"
              defaultValue={productData?.size}
              type="size"
              onChange={(e) => onChange(e)}
            />
          </Form.Group>

          <Form.Group className="mb-3">
            <Form.Label>Weight:</Form.Label>
            <Form.Control
              name="weight"
              defaultValue={productData?.weight}
              type="text"
              onChange={(e) => onChange(e)}
            />
          </Form.Group> */}

          <div>
            <Button
              icon="pi pi-check"
              severity="success"
              htmlType="submit"
              onClick={handleSubmit}
              style={{
                borderRadius: "5px",
                margin: "0px 0px",
                height: "40px",
              }}
            >
              Save
            </Button>

            <Button
              icon="pi pi-times"
              severity="secondary"
              onClick={navigateToService}
              style={{
                borderRadius: "5px",
                marginLeft: "10px",
                height: "40px",
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

export default EditProduct;
