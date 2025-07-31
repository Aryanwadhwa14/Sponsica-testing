import { Request, Response } from "express";
import { messages } from "./chats.models";


// GET all messages
export const getMessages = (req: Request, res: Response) => {
  res.status(200).json(messages);
};

// POST a new message (for non-socket use or testing)
export const postMessage = (req: Request, res: Response) : void => {
  const { sender, text } = req.body;

  if (!sender || !text) {
    res.status(400).json({ error: "Sender and text are required." })
    return ;
  }

  const newMsg = {
    id: Date.now().toString(),
    sender,
    text,
    timestamp: new Date().toISOString(),
  };

  messages.push(newMsg);
  res.status(201).json(newMsg);
};
