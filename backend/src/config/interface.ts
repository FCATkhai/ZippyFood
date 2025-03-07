import { Document, Types } from "mongoose";
import { Request } from "express";

// interface User
export interface IUser extends Document {
    name: string;
    email: string;
    password: string;
    phone: string;
    role: 'customer' | 'restaurant_owner' | 'admin';
    addresses?: string[];
    status?: 'active' | 'banned';
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

export interface IUploadRequest extends Request {
    file?: Express.Multer.File;
    files?: { [fieldname: string]: Express.Multer.File[] };
    imageUrls?: Record<string, string>;
    folderName: string;
}