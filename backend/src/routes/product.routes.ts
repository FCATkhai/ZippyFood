import express, { Request, Response, NextFunction } from "express";
import {
    createProduct,
    getProductsByRestaurant,
    updateProduct,
    deleteProduct,
    getProductsGroupedByCategory
} from "../controllers/product.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";
import { upload, uploadImageMiddleware } from '../middleware/upload';
import { IUploadRequest } from '../config/interface';


const router = express.Router();

router.post("/", authorize(USER_GROUPS.RESTAURANT_OWNER),
    (req: Request, res: Response, next: NextFunction) => {
        (req as IUploadRequest).folderName = 'product_image';
        (req as IUploadRequest).transformationOptions = { width: 700, height: 700, crop: 'fill' };
        next();
    },
    upload.single("file"), uploadImageMiddleware, createProduct);

router.get("/grouped/:restaurant_id", getProductsGroupedByCategory);
router.get("/:restaurant_id", getProductsByRestaurant);

router.patch("/:id", authorize(USER_GROUPS.RESTAURANT_OWNER),
    (req: Request, res: Response, next: NextFunction) => {
        (req as IUploadRequest).folderName = 'product_image';
        (req as IUploadRequest).transformationOptions = { width: 700, height: 700, crop: 'fill' };
        next();
    },
    upload.single("file"), uploadImageMiddleware, updateProduct);

router.delete("/:id", authorize(USER_GROUPS.RESTAURANT_OWNER), deleteProduct);

export default router;
