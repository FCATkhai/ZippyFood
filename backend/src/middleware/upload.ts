import { v2 as cloudinary } from "cloudinary";
import dotenv from "dotenv";
import { NextFunction, Response } from "express";
import { IUploadRequest } from "../config/interface";
import multer from 'multer';
import fs from "fs";

dotenv.config();

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './uploads/'); // Temporary storage folder
    },
    filename: (req, file, cb) => {
        cb(null, `${Date.now()}-${file.originalname}`); // Unique filename
    },
});
const upload = multer({ storage });


const cloudinaryUploadImage = async (filePath: string, folderName: string) => {
    return await cloudinary.uploader.upload(
        filePath,
        {
            folder: `ZippyFood/${folderName}`,
            resource_type: "auto",
            transformation: [{ width: 500, height: 500, crop: "limit" }],
        },
    )
};

// Middleware to upload a single image
// before upload must declare upload.single('file') in route and folderName in req
// uploaded image url will be stored in req.file.path
const uploadImageMiddleware = async (req: IUploadRequest, res: Response, next: NextFunction) => {
    try {
        if (req.file) {
            const filePath = req.file.path;
            const folderName = req.folderName || "default";
            const uploader = (path: string) => cloudinaryUploadImage(path, folderName);
            const uploadResult = await uploader(filePath);
            fs.unlinkSync(filePath);
            req.file.path = uploadResult.secure_url;
        } else {
            res.status(400);
            throw new Error("File not found");
        }

        next();
    } catch (error) {
        next(error);
    }
};

// Middleware to upload multiple images
// before upload must declare upload.fields([...]) in route and folderName in req
// example: paste to app.ts
// import { upload, uploadMultipleImagesMiddleware } from './middleware/upload';

// const uploadFields = upload.fields([
//     { name: 'avatar', maxCount: 1 }, // Single avatar image
//     { name: 'cover', maxCount: 1 },  // Single cover image
//     // Add more fields as needed, e.g., { name: 'gallery', maxCount: 10 }
// ]);
// import { Response, NextFunction } from 'express';
// import { IUploadRequest } from './config/interface';
// app.post('/upload/profile', (req: IUploadRequest, res: Response, next: NextFunction) => {
//     req.folderName = 'profile_pics';
//     next();
// }, uploadFields, uploadMultipleImagesMiddleware, (req: IUploadRequest, res: Response) => {
//     console.log(req.files);
//     console.log(req.imageUrls);
//     if (req.imageUrls) {
//         res.json({ imageUrls: req.imageUrls });
//     } else {
//         res.status(400).json({ error: 'No images provided' });
//     }
// });
// app.post('/upload', (req: CustomRequest, res: Response, next: NextFunction) => {
//     req.folderName = req.body.folderName || req.query.folderName || 'default';
//     next();
//   }, uploadFields, uploadImagesMiddleware, (req: CustomRequest, res: Response) => {
//     if (req.imageUrls) {
//       res.json({ imageUrls: req.imageUrls });
//     } else {
//       res.status(400).json({ error: 'No images provided' });
//     }
//   });

const uploadMultipleImagesMiddleware = async (req: IUploadRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
        const folderName = req.folderName || 'default';
        const uploader = (filePath: string) => cloudinaryUploadImage(filePath, folderName);

        if (req.files && typeof req.files === 'object') {
            const uploadPromises: Promise<{ fieldname: string; url: string }>[] = [];

            // Iterate over each field name (e.g., 'avatar', 'cover')
            for (const fieldname in req.files) {
                const files = req.files[fieldname]; // Array of files for this field
                files.forEach((file) => {
                    uploadPromises.push(
                        uploader(file.path).then((uploadResult) => {
                            // Cleanup after upload
                            fs.unlinkSync(file.path);
                            return { fieldname, url: uploadResult.secure_url };
                        })
                    );
                });
            }

            const results = await Promise.all(uploadPromises);
            req.imageUrls = {};
            for (const { fieldname, url } of results) {
                req.imageUrls[fieldname] = url;
            }
        }

        next();
    } catch (error) {
        // Cleanup on error
        if (req.files && typeof req.files === 'object') {
            for (const fieldname in req.files) {
                const files = req.files[fieldname];
                files.map((file) => fs.unlinkSync(file.path));
            }
        }
        next(error);
    }
};

// req.files example:
// [Object: null prototype] {
//     avatar: [
//       {
//         fieldname: 'avatar',
//         originalname: 'Screenshot 2025-01-15 122542.jpg',
//         encoding: '7bit',
//         mimetype: 'image/jpeg',
//         destination: './uploads/',
//         filename: '1741342926241-Screenshot 2025-01-15 122542.jpg',
//         path: 'uploads\\1741342926241-Screenshot 2025-01-15 122542.jpg',
//         size: 92840
//       }
//     ],
//     cover: [
//       {
//         fieldname: 'cover',
//         originalname: 'Screenshot 2025-01-06 131907.jpg',
//         encoding: '7bit',
//         mimetype: 'image/jpeg',
//         destination: './uploads/',
//         filename: '1741342926243-Screenshot 2025-01-06 131907.jpg',
//         path: 'uploads\\1741342926243-Screenshot 2025-01-06 131907.jpg',
//         size: 23804
//       }
//     ]
//   }

export { upload, uploadImageMiddleware, uploadMultipleImagesMiddleware };
