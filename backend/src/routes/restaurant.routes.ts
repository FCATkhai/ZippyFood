import express from 'express';
// import upload from '../middleware/upload';
import { upload, uploadImageMiddleware } from '../middleware/upload';
import { createRestaurant, getRestaurants } from '../controllers/restaurant.controller';
const router = express.Router();

import { authorize } from '../middleware/auth.middleware';
import { USER_GROUPS } from '../config/constants';

// const { protect, admin } = require('../middleware/auth');

// router.post('/',authenticateUser, upload.single("file"), createRestaurant);
// router.post('/', upload.single("file"), createRestaurant);




router.get('/', getRestaurants);
router.post('/', authorize(USER_GROUPS.ADMIN_ONLY), upload.single('file'), uploadImageMiddleware, createRestaurant);

export default router;
