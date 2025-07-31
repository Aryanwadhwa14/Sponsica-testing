import { Server } from "socket.io";
import { messages } from "./chats.models"; 

export const setupSocket = (io: Server) => {
  io.on("connection", (socket) => {
    console.log("User connected:", socket.id);

    // Send all messages to newly connected user
    socket.emit("initMessages", messages);

    // When user sends a new message
    socket.on("sendMessage", (msg) => {
      const newMsg = {
        id: Date.now().toString(),
        sender: msg.sender,
        text: msg.text,
        timestamp: new Date().toISOString(),
      };

      messages.push(newMsg);

      // Broadcast message to all users
      io.emit("newMessage", newMsg);
    });

    socket.on("disconnect", () => {
      console.log("User disconnected:", socket.id);
    });
  });
};
