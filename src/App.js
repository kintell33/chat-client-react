import "./App.css";
import React, { useState, useEffect } from "react";
import socketIOClient from "socket.io-client";
import Chat from "./components/Chat";
const ENDPOINT = "http://localhost:3001";
let socket = undefined;

function App() {
  const [clients, setClients] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingData, setTypingData] = useState("");

  useEffect(() => {
    socket = socketIOClient(ENDPOINT, { query: { rol: "admin" } });
    socket.emit("get clients");

    socket.on("get clients", (data) => {
      setClients(data.filter((x) => x.user !== "Admin"));
    });

    socket.on("get messages", (data) => {
      setMessages(data);
      console.log(messages);
    });

    socket.on("chat message", function (msg) {
      setMessages((prev) => {
        return prev.concat({ message: msg });
      });
      console.log(messages);
    });

    socket.on("typing", function (msg) {
      if (msg.status) {
        setTypingData(`${msg.username} esta escribiendo...`);
      } else setTypingData("");
    });
  }, [selectedRoom, messages, setMessages, setTypingData]);

  const handleClickRoom = (room) => {
    socket.emit("leave", { room: selectedRoom });
    setSelectedRoom(room);
    socket.emit("join", { room: room });
  };

  const handleSendMessage = (message) => {
    socket.emit("chat message", {
      username: "Admin",
      message: message,
      room: selectedRoom,
    });
  };

  return (
    <div className="container">
      <div className="rooms">
        <div className="title">Nuevas conversaciones</div>
        {clients.map((item, index) => {
          return (
            <div
              onClick={() => {
                handleClickRoom(item.room);
              }}
              key={index}
              className="sala"
            >
              Sala {item.room}
            </div>
          );
        })}
      </div>
      <div className="chat">
        {!selectedRoom || (
          <Chat
            typing={typingData}
            messages={messages}
            onSendMessage={handleSendMessage}
          />
        )}
      </div>
    </div>
  );
}

export default App;
