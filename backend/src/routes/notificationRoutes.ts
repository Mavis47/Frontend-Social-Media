import { Router } from "express";
import { createNotification, deleteNotification, getNotifications } from "../controllers/notification.controller";

const router = Router();

router.post("/", createNotification);
router.get("/:userId", getNotifications);
router.delete("/notification/:id", deleteNotification);

export default router;
