import express, { Request, Response, NextFunction } from "express";
import {
    createReview,
    getReviews,
    getReviewById,
    updateReview,
    deleteReview
} from "../controllers/review.controller";
import { authorize } from "../middleware/auth.middleware";
import { upload, uploadImageMiddleware } from '../middleware/upload';
import { IUploadRequest } from '../config/interface';


const router = express.Router();

router.post("/", authorize(),
    (req: Request, res: Response, next: NextFunction) => {
        (req as IUploadRequest).folderName = 'review_image';
        (req as IUploadRequest).transformationOptions = { width: 700, height: 700, crop: 'limit' };
        next();
    },
    upload.single("file"), uploadImageMiddleware, createReview);

router.get("/:id", getReviewById);
router.get("/", getReviews);

router.patch("/:id", authorize(),
    (req: Request, res: Response, next: NextFunction) => {
        (req as IUploadRequest).folderName = 'review_image';
        (req as IUploadRequest).transformationOptions = { width: 700, height: 700, crop: 'limit' };
        next();
    },
    upload.single("file"), uploadImageMiddleware, updateReview);

router.delete("/:id", authorize(), deleteReview);

export default router;
