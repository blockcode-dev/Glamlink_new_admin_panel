import React, { useEffect, useState } from "react";
import { Button, Card, DatePicker, Form, Input, message } from "antd";
import { Box } from "@material-ui/core";
import { useNavigate, useParams } from "react-router-dom";
import dayjs from "dayjs";
import {
  GetPodcastScheduleById,
  UpdatePodcastSchedule,
} from "../../services/Api/PodcastScheduleApi";

const { TextArea } = Input;

const EditPodcastSchedule = () => {
  const [loading, setLoading] = useState(false);

  const [form] = Form.useForm();

  const navigate = useNavigate();

  const { id } = useParams();

  const getDetails = async () => {
    try {
      const result = await GetPodcastScheduleById(id);

      console.log(result, "result");

      const data = result.data.data;

      form.setFieldsValue({
        name: data.name,
        short_description: data.short_description,
        schedule_date: dayjs(data.schedule_date),
      });
    } catch (err) {
      message.error("Failed to load schedule");
    }
  };

  useEffect(() => {
    getDetails();
  }, []);

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name,
        short_description: values.short_description,
        schedule_date: values.schedule_date.format("YYYY-MM-DD"),
      };

      await UpdatePodcastSchedule(
        id,
        payload,
        localStorage.getItem("adminToken"),
      );

      message.success("Podcast schedule updated successfully");

      navigate("/podcast-schedule");
    } catch (err) {
      message.error("Failed to update schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card
        title="Edit Podcast Schedule"
        extra={
          <Button onClick={() => navigate("/podcast-schedule")}>
            ← Back to Podcast Schedule
          </Button>
        }
      >
        <Form form={form} layout="vertical" onFinish={onFinish}>
          <Form.Item
            label="Guest Name"
            name="name"
            rules={[
              {
                required: true,
                message: "Please enter guest name",
              },
            ]}
          >
            <Input placeholder="Enter guest name" />
          </Form.Item>

          <Form.Item label="Short Description" name="short_description">
            <TextArea rows={4} placeholder="Enter description" />
          </Form.Item>

          <Form.Item
            label="Schedule Date"
            name="schedule_date"
            rules={[
              {
                required: true,
                message: "Please select schedule date",
              },
            ]}
          >
            <DatePicker style={{ width: "100%" }} />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={loading}>
            Update Schedule
          </Button>
        </Form>
      </Card>
    </Box>
  );
};

export default EditPodcastSchedule;
