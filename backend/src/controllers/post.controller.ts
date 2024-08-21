import type { Request, Response } from "express";
import prisma from "../db/db";
import { uploadImage, uploadVideo } from "../cloudinary/cloudinaryfunction";
import { MediaType } from "@prisma/client";
import mime from "mime-types";

export const addPost = async (req: Request, res: Response) => {
  try {
    const { content } = req.body;
    const userId = req.user.id;

    let mediaData = [];
    if (req.file) {
      const filePath = req.file.path;
      const mimeType = req.file.mimetype;
      console.log("MIME Type:", mimeType);
      let result;

      if (mimeType && mimeType.startsWith("image/")) {
        result = await uploadImage(filePath);
      } else if (mimeType && mimeType.startsWith("video/")) {
        result = await uploadVideo(filePath);
      } else {
        throw new Error("Unsupported file type");
      }

      const postImage = result?.secure_url;
      const mediaType = mimeType?.startsWith("image/")
        ? MediaType.IMAGE
        : MediaType.VIDEO;

      mediaData.push({
        url: postImage!,
        type: mediaType,
      });
    }

    const postData = await prisma.post.create({
      data: {
        content,
        userId: userId,
        media: {
          create: mediaData,
        },
      },
      include: {
        media: true,
      },
    });

    if (postData) {
      return res.status(201).json({
        message: "Post created successfully",
        post: postData,
      });
    }
  } catch (error) {
    console.log("Error In Adding Post", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const deletePost = async (req: Request, res: Response) => {
  const userId = req.user.id;
  const postId = parseInt(req.params.id);

  try {

    // Delete related media, likes, and comments first
    await prisma.media.deleteMany({
      where: { postId: postId },
    });

    await prisma.like.deleteMany({
      where: { postId: postId },
    });

    await prisma.comment.deleteMany({
      where: { postId: postId },
    });

    await prisma.post.delete({
      where: {
        id: postId,
      },
    });
    res.status(201).json("Post Deleted Successfully")
    
  } catch (error) {
    console.log("Error In delete post", error);
    res.status(500).json({
      message: error,
    });
  }
};

export const fetchPost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id);
  const postData = await prisma.post.findUnique({
    where: { id: postId },
    include: { media: true, user: true },
  });

  if (postData) {
    return res.status(200).json({
      message: "Post Fetched",
      postData,
    });
  }
};

export const fetchAllPost = async (req: Request, res: Response) => {
  const postData = await prisma.post.findMany({
    include: { 
      media: true,
      user: true,
      likes: true,
      comments: {
        include: {
          user: true,
        } 
      },
  }})

  if (postData) {
    return res.status(200).json({
      message: "Post Fetched",
      postData,
    });
  }
};

export const likePost = async (req: Request, res: Response) => {
  const postId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    // Check if the like already exists
    const existingLike = await prisma.like.findUnique({
      where: {
        userId_postId: {
          postId,
          userId,
        },
      },
    });

    if (existingLike) {
      // Unlike the post
      await prisma.like.delete({
        where: {
          id: existingLike.id,
        },
      });
    } else {
      // Like the post
      await prisma.like.create({
        data: {
          user: { connect: { id: userId } },
          post: { connect: { id: postId } },
        },
      });
    }

    
    
    // Fetch updated post data with like count
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { likes: true,user: true },
    });

    console.log("Post",post?.likes.length);

    // Fetch the username of the user who liked the post
    const likingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { username: true },
    });
    console.log("LIking user :-",likingUser);


    if (post && likingUser) {
      const notification = await prisma.notification.create({
        data: {
          userId: post.user.id, // Notify the post owner
          message: `${likingUser.username} liked your post`,
        },
      });

      if (post.likes.length === 0) {
        await prisma.notification.deleteMany({
          where: {
            userId: post.user.id, // Post owner's ID
            message: `${likingUser.username} Disliked your post`,
          },
        });
      }

      const io = req.app.get("socketio");
      // Emit the notification via Socket.IO
      io.emit("notification", notification);
    }

    res.json(post);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const AddComment = async (req: Request, res: Response) => {
  const { comment_content } = req.body;
  const postId = parseInt(req.params.id);
  const userId = req.user.id;

  try {
    const comment_data = await prisma.comment.create({
      data: {
        comment_content,
        post: { connect: { id: postId } },
        user: { connect: { id: userId } },
      },
    });

    // Fetching updated post data with comments
    const post = await prisma.post.findUnique({
      where: { id: postId },
      include: { comments: 
        {
          include: {
            user: true
          }
        },
        user: true 
      },
    });
    
    res.status(201).json(post);
  } catch (error) {
    res.status(500).json({ message: error });
  }
};

export const deleteComment = async (req: Request, res: Response) => {
  const commentId = parseInt(req.params.id);
  const userId = req.user.id;

  console.log(`Deleting comment with ID: ${commentId} by user ID: ${userId}`);

  try {
    const comment = await prisma.comment.findUnique({
      where: { id: commentId },
    });

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId !== userId) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this comment" });
    }

    await prisma.comment.delete({
      where: {
        id: commentId,
      },
    });
    res.status(200).json({ message: "Comment deleted successfully" });
  } catch (error) {
    console.log("Error In Comment", error);
  }
};
