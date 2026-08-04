import React, { useState } from "react";
import { Button, Card, DatePicker, Form, Input, message } from "antd";

import { Box } from "@material-ui/core";
import { useNavigate } from "react-router-dom";
import dayjs from "dayjs";
import { CreatePodcastSchedule } from "../../services/Api/PodcastScheduleApi";

const { TextArea } = Input;

const AddPodcastSchedule = () => {
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();

  const onFinish = async (values) => {
    try {
      setLoading(true);

      const payload = {
        name: values.name,
        short_description: values.short_description,
        schedule_date: values.schedule_date.format("YYYY-MM-DD"),
      };

      await CreatePodcastSchedule(payload, localStorage.getItem("adminToken"));

      message.success("Podcast schedule created successfully");

      navigate("/podcast-schedule");
    } catch (err) {
      message.error("Failed to create schedule");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box>
      <Card
        title="Add Podcast Schedule"
        extra={
          <Button onClick={() => navigate("/podcast-schedule")}>
            ← Back to Podcast Schedule
          </Button>
        }
      >
        <Form layout="vertical" onFinish={onFinish}>
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
            Create Schedule
          </Button>
        </Form>
      </Card>
    </Box>
  );
};

export default AddPodcastSchedule;
