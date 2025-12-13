import cookieParser from "cookie-parser";
import cors from "cors";
import dotenv from "dotenv";
import express, { Application } from "express";

import connectToDB from "./db/db";
import errorMiddleware from "./middlewares/errorMiddleware";
import friendRoutes from "./routes/friendRoute";
import userRoutes from "./routes/userRoute";

dotenv.config();

const app: Application = express();

// Connect to MongoDB
connectToDB();

// CORS
app.use(
  cors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  })
);

// Middleware
app.use(cookieParser());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.use("/users", userRoutes);
app.use("/friends", friendRoutes);

// Global Error Handler
app.use(errorMiddleware);

export default app;
