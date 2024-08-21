import type { Request, Response } from "express";
import prisma from "../db/db.js";
import bcryptjs from "bcrypt";
import generateToken from "../utils/generateToken.js";
import { uploadProfileImage } from "../cloudinary/cloudinaryfunction.js";

export const signup = async (req: Request, res: Response) => {
  try {
    console.log(req.body);
    console.log(req.file);

    const {
      email,
      fullname,
      username,
      password,
      gender,
    } = req.body;

    let Profile_Image: string | undefined = "";
    if(req.file){
      const result = await uploadProfileImage(req.file.path)
      Profile_Image = result?.secure_url;
    }

    if (
      !email ||
      !fullname ||
      !username ||
      !password ||
      !gender
    ) {
      return res.status(400).json({
        error: "Please fill in all fields",
      });
    }

    const user = await prisma.user.findUnique({ where: { username } });

    if (user) {
      return res.status(400).json({ error: "Username already exists" });
    }
    const salt = await bcryptjs.genSalt(10);
    const hashedPassword = await bcryptjs.hash(password, salt);

    const defaultImagePlaceholder = "/useProfileImage.png";

    const profilePic =  defaultImagePlaceholder;

    const newUser = await prisma.user.create({
      data: {
        email,
        fullname,
        username,
        password: hashedPassword,
        gender,
        userProfilePic: Profile_Image || profilePic,
      },
    });

    if (newUser) {
      generateToken(String(newUser.id));

      res.status(201).json({
        id: newUser.id,
        fullname: newUser.fullname,
        username: newUser.username,
        gender: newUser.gender,
        profilePic: newUser.userProfilePic,
      });
    } else {
      res.status(400).json({
        error: "Invalid user Data",
      });
    }
  } catch (error) {
    res.status(500).json({ error: "Internal Server Error" });
    console.log("Error in Signup Controller", error);
  }
};

export const login = async (req: Request, res: Response) => {
  try {
    const { username, password } = req.body;
    const user = await prisma.user.findUnique({ where: { username } });
    if (!user) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }
    const isPasswordCorrect = await bcryptjs.compare(password, user.password);

    if (!isPasswordCorrect) {
      return res.status(400).json({ error: "Invalid Credentials" });
    }

    const token = generateToken(String(user.id));

    res.status(200).json({
      message: "Logged-In Successfully",
      id: user.id,
      email: user.email,
      fullname: user.fullname,
      username: user.username,
      profilePic: user.userProfilePic,
      token,
    });
  } catch (error) {
    console.log("Error in Login", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

export const logout = async (req: Request, res: Response) => {
  try {
    res.cookie("jwt", "", { maxAge: 0 });
    res.status(200).json({ message: "Logged-Out Successfully" });
  } catch (error) {
    console.log("Error Logout", error);
    res.status(500).json({ Error: error });
  }
};

export const getMe = async (req: Request, res: Response) => {
  try {
    const user = await prisma.user.findUnique({ where: { id: req.user.id },
      include: {
        posts: {
          select: {
            media: true
          }
        },        
        followers: {
          select: {
            follower: true
          }
        },   
        following: {
          select: {
            following: true
          }
        }   
    }, 
  });
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    res.status(200).json({
      message: "Hey its me Logged-In User",
      user,
    });
  } catch (error) {
    console.log("Error in fetching get me controller", error);
  }
};

export const getAllUsers = async (req: Request, res: Response) => {
  try {
    const loggedInUserId = req.user.id; 
    console.log("loggedUserId",loggedInUserId)
    const userData = await prisma.user.findMany({
      where: {
        id: {
          not: loggedInUserId,
        }
      }
    });
    if (userData) {
      res.status(200).json({
        message: "All Users Fetched Successfully",
        data: userData,
      });
    }
  } catch (error) {
    console.log("Error in fetching all users", error);
    return res.status(500).json({
      message: error,
    })
  }
};

export const SearchAllUsers = async (req: Request, res: Response) => {
  try {
    const getUser = req.params.username;
    console.log(getUser);
    const user = await prisma.user.findUnique({ where: { username: getUser } });
    if (!user) {
      return res.status(404).json({ error: "User Not Found" });
    }

    res.status(200).json({
      message: "Hey its me",
      id: user.id,
      fullname: user.fullname,
      username: user.username,
      ProfilePic: user.userProfilePic,
    });
  } catch (error) {
    console.log("Error in fetching get me controller", error);
  }
};

export const UpdateUserProfile = async (req: Request, res: Response) => {
  const userId = req.user.id;

  try {
    const { email, username, fullname, password, userProfilePic, gender } =
      req.body;
    const updateData: { [key: string]: any } = {};

    // Only add fields to updateData if they are provided in the request body
    if (email) updateData.email = email;
    if (username) updateData.username = username;
    if (fullname) updateData.fullname = fullname;
    if (userProfilePic) updateData.userProfilePic = userProfilePic;
    if (gender) updateData.gender = gender;

    // If password is provided, hash it before saving
    if (password) {
      const salt = await bcryptjs.genSalt(10);
      updateData.password = await bcryptjs.hash(password, salt);
    }

    // Update the user record in the database
    const user = await prisma.user.update({
      where: { id: userId },
      data: updateData,
    });

    res.status(200).json({
      message: "Profile updated successfully",
      user,
    });
  } catch (error) {
    console.log("Error in Updating Profile", error);
    return res.status(500).json({
      message: error,
    });
  }
};

export const deleteUserProfile = async(req: Request,res: Response) => {
    const userId = req.user.id;

    try {
      await prisma.follow.deleteMany({
        where: {
          followerId: userId,
        },
      });
  
      // Delete the users the user is following
      await prisma.follow.deleteMany({
        where: {
          followingId: userId,
        },
      });

      // Delete the messages sent by the user
      await prisma.message.deleteMany({
        where: {
          senderId: userId,
        },
      });

      // Delete the messages received by the user
      await prisma.message.deleteMany({
        where: {
          receiverId: userId,
        },
      });

      // Delete the media associated with the user's posts
      await prisma.media.deleteMany({
        where: {
          post: {
            userId: userId,
          },
        },
      });

    // Delete the notifications associated with the user
    await prisma.notification.deleteMany({
      where: {
        userId: userId,
      },
    });

        // Delete the likes on the user's posts
      await prisma.like.deleteMany({
      where: {
        post: {
          userId: userId,
        },
      },
      });

      // Delete the comments on the user's posts
      await prisma.comment.deleteMany({
        where: {
          post: {
          userId: userId,
          },
      },
    });

      // Delete the posts made by the user
      await prisma.post.deleteMany({
        where: {
          userId: userId,
        },
      });

      // Delete the user
      const userData = await prisma.user.delete({
        where: { id: userId },
      });

      return res.status(200).json({
       message: "Profile deleted successfully",
      });
    } catch (error) {
        console.log("Error in Deleting Profile",error)
        return res.status(500).json({
            message: error, 
        })
    }
}