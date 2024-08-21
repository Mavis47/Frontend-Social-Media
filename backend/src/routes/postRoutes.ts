import express from "express";
import { AddComment, addPost, deleteComment, deletePost, fetchAllPost, fetchPost, likePost } from "../controllers/post.controller";
import { protectRoutes } from "../middleware/authMiddleware";
import multer from "multer";

const router  = express.Router();

const upload = multer({
    storage: multer.diskStorage({
})})

router.post("/addPost",protectRoutes, upload.single('media'),addPost);
// add video route
// add image route
router.delete("/deletePost/:id",protectRoutes,deletePost)
router.get("/fetchPost/:id",protectRoutes, fetchPost);
router.get("/fetchAllPost",protectRoutes, fetchAllPost);
router.post("/likePost/:id",protectRoutes, likePost);
router.post("/CommentPost/:id",protectRoutes, AddComment);
router.delete("/deletecomment/:id",protectRoutes, deleteComment);

export default router;

