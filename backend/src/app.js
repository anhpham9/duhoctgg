import "./config/env.js";
import { authenticate } from "./middlewares/auth.middleware.js";

import express from "express";
import cors from "cors";

import authRoutes from "./routes/auth.routes.js";

const app = express();

app.use(cors());
app.use(express.json());

// test route
app.get("/", (req, res) => {
    res.send("API is running...");
});

// auth routes
app.use("/api/auth", authRoutes);

// test protected route
app.get("/api/me", authenticate, (req, res) => {
  res.json(req.user);
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});