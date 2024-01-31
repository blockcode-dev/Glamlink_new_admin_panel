import React, { useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { Form, Input } from "antd";
import { Editor } from "@tinymce/tinymce-react";
import { Button } from "primereact/button";
import {
  GetServiceById,
  UpdateService,
} from "../../../services/Api/ServiceApi";

const EditTermsAndConditions = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [serviceData, setServiceData] = useState(null);

  useLayoutEffect(() => {
    GetServiceById(id)
      .then((res) => {
        setServiceData(res.data.data);
        console.log("servicebyid=>", res.data.data);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

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
        <h3 className="page-title">Update Terms & Conditions</h3>
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

export default EditTermsAndConditions;
