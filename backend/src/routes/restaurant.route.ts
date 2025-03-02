import express from 'express';
import { createRestaurant, getRestaurants } from '../controllers/restaurant.controller';
const router = express.Router();
// const { protect, admin } = require('../middleware/auth');

router.post('/', createRestaurant);
router.get('/', getRestaurants);

export default router;
