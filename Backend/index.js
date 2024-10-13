// server.js
import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import cookieParser from "cookie-parser";
import userRoute from "./routes/user.route.js";
import messageRoute from "./routes/message.route.js";
import { app, server } from "./SocketIO/server.js";
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize environment variables
dotenv.config();

// Derive __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Middleware
app.use(express.json());
app.use(cookieParser());
app.use(cors());

// Database Connection
const PORT = process.env.PORT || 3001;
const URI = process.env.MONGODB_URI;

mongoose.connect(URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
})
    .then(() => console.log("Connected to MongoDB"))
    .catch((error) => console.log("MongoDB Connection Error:", error));

// Routes
app.use("/api/user", userRoute);
app.use("/api/message", messageRoute);

// Serve Frontend in Production
if (process.env.NODE_ENV === 'production') {
    const frontendPath = path.join(__dirname, "Frontend", "build"); // Changed from 'dist' to 'build'
    console.log("Serving static files from:", frontendPath);

    // Serve static files
    app.use(express.static(frontendPath));

    // Handle SPA routing, return index.html for any unknown routes
    app.get("*", (req, res) => {
        const indexPath = path.join(frontendPath, "index.html");
        console.log("Sending index.html from:", indexPath);
        res.sendFile(indexPath, (err) => {
            if (err) {
                console.error("Error sending index.html:", err);
                res.status(500).send("Server Error");
            }
        });
    });
}

// Start Server
server.listen(PORT, () => {
    console.log(`Server is Running on port ${PORT}`);
});
