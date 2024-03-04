import React, { useLayoutEffect, useState } from "react";
import { Button } from "primereact/button";
import { Box } from "@mui/material";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { useNavigate, useParams } from "react-router-dom";
import Form from "react-bootstrap/Form";
import { Row, Col } from "react-bootstrap";
import CloseIcon from "@mui/icons-material/Close";
import { GetBlogById, UpdateBlog } from "../../services/Api/BlogsApi";
import { BASE_URL_IMAGE } from "../../services/Host";
import { Card } from "primereact/card";
import { message } from "antd";
import DeleteIcon from "@mui/icons-material/Delete";

const EditBlog = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [blogData, setBlogData] = useState({
    heading: "",
    description: "",
    blog_attachments: [],
  });
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [removeImageIds, setRemoveImageIds] = useState([]);

  useLayoutEffect(() => {
    GetBlogById(id)
      .then((res) => {
        setBlogData(res.data.data);

        if (
          res.data.data.blog_attachments &&
          res.data.data.blog_attachments.length > 0
        ) {
          const previews = res.data.data.blog_attachments.map(
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
    setBlogData((prevData) => ({
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
    const removedImage = blogData.blog_attachments[index];
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

  const handleSubmit = (e) => {
    e.preventDefault();

    const formData = new FormData();
    // formData.append("blog_id", id);
    formData.append("heading", blogData.heading || "");
    formData.append("description", blogData.description || "");

    images.forEach((image, index) => {
      formData.append("images", image);
    });

    // Append removeImageIds to formData
    removeImageIds.forEach((id) => {
      formData.append("removeImageIds", id);
    });

    UpdateBlog(id, formData)
      .then((res) => {
        console.log("UpdateBlog", res, UpdateBlog);
        if (res.status === 200) {
          message.success("Blog edited successfully!");
        }
        navigate("/blogs");
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

  return (
    <Box m="20px">
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <h3 style={{ marginTop: "5px", marginBottom: "30px" }}>Edit Blog</h3>
      </Box>

      <Card>
        <div>
          <Form>
            <Row>
              <Form.Group className="mb-3">
                <Form.Label>Blog's Heading:</Form.Label>
                <Form.Control
                  name="heading"
                  defaultValue={blogData.heading}
                  type="text"
                  onChange={(e) =>
                    setBlogData({
                      ...blogData,
                      heading: e.target.value,
                    })
                  }
                />
              </Form.Group>
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

            <Row>
              <Form.Group className="mb-3">
                <Form.Label>Blog's Content:</Form.Label>
                <CKEditor
                  editor={ClassicEditor}
                  onChange={handleEditorChange}
                  data={blogData.description}
                  config={{
                    height: "1000px",
                  }}
                />
              </Form.Group>
            </Row>

            <div>
              <Button
                icon="pi pi-check"
                severity="success"
                type="submit"
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
                onClick={() => navigate("/blogs")}
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
        </div>
      </Card>
    </Box>
  );
};

export default EditBlog;
