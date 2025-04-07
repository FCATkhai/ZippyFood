import express from "express";
import { getCart, addToCart, updateCartItem, removeFromCart, clearCart } from "../controllers/cart.controller";
import { authorize } from "../middleware/auth.middleware";

const router = express.Router();

router.get("/", authorize(), getCart);
router.post("/", authorize(), addToCart);
router.patch("/", authorize(), updateCartItem);
router.delete("/:product_id", authorize(), removeFromCart);
router.delete("/", authorize(), clearCart);

export default router;
