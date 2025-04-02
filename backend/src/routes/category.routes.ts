import express from "express";
import { createCategory, getCategoriesByRestaurant, updateCategory, deleteCategory } from "../controllers/category.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";

const router = express.Router();

router.post("/", authorize(USER_GROUPS.OWNER_ADMIN), createCategory);
router.get("/:restaurant_id", getCategoriesByRestaurant);
router.put("/:id", authorize(USER_GROUPS.OWNER_ADMIN), updateCategory);
router.patch("/:id", authorize(USER_GROUPS.OWNER_ADMIN), updateCategory);
router.delete("/:id", authorize(USER_GROUPS.OWNER_ADMIN), deleteCategory);

export default router;
