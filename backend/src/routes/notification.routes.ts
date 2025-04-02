import express from "express";
import { getNotifications, createNotification, markAsRead, deleteNotification } from "../controllers/notification.controller";
import { authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authorize(), getNotifications);
router.post("/", authorize(), createNotification);
router.patch("/:id/read", authorize(), markAsRead);
router.delete("/:id", authorize(), deleteNotification);

export default router;