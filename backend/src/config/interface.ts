import { Request } from "express";

export interface IUploadRequest extends Request {
    file?: Express.Multer.File;
    files?: { [fieldname: string]: Express.Multer.File[] };
    imageUrls?: Record<string, string>;
    folderName: string;
    transformationOptions?: { width: number; height: number; crop: string };
}