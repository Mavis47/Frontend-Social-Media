import express from "express";
import { followUser, getAllReceivedRequest, respondToFollowRequest } from "../controllers/follow.controller.js";
const router  = express.Router();

router.post('/userToFollow',followUser)
router.post('/responseToRequest',respondToFollowRequest)
router.get("/getAllRequest",getAllReceivedRequest)


export default router;

