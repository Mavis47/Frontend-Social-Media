import type { Request, Response } from "express";
import prisma from "../db/db";

export const createNotification = async (req: Request, res: Response) => {
  const { userId, message } = req.body;

  try {
    const notification = await prisma.notification.create({
      data: {
        userId,
        message,
      },
    });

    res.status(201).json(notification);
  } catch (error) {
    console.error('Error creating notification:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

export const getNotifications = async (req: Request, res: Response) => {
    const userId = parseInt(req.params.userId);
  
    try {
      const notifications = await prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
      });
  
      res.status(200).json(notifications);
    } catch (error) {
      console.error('Error fetching notifications:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };

export const deleteNotification = async (req: Request, res: Response) => {
    const notificationId = parseInt(req.params.id);
  
    try {
      const deletedNotification = await prisma.notification.delete({
        where: { id: notificationId },
      });
  
      res.status(200).json({ message: 'Notification deleted successfully', deletedNotification });
    } catch (error) {
      console.error('Error deleting notification:', error);
      res.status(500).json({ message: 'Internal server error' });
    }
  };
  