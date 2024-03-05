/** @format */

import * as React from "react";
import { makeStyles } from "@material-ui/core/styles";
import {
  Box,
  TextField,
  Button,
  Typography,
  Avatar,
  Grid,
  Paper,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
} from "@mui/material";
import InputLabel from "@mui/material/InputLabel";
import { useNavigate } from "react-router-dom";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import Select from "@mui/material/Select";
import EmojiPicker from "emoji-picker-react";
import SendIcon from "@mui/icons-material/Send";
import Image from "../../assets/img-11.png";
import { useState, useEffect } from "react";
import {
  GetAllUserMessages,
  SendMessage,
  GetUserChatList,
} from "../../services/Api/NotificationApi";
import { BASE_URL_IMAGE } from "../../services/Host";
import { BsBoxArrowInLeft } from "react-icons/bs";

import firebaseConfig from "../../firebaseConfig";
import { GetAdminProfile } from "../../services/Api/Api";
import Support from "./Chat";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  chatSection: {
    width: "100%",
    height: "80vh",
  },
  headBG: {
    backgroundColor: "#e0e0e0",
  },
  borderRight500: {
    borderRight: "2px solid #e0e0e0",
    height: "100%",
  },
  messageArea: {
    height: "70vh",
    overflowY: "auto",
  },
});

const formatDate = (timestamp) => {
  const date = new Date(timestamp);
  const hours = date.getHours();
  const minutes = date.getMinutes();
  const formattedTime = `${hours}:${minutes < 10 ? "0" : ""}${minutes}`;
  return formattedTime;
};

