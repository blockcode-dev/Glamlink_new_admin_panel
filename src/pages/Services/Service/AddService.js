import React, { useState } from "react";
import { Box } from "@mui/material";
import { Button } from "primereact/button";
import Form from "react-bootstrap/Form";
import { CreateSerice } from "../../../services/Api/ServiceApi";
import { useNavigate } from "react-router-dom";
import "./Service.css";
import { Card } from "primereact/card";
import imageCompression from "browser-image-compression";
import { Editor } from "@tinymce/tinymce-react";
import { Upload, Space } from "antd";

const AddService = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"]; // Add more allowed types if needed

      if (!allowedTypes.includes(file.type)) {
        console.error("Error: Invalid file type. Images (JPEG, JPG,PNG) only!");
        return;
      }

      if (file.size <= 1024 * 1024) {
        // If image size is less than or equal to 1 MB, no need to compress
        setImages(file);
        const reader = new FileReader();
        reader.onloadend = () => {
          setImagePreview(reader.result);
        };
        reader.readAsDataURL(file);
      } else {
        // Compress the image to 25% if its size is more than 1 MB
        try {
          const compressedFile = await imageCompression(file, {
            maxSizeMB: 1,
            maxWidthOrHeight: 1920,
          });

          // Check if compression actually reduced the size
          if (compressedFile.size < file.size) {
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result);
              setImages(new Blob([compressedFile], { type: "image/jpeg" }));
            };
            reader.readAsDataURL(compressedFile);
          } else {
            // If compression did not reduce the size, use the original image
            setImages(file);
            const reader = new FileReader();
            reader.onloadend = () => {
              setImagePreview(reader.result);
            };
            reader.readAsDataURL(file);
          }
        } catch (error) {
          console.error("Error compressing image:", error);
        }
      }
    }
  };
  const handleRemoveImage = (e) => {
    e.preventDefault();
    setImages(null);
    setImagePreview(null);

    // Clear the file input value
    const fileInput = document.getElementById("imageInput");
    if (fileInput) {
      fileInput.value = null;
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    try {
      const formData = new FormData();
      formData.append("name", name);
      formData.append("description", description);
      formData.append("images", images);

      const response = await CreateSerice(formData);

      if (response.status === 200) {
      }
      navigate("/services");
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.removeItem("adminToken");
        setTimeout(() => {
          navigate("/Login");
        }, 1000);
      } else {
      }
    }
  };

  const navigateToService = () => {
    navigate("/services");
  };

  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">About Service</h3>
        <p className="page-sub-title">Add new Service</p>
      </Box>
      <Card>
        <div>
          <Form>
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

            <Form.Group className="mb-3">
              <Form.Label>Upload Image:</Form.Label>
              <br />
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <Upload
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                  listType="picture"
                  maxCount={1}
                >
                  <Button
                    label=" Click to Upload"
                    severity="secondary"
                    outlined
                    icon="pi pi-upload"
                    style={{
                      borderRadius: "5px",
                      margin: "0px 0px",
                      height: "36px",
                    }}
                  ></Button>
                </Upload>
              </Space>
            </Form.Group>

            <Form.Group className="mb-3">
              <Form.Label>Description:</Form.Label>
              <br />
              <Editor
                apiKey="mibv7kc74dumv3uazcc6tu9xu601iqybxjb0qnglj1fn1258"
                value={description}
                init={{
                  plugins: "table tableofcontents",
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                  tinycomments_mode: "embedded",
                  tinycomments_author: "Author name",

                  ai_request: (request, respondWith) =>
                    respondWith.string(() =>
                      Promise.reject("See docs to implement AI Assistant")
                    ),
                }}
                onEditorChange={(newContent, editor) => {
                  setDescription(newContent);
                }}
              />
            </Form.Group>

            <div className="saving_buttons">
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
                onClick={(e) => {
                  navigateToService();
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
    </Box>
  );
};

export default AddService;
