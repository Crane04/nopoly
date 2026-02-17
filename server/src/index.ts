import express from "express";
import http from "http";
import { Server } from "socket.io";
import { setupSocketHandlers } from "./socket/handler";
import path from "path";

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"],
  },
});

app.use(express.static("public"));

app.use(express.static(path.join(__dirname, "../../client")));

// Also serve node_modules/socket.io client as a fallback
app.use(
  "/socket.io",
  express.static(
    path.join(__dirname, "../../node_modules/socket.io/client-dist"),
  ),
);

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);
  setupSocketHandlers(io, socket);

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

const PORT = process.env.PORT || 3001;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
