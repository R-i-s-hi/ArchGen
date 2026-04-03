import express from "express";
import { generateProject } from "../controllers/generateController.js";

const router = express.Router();

router.post("/", generateProject);

export default router;