import Project from "../models/Project.model.js";
import crypto from "crypto";

import ShareChat from "../models/ShareChat.model.js"


export const getProjects = async (req, res) => {
    try {
        const projects = await Project.find().sort({ createdAt: -1 });
        res.json({ success: true, data: projects });
    } catch (err) {
        res.json({ success: false, error: "Failed to fetch projects" });
    }
};

export const getProjectById = async (req, res) => {
    try {
        const project = await Project.findById(req.params.id);
        res.json({ success: true, data: project });
    } catch (err) {
        res.json({ success: false, error: "Failed to fetch project" });
    }
}

export const generateShareableLink = async (req, res) => {

    try {
        const { chatId } = req.params;
        const ownerId = req.body.ownerId;

        const token = crypto.randomBytes(32).toString("hex");
        const expiresAt = new Date(Date.now() + 1000 * 60 * 10);

        const share = new ShareChat({ chatId, ownerId, token, expiresAt });
        await share.save();

        const shareUrl = `http://localhost:5000/view/${token}`;
        return res.status(200).json({ shareUrl });

    } catch (e) {
        console.log(e);
        return
    }
}

export const ViewSharedChat = async (req, res) => {
    const { token } = req.params;
    const sharedChat = await ShareChat.findOne({ token });

    if (!sharedChat || share.sharedChat < new Date()) {
        return res.status(403).send("Link expired or invalid");
    }

    const chat = await getChatById(share.chatId);
    return res.status(200).json({ data: chat });
}