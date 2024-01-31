import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { Form, Input, Upload, Space } from "antd";
import "./Service.css";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../../services/Host";
import {
  GetServiceById,
  UpdateService,
} from "../../../services/Api/ServiceApi";
import { PlusOutlined } from "@ant-design/icons";
import { Modal } from "antd";

const getBase64 = (file) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    reader.onload = () => resolve(reader.result);
    reader.onerror = (error) => reject(error);
  });

const EditService = () => {
  const [previewOpen, setPreviewOpen] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");
  const [fileList, setFileList] = useState([]);
  const handleCancel = () => setPreviewOpen(false);
  const handlePreview = async (file) => {
    if (!file.url && !file.preview) {
      file.preview = await getBase64(file.originFileObj);
    }
    setPreviewImage(file.url || file.preview);
    setPreviewOpen(true);
    setPreviewTitle(
      file.name || file.url.substring(file.url.lastIndexOf("/") + 1)
    );
  };
  const handleChange = ({ fileList: newFileList }) => setFileList(newFileList);
  const uploadButton = (
    <button
      style={{
        border: 0,
        background: "none",
      }}
      type="button"
    >
      <PlusOutlined />
      <div
        style={{
          marginTop: 8,
        }}
      >
        Upload
      </div>
    </button>
  );
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);

  useLayoutEffect(() => {
    GetServiceById(id)
      .then((res) => {
        setServiceData(res.data.data);
        console.log("servicebyid=>", res.data.data);

        // Update fileList with images from API
        const apiImages = res.data.data.service_attachments.map(
          (attachment) => ({
            uid: attachment.id.toString(),
            name: attachment.file_name,
            status: "done",
            url: `${BASE_URL_IMAGE}${attachment.file_name}`,
          })
        );

        setFileList(apiImages);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

  const handleImageChange = (e) => {
    if (e.target.files.length) {
      const newImage = {
        uid: Date.now(),
        name: e.target.files[0].name,
        status: "done",
        url: URL.createObjectURL(e.target.files[0]),
      };

      setFileList([...fileList, newImage]);

      // Check if serviceData is not null or undefined before updating it
      if (serviceData) {
        setServiceData({ ...serviceData, image: e.target.files[0] });
      }
    }
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
    if (serviceData.image) {
      formData.append("images", serviceData.image);
    }

    UpdateService(id, formData)
      .then((res) => {
        if (res.status === 200) {
          // toast.success("Role edited successfully!");
        }
        navigate("/services");
      })
      .catch((err) => {
        if (err.response && err.response.status === 401) {
          // toast.error("Token expired!");
          localStorage.removeItem("adminToken");
          setTimeout(() => {
            navigate("/Login");
          }, 3000);
        } else {
          // toast.error("Something went wrong");
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
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          style={{ width: "1745px" }}
          layout="vertical"
        >
          <Form.Item label="Service Name:">
            <Input
              style={{ color: "black", height: "40px" }}
              value={serviceData?.name}
              onChange={(e) => onChange(e)}
              name="name"
            />
          </Form.Item>
          <Form.Item
            label="Upload Image:"
            name="images"
            valuePropName="fileList"
            getValueFromEvent={handleImageChange}
          >
            <Upload
              action="https://run.mocky.io/v3/435e224c-44fb-4773-9faf-380c5e6a2188"
              listType="picture-card"
              fileList={fileList}
              onPreview={handlePreview}
              onChange={handleImageChange} 
            >
              {fileList.length >= 8 ? null : uploadButton}
            </Upload>
            <Modal
              open={previewOpen}
              title={previewTitle}
              footer={null}
              onCancel={handleCancel}
            >
              <img
                alt="example"
                style={{
                  width: "100%",
                }}
                src={previewImage}
                crossOrigin="anonymous"
              />
            </Modal>
          </Form.Item>

          <Form.Item label="Description:" name="description">
            <Editor
              apiKey="984sn99khgad1wgf4btfw7jil4n458arpqkfgqgxc550lb9m"
              initialValue={serviceData?.description}
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
                setServiceData({ ...serviceData, description: newContent });
              }}
              onChange={(e) => onChange(e)}
            />
          </Form.Item>

          <Form.Item>
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
          </Form.Item>
        </Form>
      </Card>
    </Box>
  );
};

export default EditService;
