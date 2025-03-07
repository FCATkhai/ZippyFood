import express from 'express';
import cookiesParser from 'cookie-parser';
import dotenv from 'dotenv';

import userRoutes from './routes/user.routes';
import restaurantApplicationRoutes from './routes/restaurantApplication.routes';
import restaurantRoutes from './routes/restaurant.routes';

import cors from 'cors';

import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookiesParser());

app.use('/api/users', userRoutes);
app.use('/api/restaurant-applications', restaurantApplicationRoutes);
app.use('/api/restaurants', restaurantRoutes);


// Use Middleware
app.use(errorHandler);

export default app;