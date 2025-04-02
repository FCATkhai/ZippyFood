import express from "express";
import {
    createOrder,
    getOrdersByUser,
    getOrdersByRestaurant,
    updateOrderStatus
} from "../controllers/order.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";

const router = express.Router();

router.post("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), createOrder);
router.get("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), getOrdersByUser);
router.get("/restaurant/:restaurant_id", authorize(USER_GROUPS.OWNER_ADMIN), getOrdersByRestaurant);
router.patch("/:id", authorize(USER_GROUPS.OWNER_ADMIN), updateOrderStatus);

export default router;
