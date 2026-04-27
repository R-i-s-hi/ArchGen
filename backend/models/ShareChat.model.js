import mongoose from "mongoose";

const ShareChatSchema = new mongoose.Schema({
    chatId: {
        type: String,
        required: true
    },
    ownerId: {
        type: String,
        required: true
    },
    token: {
        type: String,
        required: true
    },
    expiresAt: Date,
    allowedViewers: {
        type: [String],
        default: []
    }
}, { timestamps: true });

const ShareChat = mongoose.model("ShareChat", ShareChatSchema);

export default ShareChat;

