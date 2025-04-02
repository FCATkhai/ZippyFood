import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";

const router = express.Router();

router.get("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), getCart);
router.post("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), addToCart);
router.patch("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), updateCartItem);
router.delete("/:product_id", authorize(USER_GROUPS.CUSTOMER_ADMIN), removeFromCart);
router.delete("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), clearCart);

export default router;
