import express from 'express';
import cookiesParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';

import router from './routes/index.routes';
import { errorHandler } from './middleware/error.middleware';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookiesParser());

app.use('/api', router);

// Use Middleware
app.use(errorHandler);

export default app;