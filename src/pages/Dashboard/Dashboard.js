import "./Dashboard.css";
import React, { useState, useEffect, useRef } from "react";
import socketIOClient from "socket.io-client";
import Chat from '../../components/Chat'
const ENDPOINT = "http://localhost:3001";

function Dashboard() {
  const [clients, setClients] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [messages, setMessages] = useState([]);
  const [typingData, setTypingData] = useState("");
  const socket = useRef(socketIOClient(ENDPOINT, { query: { rol: "admin" } }));

  useEffect(() => {
    console.log("use effect");
    socket.current.emit("get clients");

    socket.current.on("get clients", (data) => {
      setClients(data.filter((x) => x.user !== "Admin"));
    });

    socket.current.on("get messages", (data) => {
      setMessages(data);
    });

    socket.current.on("chat message", function (msg) {
      setMessages((prev) => {
        return prev.concat({ message: msg });
      });
    });

    socket.current.on("typing", function (msg) {
      if (msg.status) {
        setTypingData(`${msg.username} esta escribiendo...`);
      } else setTypingData("");
    });
  }, []);

  const handleClickRoom = (room) => {
    socket.current.emit("leave", { room: selectedRoom });
    setSelectedRoom(room);
    socket.current.emit("join", { room: room });
  };

  const handleSendMessage = (message) => {
    socket.current.emit("chat message", {
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

export default Dashboard;