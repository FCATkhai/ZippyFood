import express from "express";
import { createProduct, 
    getProductsByRestaurant, 
    updateProduct, 
    deleteProduct, 
    getProductsGroupedByCategory
} from "../controllers/product.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";
import { upload, uploadImageMiddleware } from '../middleware/upload';

const router = express.Router();

router.post("/", authorize(USER_GROUPS.OWNER_ADMIN), upload.single("file"), uploadImageMiddleware, createProduct);
router.get("/grouped/:restaurant_id", getProductsGroupedByCategory);
router.get("/:restaurant_id", getProductsByRestaurant);
router.patch("/:id", authorize(USER_GROUPS.OWNER_ADMIN), updateProduct);
router.delete("/:id", authorize(USER_GROUPS.OWNER_ADMIN), deleteProduct);

export default router;
