import type { Request, Response } from "express";
import prisma from "../db/db";

const createNotificationInDb = async (userId: number, message: string) => {
  try {
    await prisma.notification.create({
      data: { userId, message },
    });
  } catch (error) {
    console.error("Error creating notification in DB:", error);
  }
};

export const followUser = async (req: Request, res: Response) => {
  const { followerId, followingId } = req.body;

  if (!followerId || !followingId) {
    return res
      .status(400)
      .json({ message: "Missing followerId or followingId" });
  }

  try {
    // Fetch the follower's username
    const follower = await prisma.user.findUnique({
      where: { id: followerId },
      select: { username: true }, // Select only the username
    });

    if (!follower) {
      return res.status(404).json({ message: "Follower Not Found" });
    }

    const userToFollow = await prisma.user.findUnique({
      where: { id: followingId },
    });

    if (!userToFollow) {
      return res.status(404).json({ message: "User Not Found" });
    }

    // Check for existing follow request
    const existingRequest = await prisma.followRequest.findFirst({
      where: {
        followerId,
        followingId,
      },
    });

    if (existingRequest) {
      if (existingRequest.status === "PENDING") {
        // Unfollow if the request is pending
        await prisma.followRequest.delete({
          where: {
            id: existingRequest.id,
          },
        });
        
        // Remove the notification from the database
        await prisma.notification.deleteMany({
          where: {
            userId: followingId,
            message: {
              contains: `User ${follower.username} sent you a follow request`,
            },
          },
        });
        return res.status(200).json({ message: "Unfollowed successfully" });
      } else if (existingRequest.status === "ACCEPTED") {
        return res.status(400).json({ message: "Already following this user" });
      }
    }

    // If no existing request or if the request was not pending
    const follow = await prisma.followRequest.create({
      data: {
        followerId,
        followingId,
        status: "PENDING",
      },
    });

    // Send notification via Socket.IO
    const io = req.app.get("socketio");
    if (!io) {
      console.error("Socket.io instance not found");
      return res.status(500).json({ message: "Internal server error" });
    }

    const message = `${follower.username} sent you a follow request...`;
    await createNotificationInDb(followingId, message);

    console.log(`Sending notification to user-${followingId}`);
    io.to(`user-${followingId}`).emit("notification", {
      message,
      followerId,
      followingId,
    });
    console.log("Notification emitted");
    return res
      .status(201)
      .json({ message: "Follow Request Sent Successfully", follow });
  } catch (error) {
    console.error("Error following user:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const respondToFollowRequest = async (req: Request, res: Response) => {
  console.log("Request Body",req.body);
  const { requestId, response } = req.body; // response -> will be "ACCEPTED" or "REJECTED"

  try {
    if (response === "REJECTED") {
      // Delete the follow request if rejected
      await prisma.followRequest.delete({
        where: { id: requestId },
      });

      res.status(200).json({ message: "Follow request rejected and deleted" });
      return; // Exit early to prevent further processing
    }

    const updatedRequest = await prisma.followRequest.update({
      where: { id: requestId },
      data: { status: response },
    });

    console.log("User Found",updatedRequest);

    if (response === "ACCEPTED") {
      await prisma.follow.create({
        data: {
          followerId: updatedRequest.followerId,
          followingId: updatedRequest.followingId,
        },
      });
    }

    res
      .status(200)
      .json({ message: "Follow request updated", request: updatedRequest });
  } catch (error) {
    console.error("Error responding to follow request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getAllReceivedRequest = async(req:Request,res: Response) => {
  try {
    const data = await prisma.followRequest.findMany();
    console.log("Data",data);
    return res.status(200).json(data);
  } catch (error) {
    console.log("Error",error);
  }
}