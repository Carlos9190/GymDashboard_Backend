import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { corsConfig } from "./config/cors";
import { connectDB } from "./config/db";
import authRoutes from "./routes/authRoutes";
import exerciseRoutes from "./routes/exerciseRoutes";
import routineRoutes from "./routes/routineRoutes";

dotenv.config();
connectDB();

const app = express();
app.use(cors(corsConfig));

// Read form data
app.use(express.json());

// Routes

// TEST ROUTE
app.get("/", (req, res) => {
    res.send("Hello world");
});

// AUTH ROUTES
app.use("/api/auth", authRoutes);

// EXERCISE ROUTES
app.use("/api/exercises", exerciseRoutes);

// ROUTINE ROUTES
app.use("/api/routines", routineRoutes);

export default app;
