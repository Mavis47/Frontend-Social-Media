import type { Request, Response } from "express";
import prisma from "../db/db";
import axios from "axios";

export const sendMessage = async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, content } = req.body;

    // Validate request body
    if (!senderId || !receiverId || !content) {
      return res.status(400).json({ message: "All fields are required" });
    }

    // Create the message
    const message = await prisma.message.create({
      data: {
        senderId: parseInt(senderId),
        receiverId: parseInt(receiverId),
        content,
      },
    });

    //socket io -> sending message dynamically
    const io = req.app.get("socketio");
    if (!io) {
      console.error("Socket.io instance not found");
      return res.status(500).json({ message: "Internal server error" });
    }
    io.to(receiverId.toString()).emit("newMessage", message);
    // io.to(senderId).emit('message', message); 

    return res.status(201).json({
      message: "Message sent successfully",
      data: message,
    });
  } catch (error) {
    console.error('Error sending message:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
};

export const getMessage = async(req: Request,res: Response) => {
    const {userId} = req.params;
    try {
        const { senderId, receiverId } = req.params;
    
        // Fetch messages between the sender and receiver
        const messages = await prisma.message.findMany({
          where: {
            OR: [
              {
                senderId: parseInt(senderId),
                receiverId: parseInt(receiverId),
              },
              {
                senderId: parseInt(receiverId),
                receiverId: parseInt(senderId),
              },
            ],
          },
          orderBy: {
            createdAt: 'asc', // Order by creation time, ascending
          },
        });
    
        return res.status(200).json({
          message: 'Messages retrieved successfully',
          data: messages,
        });
      } catch (error) {
        console.error('Error retrieving messages:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
}

export const deleteMessage = async(req: Request,res: Response) => {
    try {
        const { messageId } = req.params;
        console.log("Message id",messageId);
        // Delete the message with the specified ID
        const deletedMessage = await prisma.message.delete({
          where: {
            id: parseInt(messageId),
          },
        });
        return res.status(200).json({
          message: 'Message deleted successfully',
          data: deletedMessage,
        });
      } catch (error) {
        console.error('Error deleting message:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
}