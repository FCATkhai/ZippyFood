import express from 'express';
import cookiesParser from 'cookie-parser';
import cors from 'cors';
import dotenv from 'dotenv';
import router from './routes/index.routes';
import { errorHandler } from './middleware/error.middleware';
import { startCronJobs, generateStats } from './utils/cronJob';

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());
app.use(cookiesParser());

app.use('/api', router);

// Generate report daily and monthly
startCronJobs();

// route to manually trigger stats generation
app.get('/api/debug/generate-stats', async (req, res) => {
    await generateStats();
    res.json({ message: 'Stats generation triggered manually' });
});

// Use Middleware
app.use(errorHandler);

export default app;