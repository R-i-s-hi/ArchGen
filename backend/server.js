import express from "express";
import cors from "cors";
import { connectDB } from "./config/db.js";
import dotenv from "dotenv";

import { generateProject } from "./controllers/generateController.js";
import { getProjects } from "./controllers/controller.js";
import { getProjectById } from "./controllers/controller.js";
import { generateShareableLink, migrateGuest } from "./controllers/controller.js";

dotenv.config();

const app = express();
connectDB();

app.use(cors({
    origin: ["http://localhost:3000"],
    credentials: true
}));
app.use(express.json());


app.post("/api/generate", generateProject);
app.get("/projects", getProjects);
app.post("/api/migrate-guest", migrateGuest);
app.get("/project/:id", getProjectById);
app.post("/chat/share/:chatId", generateShareableLink);


const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});