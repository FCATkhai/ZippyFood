import express from "express";
import {
    getNotifications,
    createNotification,
    markAsRead,
    markAsReadAll,
    deleteNotification
} from "../controllers/notification.controller";
import { authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authorize(), getNotifications);
router.post("/", authorize(), createNotification);
router.patch("/:id/read", authorize(), markAsRead);
router.patch("/read-all", authorize(), markAsReadAll);
router.delete("/:id", authorize(), deleteNotification);

export default router;