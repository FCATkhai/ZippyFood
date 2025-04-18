import express from "express";
import userRoutes from './user.routes';
import restaurantApplicationRoutes from './restaurantApplication.routes';
import restaurantRoutes from './restaurant.routes';
import categoryRoutes from './category.routes';
import productRoutes from './product.routes';
import cartRoutes from './cart.routes';
import orderRoutes from './order.routes';
import notificationRoutes from './notification.routes';
import reviewRoutes from './review.routes';
import reportRoutes from './report.routes';

const router = express.Router();

router.use('/users', userRoutes);
router.use('/restaurant-applications', restaurantApplicationRoutes);
router.use('/restaurants', restaurantRoutes);
router.use('/categories', categoryRoutes);
router.use('/products', productRoutes);
router.use('/cart', cartRoutes);
router.use('/orders', orderRoutes);
router.use('/notifications', notificationRoutes);
router.use('/reviews', reviewRoutes);
router.use('/stats', reportRoutes);

export default router;
