import util from "util";
import multer from "multer";
import dotenv from 'dotenv';
import { GridFsStorage } from "multer-gridfs-storage";

import { dbConfig } from "../config/db";

dotenv.config();

const mongoURI = process.env.MONGO_URI || "mongodb://localhost:27017/ZippyFood"

const storage = new GridFsStorage({
    url: mongoURI,
    file: (req, file) => {
        console.log('file:', file);
        const match = ["image/png", "image/jpeg"];

        if (match.indexOf(file.mimetype) === -1) {
            const filename = `${Date.now()}-${file.originalname}`;
            return filename;
        }

        return {
            bucketName: dbConfig.imgBucket,
            filename: `${Date.now()}-${file.originalname}`
        };
    }
});

// const uploadFiles = multer({ storage: storage }).array("file", 10);
const uploadFiles = multer({ storage: storage }).single("file");
const uploadFilesMiddleware = util.promisify(uploadFiles);
export default uploadFilesMiddleware;
