import express from 'express';
import uploadController from "../controllers/upload.controller";

import upload from "../middleware/upload";
import { Request, Response } from "express";

const router = express.Router();



// router.post("/", uploadController.uploadFiles);
router.post('/', uploadController.uploadFiles);
router.get("/files", uploadController.getListFiles);
router.get("/files/:name", uploadController.download);



export default router;