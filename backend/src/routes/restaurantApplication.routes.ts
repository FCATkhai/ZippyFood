import express from "express";
import { 
    applyForRestaurant, 
    getAllApplications, 
    updateApplicationStatus,
    deleteApplication
} from "../controllers/restaurantApplication.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";
import { Request, Response, NextFunction } from "express";
import { IUploadRequest } from "../config/interface";
import {upload, uploadMultipleImagesMiddleware} from "../middleware/upload";
const router = express.Router();

const uploadFields = upload.fields([
    { name: 'identify_document', maxCount: 1 },
    { name: 'business_license', maxCount: 1 },
    { name: 'food_safety_certificate', maxCount: 1},
]);



router.post("/", authorize(USER_GROUPS.CUSTOMER_ADMIN), (req: Request, res: Response, next: NextFunction) => {
    (req as IUploadRequest).folderName = 'restaurant-application';
    next();
}, uploadFields, uploadMultipleImagesMiddleware, applyForRestaurant);
router.get("/", authorize(USER_GROUPS.ADMIN_ONLY), getAllApplications);
router.patch("/:id", authorize(USER_GROUPS.ADMIN_ONLY), updateApplicationStatus);
router.delete("/:id", authorize(USER_GROUPS.ADMIN_ONLY), deleteApplication);

export default router;