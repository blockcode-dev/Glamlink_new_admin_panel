import React, { useEffect, useLayoutEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { Box } from "@mui/material";
import { Card } from "antd";
import { Form, Input, Row, Col } from "antd";
import "./GuestBooking.css";
import { Button } from "primereact/button";
import { BASE_URL_IMAGE } from "../../../services/Host";
import { GetGuestBookingById } from "../../../services/Api/BookingApi";

const ViewGuesBooking = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [componentDisabled, setComponentDisabled] = useState(true);
  const [bookingData, setBookingData] = useState(null);

  useLayoutEffect(() => {
    GetGuestBookingById(id)
      .then((res) => {
        setBookingData(res.data.data);
        console.log("GetGuestBookingById=>", res.data.data);
      })
      .catch((err) => {
        console.log(err, "error");
      });
  }, [id]);

  const navigateToBooking = () => {
    navigate("/guestBookings");
  };
  return (
    <Box>
      <Box style={{ marginBottom: "30px" }}>
        <h3 className="page-title">About Guest Booking</h3>
        <p className="page-sub-title">Details of Guest Booking</p>
      </Box>
      <Card style={{ width: "100%" }}>
        <Form
          labelCol={{ span: 4 }}
          wrapperCol={{ span: 14 }}
          disabled={componentDisabled}
          style={{ width: "1745px" }}
          layout="vertical"
        >
          <Row>
            <Col>
              <Form.Item label="Name:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.name}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label=" Email:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.email}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Item label=" Service Name:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.service_guest_booking?.name}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label=" Service Date:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.date.split("T")[0]}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label="Pickup Location:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.pickup_location}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Destination Location:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.destination_location}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label="Service Timing:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.time}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Contact Number:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.contact_number}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
          </Row>
          <Row>
            <Col>
              <Form.Item label="Booking Status:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.booking_status}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Booking Id:">
                <Input
                  style={{ color: "black", height: "40px" }}
                  value={bookingData?.booking_id}
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
          </Row>

          <Row>
            <Col>
              <Form.Item label="Driver Name:">
                <Input
                  style={{
                    color: bookingData?.guest_booking_user ? "black" : "green",
                    fontWeight: bookingData?.guest_booking_user
                      ? "normal"
                      : "bold",
                    height: "40px",
                  }}
                  value={
                    bookingData?.guest_booking_user?.user_profile?.name ||
                    "No driver assigned till now"
                  }
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
            <Col>
              <Form.Item label="Driver Email:">
                <Input
                  style={{
                    color: bookingData?.guest_booking_user ? "black" : "green",
                    fontWeight: bookingData?.guest_booking_user
                      ? "normal"
                      : "bold",
                    height: "40px",
                  }}
                  value={
                    bookingData?.guest_booking_user?.email ||
                    "No driver assigned till now"
                  }
                  className="view_booking_heading"
                />
              </Form.Item>
            </Col>
          </Row>

          {/* <Form.Item label="Images:">
            <Row gutter={[16, 16]}>
              {bookingData?.service_attachments.map((attachment, index) => (
                <Col key={index} span={6}>
                  <img
                    crossOrigin="anonymous"
                    src={`${BASE_URL_IMAGE}${attachment.file_name}`}
                    alt={`Service graphic ${index + 1}`}
                    style={{ height: "150px", width: "150px" ,borderRadius:"10px" }}
                  />
                </Col>
              ))}
            </Row>
          </Form.Item> */}

          <div>
            <Button
              icon="pi pi-arrow-left"
              severity="secondary"
              onClick={(e) => {
                navigateToBooking();
              }}
              style={{ borderRadius: "5px", height: "40px" }}
            >
              <span style={{ marginLeft: "5px" }}>
                {" "}
                Return to Guest Bookings
              </span>
            </Button>
          </div>
        </Form>
      </Card>
    </Box>
  );
};

export default ViewGuesBooking;
