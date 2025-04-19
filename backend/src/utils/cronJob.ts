/* eslint-disable @typescript-eslint/no-explicit-any */
import cron from 'node-cron';
import ReportService from '../services/report.service';
import Restaurant from '../models/Restaurant.model';
import winston from 'winston';

// Logger setup
const logger = winston.createLogger({
    level: 'info',
    format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json()
    ),
    transports: [
        new winston.transports.File({ filename: 'logs/cron.log' }),
        new winston.transports.Console()
    ]
});

// Function to generate stats for all merchants and admin
export const generateStats = async () => {
    try {
        // Generate merchant stats for all restaurants
        const restaurants = await Restaurant.find().select('_id');
        await Promise.all(restaurants.map(restaurant =>
            ReportService.getMerchantStats(restaurant._id)
                .catch(error => {
                    logger.error(`Error for restaurant ${restaurant._id}: ${error.message}`);
                })
        ));
        // for (const restaurant of restaurants) {
        //     try {
        //         await ReportService.getMerchantStats(restaurant._id);
        //         logger.info(`Merchant stats generated for restaurant ${restaurant._id}`);
        //     } catch (error: any) {
        //         logger.error(`Error generating merchant stats for restaurant ${restaurant._id}: ${error.message}`);
        //     }
        // }

        // Generate admin stats
        await ReportService.getAdminStats();
        logger.info('Admin stats generated successfully');
    } catch (error: any) {
        logger.error(`Error generating stats: ${error.message}`);
    }
};

// Schedule cron jobs
export const startCronJobs = () => {
    // Daily at midnight
    cron.schedule('0 0 * * *', async () => {
        logger.info('Running daily stats cron job...');
        await generateStats();
    });

    // Monthly on the 1st at midnight
    cron.schedule('0 0 1 * *', async () => {
        logger.info('Running monthly stats cron job...');
        await generateStats();
    });

    logger.info('Cron jobs initialized.');
};