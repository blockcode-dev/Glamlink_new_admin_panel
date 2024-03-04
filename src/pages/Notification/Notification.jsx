import React, { useEffect } from "react";
import {
  GetNotifications,
  MarkOneNotificationAsRead,
  MarkAllNotificationAsRead,
} from "../../services/Api/NotificationApi";
import { FaTimes } from "react-icons/fa";
import Image from "../../assets/Make the Most Out of Push Notifications.png";
import { Box } from "@mui/material";
import { Avatar, List } from "antd";
import { useNavigate } from "react-router-dom";
import { IoNotificationsCircleSharp } from "react-icons/io5";
import IconButton from "@mui/material/IconButton";
import Tooltip from "@mui/material/Tooltip";
import { Button } from "primereact/button";
import { message } from "antd";
import { BASE_URL_IMAGE } from "../../services/Host";

const Notification = () => {
  const navigate = useNavigate();
  const [notificationData, setNotification] = React.useState([]);

  const getNotifications = async () => {
    try {
      let result = await GetNotifications(localStorage.getItem("adminToken"));
      const notificationsArray = result?.data?.data || [];
      setNotification(notificationsArray);
      console.log("notificationsArray222", notificationsArray);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getNotifications();
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append(
      "notification_id",
      notificationData?.id ? notificationData?.id : ""
    );

    MarkAllNotificationAsRead(formData)
      .then((res) => {
        if (res.status === 200) {
          message.success(" Notification marked as read successfully!");
          // After marking as read, you might want to update the list of notifications
          getNotifications();
        }
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
        }
      });
  };

  const handleClearNotification = async (notificationId) => {
    try {
      const formData = new FormData();
      formData.append("notification_id", notificationId);

      // Mark one notification as read
      const res = await MarkOneNotificationAsRead(formData);

      if (res.status === 200) {
        // Display success message
        message.success("Notification marked as read successfully!");

        // Wait for a short duration to ensure the server has processed the request
        await new Promise((resolve) => setTimeout(resolve, 500));

        // Fetch the updated notifications after a short delay
        await getNotifications();
      }
    } catch (err) {
      if (err.response && err.response.status === 401) {
        message.error("Token expired!");
        localStorage.removeItem("adminToken");
        setTimeout(() => {
          navigate("/Login");
        }, 3000);
      } else {
        message.error("Something went wrong");
      }
    }
  };

  return (
    <Box>
      <Box
        style={{ marginBottom: "30px", display: "flex", alignItems: "center" }}
      >
        <h3 className="page-title" style={{ marginRight: "10px" }}>
          Notifications
        </h3>
        <IoNotificationsCircleSharp className="fs-3" />
      </Box>
      <div style={{ display: "flex" }}>
        <div style={{ flex: 1, padding: "16px" }}>
          <Box
            style={{
              overflowY: "auto",
              maxHeight: "500px",
              paddingRight: "16px",
            }}
          >
            {notificationData.success === false &&
            notificationData.status === 500 ? (
              <p>No notifications</p>
            ) : (
              <List
                itemLayout="horizontal"
                dataSource={notificationData.notifications}
                renderItem={(item) => (
                  <List.Item>
                    <List.Item.Meta
                      title={
                        <div style={{ display: "flex", alignItems: "center" }}>
                          {item.notification_user.user_attachments &&
                          item.notification_user.user_attachments.length > 0 ? (
                            <img
                              style={{
                                width: "40px",
                                height: "40px",
                                marginRight: "10px",
                                borderRadius: "50%",
                              }}
                              crossOrigin="anonymous"
                              alt="user"
                              src={`${BASE_URL_IMAGE}${item.notification_user?.user_attachments[0]?.file_name}`}
                            />
                          ) : (
                            <Avatar
                              style={{
                                width: "40px",
                                height: "40px",
                                marginRight: "10px",
                              }}
                              src={`https://api.dicebear.com/7.x/miniavs/svg?seed=${item.notification_user.id}`}
                            />
                          )}
                          <div>
                            <strong>
                              {item.notification_user?.user_profile?.name}
                            </strong>
                            <p style={{ color: "#888" }}>
                              {new Date(item?.created_at).toLocaleString()}
                            </p>
                          </div>
                        </div>
                      }
                      description={
                        <p style={{ marginLeft: "50px" }}>
                          {item?.notification}
                        </p>
                      }
                    />
                    <Tooltip title="Clear">
                      <IconButton>
                        <FaTimes
                          style={{ cursor: "pointer" }}
                          onClick={() => handleClearNotification(item.id)}
                        />
                      </IconButton>
                    </Tooltip>
                  </List.Item>
                )}
              />
            )}
          </Box>
          {notificationData.success !== false &&
            notificationData.status !== 500 && (
              <div style={{ marginTop: "20px" }}>
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
                  Mark All As Read
                </Button>
              </div>
            )}
        </div>

        <div style={{ flex: 1 }}>
          <img
            src={Image}
            alt="Notifications"
            style={{
              width: "90%",
              height: "90%",
            }}
          />
        </div>
      </div>
    </Box>
  );
};

export default Notification;
