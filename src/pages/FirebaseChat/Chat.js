
import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import React, { useEffect, useState } from "react";
import { Box, TextField, Button, Grid } from "@mui/material";
import SendIcon from "@mui/icons-material/Send";
import "./Chat.scss";

const firebaseConfig = {
  apiKey: "AIzaSyBrpjWi6rwbL8cp760_U4-g2NEbYKOrP1g",
  authDomain: "nunamoving-mobile-app.firebaseapp.com",
  databaseURL: "https://nunamoving-mobile-app-default-rtdb.firebaseio.com",
  projectId: "nunamoving-mobile-app",
  storageBucket: "nunamoving-mobile-app.appspot.com",
  messagingSenderId: "1062290442356",
  appId: "1:1062290442356:web:7e227d530d365bca172921",
  measurementId: "G-R9M1SYNC4Q",
};
const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

function ChatMessage({ message, source, timestamp }) {
  const messageClass =
    source === "SENDER" ? "sender-message" : "receiver-message";
  const alignClass = source === "SENDER" ? "align-left" : "align-right";
  const timeString = new Date(timestamp).toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
  });

  return (
    <div className={`message ${messageClass} ${alignClass}`}>
      {message}
      <div className={`message-time ${alignClass}`}>{timeString}</div>
    </div>
  );
}

const Support = ({ id, chatType }) => {
  console.log("chatType", chatType);
  const [message, setMessage] = useState("");
  const [chatMessages, setChatMessages] = useState([]);

  console.log("message", message);

  useEffect(() => {
    const databaseUrl =
      chatType === "customer"
        ? `CUSTOMER_ADMIN_CHAT/messages/ADMIN_8/USER_${id}`
        : `DRIVER_ADMIN_CHAT/messages/ADMIN_8/USER_${id}`;

    const messagesRef = ref(db, databaseUrl);
    onValue(messagesRef, (snapshot) => {
      const messages = [];
      snapshot.forEach((childSnapshot) => {
        messages.push(childSnapshot.val());
      });
      setChatMessages(messages);
      // Update chat messages state
    });
  }, [db, id]);

  console.log("chatMessages", chatMessages);

  const currentTime = new Date();
  const timestampInEpoch = currentTime.getTime();

  const sendMessage = async () => {
    console.log("helllooooo");
    const senderUrl =
      chatType === "customer"
        ? `CUSTOMER_ADMIN_CHAT/messages/ADMIN_8/USER_${id}`
        : `DRIVER_ADMIN_CHAT/messages/ADMIN_8/USER_${id}`;
    const receiverUrl =
      chatType === "customer"
        ? `CUSTOMER_ADMIN_CHAT/messages/USER_${id}/ADMIN_8`
        : `DRIVER_ADMIN_CHAT/messages/USER_${id}/ADMIN_8`;
    try {
      console.log("stye", senderUrl, receiverUrl);
      const senderMessageRef = push(ref(db, senderUrl));
      const receiverMessageRef = push(ref(db, receiverUrl));

      await Promise.all([
        set(senderMessageRef, {
          message,
          timestamp: timestampInEpoch,
          source: "SENDER",
          read: true,
        }),
        set(receiverMessageRef, {
          message,
          timestamp: timestampInEpoch,
          source: "RECEIVER",
          read: true,
        }),
      ]);

      setMessage("");
    } catch (e) {
      console.error("Error sending message: ", e);
    }
  };

  const chatWindowRef = React.useRef(null);
  const scrollToBottom = () => {
    if (chatWindowRef.current) {
      chatWindowRef.current.scrollTop = chatWindowRef.current.scrollHeight;
    }
  };
  useEffect(() => {
    scrollToBottom();
  }, [chatMessages]);

  // const groupMessagesByDate = (messages) => {
  //   const groupedMessages = [];
  //   let currentDate = null;

  //   messages.forEach((msg) => {
  //     const msgDate = new Date(msg.timestamp).toLocaleDateString();

  //     if (msgDate !== currentDate) {
  //       currentDate = msgDate;
  //       groupedMessages.push({
  //         date: currentDate,
  //         messages: [msg],
  //       });
  //     } else {
  //       const lastIndex = groupedMessages.length - 1;
  //       groupedMessages[lastIndex].messages.push(msg);
  //     }
  //   });

  //   return groupedMessages;
  // };

  const groupMessagesByDate = (messages) => {
    const groupedMessages = [];
    let currentDate = null;
  
    messages.forEach((msg) => {
      const timestamp = msg.timestamp;
      const msgDate = new Date(timestamp);
  
      // Check if the date is valid
      if (!isNaN(msgDate.getTime())) {
        const formattedDate = msgDate.toLocaleDateString("en-US", {
          day: "2-digit",
          month: "numeric",
          year: "numeric",
        });
  
        if (formattedDate !== currentDate) {
          currentDate = formattedDate;
          groupedMessages.push({
            date: currentDate,
            messages: [msg],
          });
        } else {
          const lastIndex = groupedMessages.length - 1;
          groupedMessages[lastIndex].messages.push(msg);
        }
      } else {
        console.error("Invalid date encountered:", msgDate, "in message:", msg);
      }
    });
  
    return groupedMessages;
  };
  
  const formattedMessages = groupMessagesByDate(chatMessages);

  return (
    <div>
      <div className="messageContainer" ref={chatWindowRef}>
        {/* <div> */}
        {/* {chatMessages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.message}
              source={msg.source}
              timestamp={msg.timestamp}
            />
          ))} */}
        {/* </div> */}

        {/* {formattedMessages.map((group) => (
        <React.Fragment key={group.date}>
          <div className="date-header">{group.date}</div>
          {group.messages.map((msg, index) => (
            <ChatMessage
              key={index}
              message={msg.message}
              source={msg.source}
              timestamp={msg.timestamp}
            />
          ))}
        </React.Fragment>
      ))} */}
        {formattedMessages.map((group) => (
          <React.Fragment key={group.date}>
            <div className="date-header">
              {new Date(group.date).toLocaleDateString("en-US", {
                day: "2-digit",
                month: "numeric", // Change "long" to "numeric"
                year: "numeric",
              })}
            </div>

            {group.messages.map((msg, index) => (
              <ChatMessage
                key={index}
                message={msg.message}
                source={msg.source}
                timestamp={msg.timestamp}
              />
            ))}
          </React.Fragment>
        ))}
      </div>
      <Box
        sx={{
          padding: "4px 20px",
          // backgroundColor: "background.default",
          // position: "absolute",
          // bottom: 0,
          // width: "auto",
        }}
      >
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={10}>
            <TextField
              size="small"
              fullWidth
              placeholder="Type a message"
              variant="outlined"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyPress={(event) => {
                if (event.key === "Enter" && message.trim() !== "") {
                  sendMessage();
                }
              }}
            />
          </Grid>
          <Grid item xs={2}>
            <Button
              fullWidth
              color="primary"
              variant="contained"
              endIcon={<SendIcon />}
              onClick={sendMessage}
              disabled={message.trim() === ""}
            >
              Send
            </Button>
          </Grid>
        </Grid>
      </Box>
    </div>
  );
};

export default Support;
