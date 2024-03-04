import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider } from "firebase/auth";
import { getDatabase, ref, push, set, onValue } from "firebase/database";
import { useEffect, useState } from "react";

// Your Firebase config code here...

const firebaseConfig = {
    apiKey: "AIzaSyBrpjWi6rwbL8cp760_U4-g2NEbYKOrP1g",
    authDomain: "nunamoving-mobile-app.firebaseapp.com",
    databaseURL: "https://nunamoving-mobile-app-default-rtdb.firebaseio.com",
    projectId: "nunamoving-mobile-app",
    storageBucket: "nunamoving-mobile-app.appspot.com",
    messagingSenderId: "1062290442356",
    appId: "1:1062290442356:web:7e227d530d365bca172921",
    measurementId: "G-R9M1SYNC4Q"
  };
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();
const db = getDatabase(app);

const Support = () => {
    const [message, setMessage] = useState('');
    const [chatMessages, setChatMessages] = useState([]);

    useEffect(() => {
        const messagesRef = ref(db, `CUSTOMER_ADMIN_CHAT/messages/USER_1/ADMIN_8`);
        onValue(messagesRef, (snapshot) => {
            const messages = [];
            snapshot.forEach((childSnapshot) => {
                messages.push(childSnapshot.val());
            });
            setChatMessages(messages); // Update chat messages state
        });
    }, [db]);

    const sendMessage = async () => {
        try {
            const senderMessageRef = push(ref(db, `CUSTOMER_ADMIN_CHAT/messages/USER_1/ADMIN_8`));
            const receiverMessageRef = push(ref(db, `CUSTOMER_ADMIN_CHAT/messages/ADMIN_8/USER_1`));
            
            await Promise.all([
                set(senderMessageRef, {
                    message,
                    timestamp: new Date().toISOString(),
                    source: "SENDER",
                    read: true
                }),
                set(receiverMessageRef, {
                    message,
                    timestamp: new Date().toISOString(),
                    source: "RECEIVER",
                    read: true
                })
            ]);

            setMessage('');
        } catch (e) {
            console.error("Error sending message: ", e);
        }
    };

    return (
        <div>
            <h1>Support</h1>
            <div>
                {chatMessages.map((msg, index) => (
                    <div key={index}>{msg.message}</div>
                ))}
            </div>
            <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
            />
            <button onClick={sendMessage}>Send Message</button>
        </div>
    );
};

export default Support;