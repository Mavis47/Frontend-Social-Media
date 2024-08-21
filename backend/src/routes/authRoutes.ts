import express from "express";
import { deleteUserProfile, getAllUsers, getMe, login, logout, SearchAllUsers, signup } from "../controllers/auth.controller.js";
import { protectRoutes } from "../middleware/authMiddleware.js";
import { UpdateUserProfile } from './../controllers/auth.controller';
import multer from "multer";

const router  = express.Router();

const upload = multer({
    storage: multer.diskStorage({
})})

router.get('/getMe',protectRoutes,getMe)
router.get("/allUsers",protectRoutes,getAllUsers)
router.get("/searchAllUsers/:username",protectRoutes,SearchAllUsers)
router.post("/login",login)
router.post("/signup",upload.single('Profile_Image'),signup)
router.post("/logout",logout) 
router.put("/updateProfile",upload.single('Profile_Image'),protectRoutes,UpdateUserProfile)
router.delete("/deleteProfile",protectRoutes,deleteUserProfile)

export default router;