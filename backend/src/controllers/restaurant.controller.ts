import { Request, Response, NextFunction } from 'express';
import Restaurant from '../models/Restaurant.model';


export const createRestaurant = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
        if (!req.user) {
            res.status(403);
            throw new Error('Unauthorized');
        }
        const { name, address } = req.body;
        const thumbnailUrl = req.file?.path;

        const restaurant = new Restaurant({
            name: name,
            owner_id: req.user._id,
            thumbnail: thumbnailUrl,
            location: {
                address: address
            }
        });

        await restaurant.save();
        res.status(201).json({ success: true, data: restaurant });
    } catch (error) {
        next(error);
    }
};

export const getRestaurants = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const restaurants = await Restaurant.find();
        res.status(200).json({ success: true, data: restaurants });
    } catch (error) {
        next(error);
    }
};


// export const deleteRestaurant = async (req: Request, res: Response) => {
//     const { id } = req.params;
//     const restaurant = await Restaurant.findById(id);
//     if (!restaurant) {
//         res.status(404);
//         throw new Error('Not found');
//     }

//     // Lấy public_id từ URL Cloudinary để xóa ảnh
//     const imageUrl = restaurant.thumbnail;
//     const publicId = imageUrl.split('/').pop()?.split('.')[0];

//     await cloudinary.uploader.destroy(`restaurants/${publicId}`);

//     await restaurant.deleteOne();
//     res.json({ success: true, message: 'Nhà hàng đã bị xóa' });
// };
