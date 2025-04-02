// @ts-nocheck
import { Document, Types} from "mongoose";
import { Request } from "express";

// interface User
export interface IUser extends Document {
    _id: Types.ObjectId;
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'customer' | 'restaurant_owner' | 'admin';
    addresses: string[];
    status?: 'active' | 'banned';
    comparePassword(candidatePassword: string): Promise<boolean>;
}

// interface RestaurantApplication
export interface IRestaurantApplication extends Document {
    user_id: Types.ObjectId;
    restaurant_name: string;
    owner_name: string;
    phone: string;
    address: string;
    identify_document: string;
    business_license: string;
    food_safety_certificate: string;
    status: "pending" | "approved" | "rejected";
    createdAt: Date;
    updatedAt: Date;
}

// interface Restaurant
export interface ITimeSlot {
    start: string;
    end: string;
}

export interface IOpenHours {
    day: string;
    time_slots: ITimeSlot[];
}

export interface ICoordinates {
    lat: number;
    lng: number;
}

export interface ILocation {
    address: string;
    district: string;
    province: string;
    province_code: string;
    coordinates: ICoordinates;
}

export interface IRestaurant extends Document {
    owner_id: Types.ObjectId;
    name: string;
    thumbnail?: string;
    phone?: string;
    is_active: boolean;
    open_hours: IOpenHours[];
    rating?: number;
    createdAt: Date;
    location: ILocation;
}

// interface Category
export interface ICategory extends Document {
    restaurant_id: Types.ObjectId;
    name: string;
    description?: string;
}

// interface Product

export interface IProduct extends Document {
    restaurant_id: Types.ObjectId;
    name: string;
    description?: string;
    tags?: string[];
    image: string;
    price: number;
    discount?: number;
    final_price: number;
    status: "available" | "unavailable";
    rating?: number;
    category_id: Types.ObjectId;
}

// interface Cart
export interface ICartItem {
    product_id: Types.ObjectId | IProduct;
    name: string;
    quantity: number;
    price: number;
}

export interface ICart extends Document {
    customer_id: Types.ObjectId;
    items: ICartItem[];
}

// interface Order
export interface IOrder extends Document {
    customer_id: Types.ObjectId;
    restaurant_id: Types.ObjectId;
    products: {
        product_id: Types.ObjectId | IProduct;
        name: string;
        quantity: number;
        price: number;
        subtotal: number;
    }[];
    total_price: number;
    address: string;
    note?: string;
    status: "pending" | "processing" | "ordering" | "completed" | "cancelled";
    order_date: Date;
}

// notification interface
export interface INotification extends Document {
    user_id: mongoose.Types.ObjectId;
    title: string;
    content: string;
    url?: string;
    is_read: boolean;
    createdAt?: Date;
    updatedAt?: Date;
}

//-------------------------
export interface IErrorResponse {
    success: boolean,
    message: string
}


export interface IUploadRequest extends Request {
    file?: Express.Multer.File;
    files?: { [fieldname: string]: Express.Multer.File[] };
    imageUrls?: Record<string, string>;
    folderName: string;
}