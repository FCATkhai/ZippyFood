import express from "express";
import { applyForRestaurant, getAllApplications, updateApplicationStatus } from "../controllers/restaurantApplication.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";

const router = express.Router();

router.post("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), applyForRestaurant);
router.get("/", authorize(USER_GROUPS.ADMIN_ONLY), getAllApplications);
router.patch("/:id", authorize(USER_GROUPS.ADMIN_ONLY), updateApplicationStatus);

export default router;