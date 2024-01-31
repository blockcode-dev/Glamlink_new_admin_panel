import React, { useState } from "react";
import { Box } from "@mui/material";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Editor } from "@tinymce/tinymce-react";
import { Upload, Space, Form, Input } from "antd";
import { CreateSerice } from "../../../services/Api/ServiceApi";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "./Service.css";

const AddService = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const navigate = useNavigate();

  const handleImageChange = async (e) => {
    const file = e.target.files[0];

    if (file) {
      const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];

      if (!allowedTypes.includes(file.type)) {
        console.error("Error: Invalid file type. Images (JPEG, JPG,PNG) only!");
        return;
      }

      if (file.size <= 1024 * 1024) {
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

  const handleSubmit = async (event) => {
    // event.preventDefault();

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
        <h3 className="page-title">Create Service</h3>
        <p className="page-sub-title">Add new Service</p>
      </Box>
      <Card className="service_card">
        <div>
          <Form
            style={{ width: "98%" }}
            onFinish={handleSubmit}
            layout="vertical"
          >
            <Form.Item
              label="Service Name"
              name="username"
              rules={[
                { required: true, message: "Please input your Service Name!" },
              ]}
            >
              <Input style={{height:"40px"}} onChange={(e) => setName(e.target.value)} />
            </Form.Item>

            <Form.Item

              label="Upload Image"
              name="images"
              valuePropName="fileList"
              getValueFromEvent={handleImageChange}
              rules={[
                { required: true, message: "Please input your Service Name!" },
              ]}
            >
              <Space
                direction="vertical"
                style={{ width: "100%" }}
                size="large"
              >
                <Upload
                  action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
                  listType="picture"
                  maxCount={3}
                  multiple
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
            </Form.Item>

            <Form.Item
              label="Description"
              name="description"
              rules={[
                { required: true, message: "Please input the description!" },
              ]}
            >
              <Editor
                apiKey="984sn99khgad1wgf4btfw7jil4n458arpqkfgqgxc550lb9m"
                value={description}
                init={{
                  plugins:
                    "ai tinycomments mentions anchor autolink charmap codesample emoticons image link lists media searchreplace table visualblocks wordcount checklist mediaembed casechange export formatpainter pageembed permanentpen footnotes advtemplate advtable advcode editimage tableofcontents mergetags powerpaste tinymcespellchecker autocorrect a11ychecker typography inlinecss",
                  toolbar:
                    "undo redo | blocks fontfamily fontsize | bold italic underline strikethrough | link image media table mergetags | align lineheight | tinycomments | checklist numlist bullist indent outdent | emoticons charmap | removeformat",
                  tinycomments_mode: "embedded",
                  tinycomments_author: "Author name",
                  mergetags_list: [
                    { value: "First.Name", title: "First Name" },
                    { value: "Email", title: "Email" },
                  ],
                  ai_request: (request, respondWith) =>
                    respondWith.string(() =>
                      Promise.reject("See docs to implement AI Assistant")
                    ),
                }}
                onEditorChange={(newContent, editor) => {
                  setDescription(newContent);
                }}
              />
            </Form.Item>

            <Form.Item >
              <Button
                icon="pi pi-check"
                severity="success"
                htmlType="submit"
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
            </Form.Item>
          </Form>
        </div>
      </Card>
    </Box>
  );
};

export default AddService;
