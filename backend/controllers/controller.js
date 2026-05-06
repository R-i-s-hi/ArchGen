import Project from "../models/Project.model.js";
import crypto from "crypto";

import ShareChat from "../models/ShareChat.model.js"


export const getProjects = async (req, res) => {

    const {ownerId} = req.query;

    try {
        const projects = await Project.find({ownerId}).sort({ createdAt: -1 });
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
        const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000);

        const share = new ShareChat({ chatId, ownerId, token, expiresAt, allowedViewers: req.body.restrictedUsers || [] });
        await share.save();

        const shareLink = `http://localhost:3000/view/${token}`;
        return res.status(200).json({ shareLink });

    } catch (e) {
        console.log(e);
        return
    }
}

export const ViewSharedChat = async (req, res) => {
    const { token } = req.params;
    const sharedChat = await ShareChat.findOne({ token });

    if (!sharedChat || sharedChat.expiresAt < new Date()) {
        return res.status(403).send("Link expired or invalid");
    }

    if (sharedChat.allowedViewers.length > 0) {
        const currentUserId = req.user?.id;
        if (!sharedChat.allowedViewers.includes(currentUserId)) {
            return res.status(403).json({ error: "Access restricted" });
        }
    }

    const chat = await Project.findById(sharedChat.chatId);
    return res.status(200).json({ data: chat });
}

export const migrateGuest = async (req, res) => {
    const { guestId, clerkId } = req.body

    if (!guestId || !clerkId) {
        return res.status(400).json({ success: false, error: "Missing guestId or clerkId" })
    }

    try {
        const result = await Project.updateMany(
            { ownerId: guestId },
            {
                $set: { ownerId: clerkId },
                $unset: { expireAt: "" },
            }
        )

        res.json({
            success: true,
            migratedCount: result.modifiedCount,
        })
    } catch (err) {
        console.error("Migration error:", err)
        res.status(500).json({ success: false, error: "Migration failed" })
    }
}