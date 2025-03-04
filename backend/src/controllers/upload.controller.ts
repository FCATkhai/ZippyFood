// Xử lý upload file
import dotenv from "dotenv";
import upload from "../middleware/upload";
import {dbConfig} from "../config/db";
import {Request, Response} from "express";

const MongoClient = require("mongodb").MongoClient;
const GridFSBucket = require("mongodb").GridFSBucket;


dotenv.config();

const baseUrl = "http://localhost:5000/api/uploads/files/";

const mongoClient = new MongoClient(process.env.MONGO_URI);

const uploadFiles = async (req: Request, res: Response) => {
    try {
        await upload(req, res);
        // console.log(req.file);

        if (req.file.length <= 0) {
            return res
                .status(400)
                .send({ message: "You must select at least 1 file." });
        }

        return res.status(200).send({
            message: "Files have been uploaded.",
        });

        // console.log(req.file);

        // if (req.file == undefined) {
        //   return res.send({
        //     message: "You must select a file.",
        //   });
        // }

        // return res.send({
        //   message: "File has been uploaded.",
        // });
    } catch (error) {
        console.log(error);

        if (error.code === "LIMIT_UNEXPECTED_FILE") {
            return res.status(400).send({
                message: "Too many files to upload.",
            });
        }
        return res.status(500).send({
            message: `Error when trying upload many files: ${error}`,
        });

        // return res.send({
        //   message: "Error when trying upload image: ${error}",
        // });
    }
};

const getListFiles = async (req: Request, res: Response) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const images = database.collection(dbConfig.imgBucket + ".files");

        const cursor = images.find({});

        if ((await cursor.count()) === 0) {
            return res.status(500).send({
                message: "No files found!",
            });
        }

        const fileInfos = [];
        await cursor.forEach((doc) => {
            fileInfos.push({
                name: doc.filename,
                url: baseUrl + doc.filename,
            });
        });

        return res.status(200).send(fileInfos);
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};

const download = async (req: Request, res: Response) => {
    try {
        await mongoClient.connect();

        const database = mongoClient.db(dbConfig.database);
        const bucket = new GridFSBucket(database, {
            bucketName: dbConfig.imgBucket,
        });

        const downloadStream = bucket.openDownloadStreamByName(req.params.name);

        downloadStream.on("data", function (data) {
            return res.status(200).write(data);
        });

        downloadStream.on("error", function (err) {
            return res.status(404).send({ message: "Cannot download the Image!" });
        });

        downloadStream.on("end", () => {
            return res.end();
        });
    } catch (error) {
        return res.status(500).send({
            message: error.message,
        });
    }
};

export default {
    uploadFiles,
    getListFiles,
    download,
};