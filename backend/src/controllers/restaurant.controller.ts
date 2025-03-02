import { Request, Response } from 'express';
import mongoose from 'mongoose';
const Restaurant = require('../models/Restaurant');

export const createRestaurant = async (req: Request, res: Response) => {
    try {
        const { name, user_id } = req.body;
        const thumbnail = req.body.thumbnail || null;
        const restaurant = new Restaurant({
            name: name,
            owner_id: new mongoose.Types.ObjectId(user_id),
            thumbnail: thumbnail,
        });

        await restaurant.save();
        res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};

export const getRestaurants = async (req: Request, res: Response) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
        res.status(500).json({ success: false, message: (error as Error).message });
    }
};
