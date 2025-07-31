import express from "express";
import { getMessages, postMessage } from "./chats.controller";

const router = express.Router();

/**
 * @route   GET /api/chat/messages
 * @desc    Fetch all messages
 */
router.get("/messages", getMessages);

/**
 * @route   POST /api/chat/send
 * @desc    Send a new message
 */
router.post("/send", postMessage);

export default router;