const ChatUI = () => {
  const classes = useStyles();
  const [input, setInput] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState();
  const [chatData, setChatData] = useState([]);
  const [chatType, setChatType] = React.useState("customer");
  const [chatListData, setChatListData] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [profileData, setProfileData] = useState(null);

  const getProfileData = async () => {
    try {
      let result = await GetAdminProfile(localStorage.getItem("chatToken"));
      setProfileData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };
  useEffect(() => {
    getProfileData();
  }, []);
  const navigate = useNavigate();
  const navigateToDashboard = () => {
    navigate("/");
  };

  const handleChange = (event) => {
    setChatType(event.target.value);
  };

  const handleUserClick = async (data) => {
    setSelectedUser(data);

    try {
      const chattoken = localStorage.getItem("chatToken");
      await SendMessage(chattoken, data.id); // Assume there's a function to mark messages as seen

      // Refresh the chat list and data after marking messages as seen
      getUserChatList();
      getUserChatData();
    } catch (error) {
      console.error("Error marking messages as seen:", error);
    }
  };

  // get customer count
  const getUserChatData = async () => {
    const chattoken = localStorage.getItem("chatToken");
    try {
      if (selectedUser) {
        const result = await GetAllUserMessages(chattoken, selectedUser.id);
        setChatData(result.data.data);

      }
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUserChatData();

    // Set up an interval to call the function every 10 seconds
    const chatDataInterval = setInterval(() => {
      getUserChatData();
    }, 10000); // 10000 milliseconds = 10 seconds

    // Clean up the interval on component unmount
    return () => clearInterval(chatDataInterval);
  }, [selectedUser]);

  const chatWindowRef = React.useRef(null);

  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [chatData, selectedUser]);

  //get chat list
  const getUserChatList = async () => {
    const chattoken = localStorage.getItem("chatToken");
    try {
      const result = await GetUserChatList(chattoken, chatType);
      setChatListData(result.data.data);
    } catch (e) {
      console.log(e);
    }
  };

  useEffect(() => {
    getUserChatList(); // Initial call

    // Set up an interval to call the function every minute
    const chatListInterval = setInterval(() => {
      getUserChatList();
    }, 10000);

    // Clean up the interval on component unmount
    return () => clearInterval(chatListInterval);
  }, [chatType]);

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      formData.append("message", input);
      formData.append("receiverUserId", selectedUser.id);

      // Call the SendMessage API
      const response = await SendMessage(formData);

      setInput("");
      getUserChatData();
    } catch (error) {
      console.error("Error sending message:", error);
    }
  };

  const getInitials = (name) => {
    if (name) {
      const nameArray = name.split(" ");
      return nameArray
        .map((word) => word.charAt(0))
        .join("")
        .toUpperCase();
    }
    return "";
  };

  const handleInputChange = (event) => {
    setInput(event.target.value);
  };
  const toggleEmojiPicker = () => {
    setShowEmojiPicker(!showEmojiPicker);
  };

  const renderChatMessages = () => {
    let currentDate = null;

    return chatData.map((message, index, array) => {
      const currentMessageDate = new Date(
        message.timestamp
      ).toLocaleDateString();

      // Check if the date has changed since the previous message
      if (currentDate !== currentMessageDate) {
        currentDate = currentMessageDate;

        return (
          <React.Fragment key={`date-${index}`}>
            <Typography
              variant="subtitle2"
              sx={{
                textAlign: "center",
                marginY: "10px",
                color: "text.secondary",
              }}
            >
              {currentMessageDate}
            </Typography>
            <Message
              key={index}
              message={message}
              isSender={message.source === "SENDER"}
            />
          </React.Fragment>
        );
      }

      return (
        <Message
          key={index}
          message={message}
          isSender={message.source === "SENDER"}
        />
      );
    });
  };

  const Navbar = ({ selectedUser }) => (
    <Box
      sx={{
        p: 2,
        backgroundColor: "#f5f5f5",
        display: "flex",
        alignItems: "center",
        marginBottom: "10px",
      }}
    >
      {selectedUser && (
        <>
          {selectedUser.user_attachments &&
          selectedUser.user_attachments.length > 0 ? (
            <img
              style={{
                height: "40px",
                width: "40px",
                borderRadius: "50%",
              }}
              crossOrigin="anonymous"
              alt="ICON"
              src={`${BASE_URL_IMAGE}${selectedUser.user_attachments[0]?.file_name}`}
            />
          ) : (
            <Avatar style={{ backgroundColor: "#2196F3", color: "#fff" }}>
              {getInitials(selectedUser?.user_profile?.name)}
            </Avatar>
          )}
          <Typography variant="h6" sx={{ ml: 2 }}>
            {selectedUser?.user_profile?.name}
          </Typography>
        </>
      )}
    </Box>
  );

  return (
    <Grid container style={{ height: "100%" }}>
      {/* Left side with user list */}
      <Grid item xs={3} style={{ padding: "10px" }}>
        <Box className={classes.borderRight500}>
          <Grid container>
            <Grid item xs={12} style={{ padding: "10px" }}>
              <FormControl fullWidth>
                <InputLabel id="demo-simple-select-label">Type:</InputLabel>
                <Select
                  labelId="demo-simple-select-label"
                  id="demo-simple-select"
                  value={chatType}
                  label="Age"
                  onChange={handleChange}
                  defaultValue="customer"
                >
                  <MenuItem value="customer">Customer</MenuItem>
                  <MenuItem value="driver">Driver</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          <Divider />
          <Grid item xs={12} className={classes.messageArea}>
            <List>
              {chatListData.map((chat, index) => (
                <ListItem
                  button
                  key={chat.id}
                  onClick={() => handleUserClick(chat)}
                >
                  <ListItemIcon>
                    {chat.user_attachments &&
                    chat.user_attachments.length > 0 ? (
                      <img
                        style={{
                          height: "40px",
                          width: "40px",
                          borderRadius: "50%",
                        }}
                        alt={chat.user_profile.name}
                        crossOrigin="anonymous"
                        src={`${BASE_URL_IMAGE}${chat.user_attachments[0].file_name}`}
                      />
                    ) : (
                      <Avatar>{getInitials(chat.user_profile.name)}</Avatar>
                    )}
                  </ListItemIcon>
                  <ListItemText
                    primary={
                      <>
                        <Typography
                          variant="body1"
                          sx={{
                            fontWeight:
                              chat.unseenCount > 0 ? "bold" : "normal",
                          }}
                        >
                          {chat.user_profile.name}
                        </Typography>
                        {chat.unseenCount > 0 && (
                          <Typography
                            variant="caption"
                            sx={{
                              marginTop: 1,
                              color: "text.secondary",
                              fontSize: "0.7rem",
                            }}
                          >
                            {formatDate(chat.lastMessageTime, "hh:mm")}
                          </Typography>
                        )}
                      </>
                    }
                    secondary={
                      <Typography
                        variant="body2"
                        sx={{
                          fontWeight: chat.unseenCount > 0 ? "bold" : "normal",
                        }}
                      >
                        {chat.displayMessage}
                      </Typography>
                    }
                  />
                  {chat.unseenCount > 0 && (
                    <Avatar
                      sx={{
                        bgcolor: "primary.main",
                        width: "18px",
                        height: "18px",
                        fontSize: "0.7rem",
                        fontWeight: "bold",
                        marginLeft: "auto",
                      }}
                    >
                      {chat.unseenCount}
                    </Avatar>
                  )}
                </ListItem>
              ))}
            </List>
          </Grid>
          <Button
            variant="contained"
            color="secondary"
            icon="pi pi-arrow-right"
            // color="primary"
            onClick={navigateToDashboard}
            style={{ marginTop: "50px", marginLeft: "35px" }}
            startIcon={<BsBoxArrowInLeft />}
          >
            Go Back to Dashboard
          </Button>
        </Box>
      </Grid>

      {/* Middle section with an image */}
      <Grid item xs={9} 
      // style={{ display: "flex", flexDirection: "column" }}
      >
        {selectedUser ? (
            <div
            // sx={{
            //   flex: 1,
            //   overflowY: "auto",
            //   p: 2,
            //   position: "relative", 
            // }}
          >
            <Navbar selectedUser={selectedUser} />
          <Support id={selectedUser?.id} chatType={chatType} />
          </div>
        ) : (
          <img
            src={Image}
            alt="Middle "
            style={{ width: "100%", height: "100%" }}
          />
        )}
      </Grid>
    </Grid>
  );
};

const Message = ({ message, isSender }) => {
  return (
    <Box
      sx={{
        display: "flex",
        flexDirection: isSender ? "row-reverse" : "row",
        alignItems: "flex-start",
        mb: 2,
      }}
    >
      <Box
        sx={{
          display: "flex",
          flexDirection: "column",
          alignItems: isSender ? "flex-end" : "flex-start",
        }}
      >
        <Paper
          variant="outlined"
          sx={{
            p: 2,
            backgroundColor: isSender ? "primary.light" : "secondary.light",
            borderRadius: isSender
              ? "20px 20px 20px 5px"
              : "20px 20px 5px 20px",
          }}
        >
          <Typography variant="body1">{message.message}</Typography>
        </Paper>
        <Typography
          variant="caption"
          sx={{
            color: "text.secondary",
            marginLeft: isSender ? "auto" : 0,
            marginRight: isSender ? 0 : "auto",
          }}
        >
          {formatDate(message.timestamp, "hh:mm")}
        </Typography>
      </Box>
    </Box>
  );
};

export default ChatUI;
