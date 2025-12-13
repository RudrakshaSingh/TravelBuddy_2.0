import dotenv from "dotenv";
import http from "http";

import app from "./app";

dotenv.config();

const port = process.env.PORT || 5000;

import { initializeSocket } from "./socket";

// ... existing code ...

const server = http.createServer(app);

// Initialize Socket.IO
initializeSocket(server);

server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
