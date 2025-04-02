import express from 'express';
// import upload from '../middleware/upload';
import { upload, uploadImageMiddleware } from '../middleware/upload';
import { 
    getRestaurants, 
    getRestaurantById, 
    updateRestaurant,
    deleteAllRestaurants,
    deleteRestaurant
} from '../controllers/restaurant.controller';
const router = express.Router();

import { authorize } from '../middleware/auth.middleware';
import { USER_GROUPS } from '../config/constants';


router.get("/", getRestaurants);
router.get("/:id", getRestaurantById);
router.patch("/:id", authorize(USER_GROUPS.OWNER_ADMIN), upload.single("file"), uploadImageMiddleware, updateRestaurant);
router.delete("/", authorize(USER_GROUPS.ADMIN_ONLY), deleteAllRestaurants);
router.delete("/:id", authorize(USER_GROUPS.OWNER_ADMIN), deleteRestaurant);

export default router;
