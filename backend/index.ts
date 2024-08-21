import express from 'express';
import dotenv from 'dotenv';
import path from 'path';
import authRoutes from './src/routes/authRoutes';
import cookieParser from 'cookie-parser';
import postRoutes from './src/routes/postRoutes';
import followRoutes from './src/routes/followRoutes';
import notifyRoutes from "./src/routes/notificationRoutes";
import messageRoutes from "./src/routes/messageRoutes";
import { Server } from 'socket.io';
import http from 'http';
import cors from 'cors';

const app = express();
const server = http.createServer(app);  // Attach your Express app to an HTTP server
const PORT = process.env.PORT || 5001;

// Initialize Socket.IO with CORS configuration
const io = new Server(server, {
    cors: {
        origin: "http://localhost:5173",  // Frontend URL
        methods: ['GET','POST'],
        credentials: true,
    },
});

// Middleware setup
app.use(cors({
    origin: "http://localhost:5173",
    credentials: true,
}));
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: true }));

// Static files
app.use('/public', express.static(path.join(__dirname, 'public')));

// Route setup
app.use("/api/auth", authRoutes);
app.use("/api/post", postRoutes);
app.use("/api/follow", followRoutes);
app.use("/api/notify",notifyRoutes)
app.use("/api/message",messageRoutes)

app.get("/", (req, res) => {
    res.send("Hello Chat");
});

// Socket.IO connection handling
io.on("connection", (socket) => {
    console.log("A user connected");
    // Example: Join a specific room for notifications
    socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
        console.log(`User joined room: ${roomId}`);
    });

    socket.on("sendMessage", (message) => {
        // Emit the message to all clients or specific rooms
        io.emit("newMessage", message);
      });

    socket.on("notification",(notification) => {
        console.log("notification :-",notification)
        io.to(`user-${notification.followingId}`).emit("notification", notification);
    })

    socket.on("disconnect", () => {
        console.log("User disconnected");
    });
});

// Start the server with Socket.IO attached
server.listen(PORT, () => {
    console.log(`Server is running at port ${PORT}`);
});

app.set("socketio", io);
