import React, { useState } from "react";
import { CKEditor } from "@ckeditor/ckeditor5-react";
import ClassicEditor from "@ckeditor/ckeditor5-build-classic";
import { Card } from "primereact/card";
import { Button } from "primereact/button";
import Form from "react-bootstrap/Form";
import { CreateBlog } from "../../services/Api/BlogsApi";
import { useNavigate } from "react-router";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import imageCompression from "browser-image-compression";
import { message } from "antd";
import DeleteIcon from '@mui/icons-material/Delete';


const AddBlog = () => {
  const navigate = useNavigate();
  const [heading, setHeading] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [disable, setDisable] = useState(false);

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

    if (!heading) {
      toast.error("Please enter heading");
      setDisable(false);
      return;
    }
    if (!description) {
      toast.error("Please enter description");
      setDisable(false);
      return;
    }
    try {
      const formData = new FormData();
      formData.append("heading", heading);
      formData.append("description", description);
      if (images.length > 0) {
        images.forEach((image, index) => {
          formData.append(`images`, image, `compressed_image_${index}.jpg`);
        });
      }

      const response = await CreateBlog(formData);

      if (response.status === 201) {
        message.success("Blog addedd successfully!");
      }
      navigate("/blogs");
      setDisable(false);
    } catch (error) {
      if (error.response.status === 400) {
        message.error("Blog with this title already exist");
      } else if (error.response.status === 401) {
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

  const navigateToBlogs = () => {
    navigate("/blogs");
  };

  return (
    <div>
      <h3 className="page-title">Create Blog</h3>
      <p className="page-sub-title">Add new Blog</p>

      <Card>
        <div>
          <Form onSubmit={handleSubmit}>
            <Form.Group className="mb-3">
              <Form.Label> Heading:</Form.Label>
              <Form.Control
                type="text"
                required
                placeholder="Enter Blog heading"
                value={heading}
                onChange={(e) => setHeading(e.target.value)}
                className="new_form_control"
              />
            </Form.Group>
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
              <Form.Label> Blog's Description:</Form.Label>

              <CKEditor
                editor={ClassicEditor}
                onChange={handleEditorChange}
                config={{
                  height: "1000px",
                }}
              />
            </Form.Group>

            <div>
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
                onClick={(e) => {
                  navigateToBlogs();
                }}
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
    </div>
  );
};

export default AddBlog;
