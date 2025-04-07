import express, { Request, Response, NextFunction } from 'express';
// import upload from '../middleware/upload';
import { upload, uploadImageMiddleware } from '../middleware/upload';
import {
    getRestaurants,
    getRestaurantById,
    getRestaurant,
    updateRestaurant,
    deleteAllRestaurants,
    deleteRestaurant
} from '../controllers/restaurant.controller';
const router = express.Router();

import { authorize } from '../middleware/auth.middleware';
import { USER_GROUPS } from '../config/constants';
import { IUploadRequest } from '../config/interface';


router.get("/", getRestaurants);
router.get("/get-one", getRestaurant);
router.get("/:id", getRestaurantById);
router.patch("/:id", authorize(USER_GROUPS.OWNER_ADMIN),
    (req: Request, res: Response, next: NextFunction) => {
        (req as IUploadRequest).folderName = 'restaurant_thumbnail';
        (req as IUploadRequest).transformationOptions = { width: 480, height: 270, crop: 'fill' };
        next();
    },
    upload.single("file"), uploadImageMiddleware, updateRestaurant);
router.delete("/", authorize(USER_GROUPS.ADMIN_ONLY), deleteAllRestaurants);
router.delete("/:id", authorize(USER_GROUPS.OWNER_ADMIN), deleteRestaurant);

export default router;
