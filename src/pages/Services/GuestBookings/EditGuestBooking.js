import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { Form, Input, Row, Col } from "antd";
import "./GuestBooking.css";
import { Button } from "primereact/button";
import { Select, DatePicker, TimePicker, message, Spin } from "antd";
import { GetAllDriver } from "../../../services/Api/Api";
import {
  GetGuestBookingById,
  UpdateGuestBooking,
} from "../../../services/Api/BookingApi";
import moment from "moment";

const EditGuestBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [driverList, setDriverList] = useState([]);
  const [bookingData, setBookingData] = useState(null);
  const [selectedTime, setSelectedTime] = useState(null);
  const [saving, setSaving] = useState(false);

  const [form] = Form.useForm();
  const dateFormat = "YYYY/MM/DD";

  //get drivers name
  const getDriversList = async () => {
    let res = await GetAllDriver();
    if (res?.status === 200) {
      setDriverList(res?.data?.data);
      console.log("driver names=>", res.data.data);
    } else {
    }
  };

  useEffect(() => {
    getDriversList();
  }, []);

  //get booking by id
  useLayoutEffect(() => {
    GetGuestBookingById(id)
      .then((res) => {
        setBookingData(res.data.data);

        form.setFieldsValue(res?.data?.data);

        form.setFieldValue(
          "service_name",
          res?.data?.data?.service_guest_booking?.name
        );
        console.log("GetGuestBookingById=>", res.data.data);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

  const handleTimeChange = (time, timeString) => {
    const isValidTime = moment(timeString, "HH:mm:ss", true).isValid();

    if (isValidTime) {
      // Time is valid, update the state
      setSelectedTime(time);
      setBookingData({
        ...bookingData,
        time: timeString,
      });
    } else {
      // Time is invalid, show a message and set a default time
      message.error("Invalid time entered. Setting default time.");
      setSelectedTime(moment("12:00:00", "HH:mm:ss"));
      setBookingData({
        ...bookingData,
        time: "12:00:00",
      });
    }
  };

  const onDateChange = (date, dateString) => {
    setBookingData({
      ...bookingData,
      date: dateString,
    });
  };

  const onFinish = (values) => {
    console.log("Success:", values);
  };

  const handleDriverChange = (value) => {
    // Find the selected driver by name
    const selectedDriver = driverList.find(
      (driver) => driver.user_profile?.name === value
    );

    setBookingData({
      ...bookingData,
      driver_id: selectedDriver ? selectedDriver.id : null,
    });
  };

  const handleChange = (value) => {
    // Update the bookingData state with the selected value
    setBookingData({
      ...bookingData,
      booking_status: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    setSaving(true);
    const formData = new FormData();
    formData.append("booking_id", bookingData?.id ? bookingData?.id : "");
    formData.append(
      "driver_id",
      bookingData?.driver_id ? bookingData?.driver_id : ""
    );
    formData.append("date", bookingData?.date ? bookingData?.date : "");
    formData.append("time", bookingData?.time ? bookingData?.time : "");
    formData.append(
      "booking_status",
      bookingData?.booking_status ? bookingData?.booking_status : ""
    );

    UpdateGuestBooking(formData)
      .then((res) => {
        if (res.status === 201) {
          message.success("Booking updated successfully!");
        }
        navigate("/guestBookings");
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
          setSaving(false);
        }
      });
  };

  const navigateToBooking = () => {
    navigate("/guestBookings");
  };

  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">Update Guest Booking</h3>
        <p style={{ color: "green" }} className="page-sub-title">
          Edit Details of Guest Booking By Providing Driver or changing the
          status
        </p>
      </Box>
      <Card style={{ width: "100%" }}>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          style={{ width: "1745px" }}
          layout="vertical"
          form={form}
          onFinish={onFinish}
        >
          <Row>
            <Col>
              <Form.Item name={"name"} label="Name:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  disabled
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label=" Email:" name={"email"}>
                <Input
                  style={{ color: "black", height: "40px" }}
                  className="view_booking_heading"
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label=" Service Name:" name={"service_name"}>
                <Input
                  style={{ color: "black", height: "40px" }}
                  //   value={bookingData?.service_guest_booking?.name}
                  className="view_booking_heading"
                  disabled
                />
              </Form.Item>
            </Col>

            <Col>
              <Form.Item label="Contact Number:" name={"contact_number"}>
                <Input
                  style={{ color: "black", height: "40px" }}
                  className="view_booking_heading"
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label="Pickup Location:" name={"pickup_location"}>
                <Input
                  style={{ color: "black", height: "40px" }}
                  className="view_booking_heading"
                  disabled
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item
                label="Destination Location:"
                name={"destination_location"}
              >
                <Input
                  style={{ color: "black", height: "40px" }}
                  className="view_booking_heading"
                  disabled
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label="Service Time(entered by user):">
                <Input
                  style={{ color: "black", height: "40px" }}
                  className="view_booking_heading"
                  disabled
                  value={bookingData?.time}
                />
              </Form.Item>
            </Col>

            <Col>
              <Form.Item label=" Service Date(entered by user):">
                <Input
                  style={{ color: "black", height: "40px" }}
                  className="view_booking_heading"
                  disabled
                  value={bookingData?.date.split("T")[0]}
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Item
                name={"totaltime"}
                label="Service Time(if you want to change)*:"
              >
                <TimePicker
                  className="view_booking_heading"
                  format="HH:mm:ss"
                  style={{ color: "black", height: "40px" }}
                  onChange={handleTimeChange}
                />
              </Form.Item>
            </Col>

            <Col>
              <Form.Item label=" Service Date(if you want to change)*:">
                <DatePicker
                  style={{ color: "black", height: "40px" }}
                  className="view_booking_heading"
                  format={dateFormat}
                  onChange={onDateChange}
                />
              </Form.Item>
            </Col>
          </Row>

          <Col>
            <Form.Item label="Booking Status:">
              <Select
                value={bookingData?.booking_status}
                style={{
                  width: "100%",
                  color: "black",
                  height: "40px",
                }}
                onChange={handleChange}
                options={[
                  {
                    value: "PENDING",
                    label: "PENDING",
                    disabled: true,
                  },
                  {
                    value: "ACCEPTED",
                    label: "ACCEPTED",
                  },
                  {
                    value: "REJECTED",
                    label: "REJECTED",
                  },
                  {
                    value: "SUCCESS",
                    label: "SUCCESS",
                  },
                ]}
              />
            </Form.Item>
          </Col>

          <Col>
            <Form.Item label="Choose Driver:">
              <Select
                value={bookingData?.guest_booking_user?.user_profile?.name}
                placeholder="Select a driver"
                onChange={handleDriverChange}
                style={{
                  width: "100%",
                  color: "black",
                  height: "40px",
                }}
                options={driverList.map((driver) => ({
                  value: driver.user_profile?.name,
                  label: driver.user_profile?.name,
                }))}
              />
            </Form.Item>
          </Col>

          <Form.Item>
            <Button
              icon="pi pi-check"
              severity="success"
              htmlType="submit"
              type="primary"
              onClick={handleSubmit}
              loading={saving}
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
              onClick={navigateToBooking}
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

export default EditGuestBooking;
