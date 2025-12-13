import { Server as HttpServer } from "http";
import { Server, Socket } from "socket.io";

let io: Server | undefined;

interface UserSocketMap {
    [userId: string]: string;
}

const userSocketMap: UserSocketMap = {}; // userId -> socketId

export const initializeSocket = (server: HttpServer) => {
    io = new Server(server, {
        cors: {
            origin: process.env.FRONTEND_URL || "http://localhost:5173",
            methods: ["GET", "POST"],
        },
    });

    io.on("connection", (socket: Socket) => {
        console.log("A user connected", socket.id);

        const userId = socket.handshake.query.userId as string;

        if (userId && userId !== "undefined") {
            userSocketMap[userId] = socket.id;
        }

        // broadcast to all connected clients the list of online users
        io?.emit("getOnlineUsers", Object.keys(userSocketMap));

        socket.on("disconnect", () => {
            console.log("user disconnected", socket.id);
            if (userId && userSocketMap[userId]) {
                delete userSocketMap[userId];
            }
            io?.emit("getOnlineUsers", Object.keys(userSocketMap));
        });
    });
};

export const getReceiverSocketId = (receiverId: string) => {
    return userSocketMap[receiverId];
};

export const getIO = () => {
    if (!io) {
        throw new Error("Socket.io not initialized!");
    }
    return io;
};
