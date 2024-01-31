import React, { useState } from "react";
import { Box } from "@mui/material";
import { Button } from "primereact/button";
import { Card } from "primereact/card";
import { Editor } from "@tinymce/tinymce-react";
import { Upload, Space, Form, Input, message, InputNumber } from "antd";
import { CreateProduct } from "../../../services/Api/ProductApi";
import { useNavigate } from "react-router-dom";
import imageCompression from "browser-image-compression";
import "./Product.css";
import { InboxOutlined } from "@ant-design/icons";

const AddProduct = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [weight, setWeight] = useState("");
  const [size, setSize] = useState("");
  const [stock, setStock] = useState("");
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
      formData.append("price", price);
      formData.append("weight", weight);
      formData.append("size", size);
      formData.append("stock", stock);
      formData.append("images", images);

      const response = await CreateProduct(formData);

      if (response.status === 201) {
        message.success("Product addedd successfully!");
      }
      navigate("/productList");
    } catch (error) {
      if (error.response.status === 401) {
        localStorage.removeItem("adminToken");
        setTimeout(() => {
          navigate("/Login");
        }, 1000);
      } else {
        message.error("Something went wrong");
      }
    }
  };

  const navigateToProduct = () => {
    navigate("/productList");
  };

  const { Dragger } = Upload;
  const props = {
    name: "file",
    multiple: true,
    listType: "picture",
    action: "https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188",
    onChange(info) {
      const { status } = info.file;
      if (status !== "uploading") {
        console.log(info.file, info.fileList);
      }
      if (status === "done") {
        message.success(`${info.file.name} file uploaded successfully.`);
      } else if (status === "error") {
        message.error(`${info.file.name} file upload failed.`);
      }
    },
    onDrop(e) {
      console.log("Dropped files", e.dataTransfer.files);
    },
  };

  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">Create Product</h3>
        <p className="page-sub-title">Add new Product</p>
      </Box>
      <Form style={{ width: "98%" }} onFinish={handleSubmit} layout="vertical">
        <div style={{ display: "flex", flexDirection: "row" }}>
          <Card
            className="service_card"
            style={{ width: "50%", marginRight: "20px", borderRadius: "0px" }}
          >
            <div>
              <Form.Item
                label="Product Name:"
                name="name"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Product Name!",
                  },
                ]}
              >
                <Input
                  style={{ height: "40px" }}
                  onChange={(e) => setName(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label=" Product Summary:"
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

              <Form.Item
                label="Price:"
                name="price"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Price!",
                  },
                ]}
              >
                <InputNumber
                  style={{ height: "40px", width: "-webkit-fill-available" }}
                  onChange={(value) => setPrice(value)}
                />
              </Form.Item>

              <Form.Item
                label="Stock:"
                name="stock"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Stock!",
                  },
                ]}
              >
                <InputNumber
                  style={{ height: "40px", width: "-webkit-fill-available" }}
                  onChange={(value) => setStock(value)}
                />
              </Form.Item>

              <Form.Item
                label="Weight:"
                name="weight"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Weight!",
                  },
                ]}
              >
                <Input
                  style={{ height: "40px" }}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Form.Item>

              <Form.Item
                label="Size:"
                name="size"
                rules={[
                  {
                    required: true,
                    message: "Please enter your Size!",
                  },
                ]}
              >
                <Input
                  style={{ height: "40px" }}
                  onChange={(e) => setSize(e.target.value)}
                />
              </Form.Item>
            </div>
          </Card>
          <Card
            style={{ position: "relative", width: "50%", borderRadius: "0px" }}
          >
            <Form.Item
              label="Upload Image"
              name="images"
              valuePropName="fileList"
              getValueFromEvent={handleImageChange}
              // rules={[
              //   {
              //     required: true,
              //     message: "Please input Images!",
              //   },
              // ]}
            >
              <Dragger {...props}>
                <p className="ant-upload-drag-icon">
                  <InboxOutlined />
                </p>
                <p className="ant-upload-text">
                  Click or drag file to this area to upload
                </p>
                <p className="ant-upload-hint">
                  Support for a single or bulk upload. Strictly prohibited from
                  uploading company data or other banned files.
                </p>
              </Dragger>
            </Form.Item>

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
