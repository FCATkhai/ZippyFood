import express from "express";
import {
    getAdminStats,
    getAdminCurrentStats,
    getAdminReportHistory,
    deleteTodayAdminReports,
    deleteAllAdminReports
} from "../controllers/report/adminReport.controller";

import {
    getMerchantStats,
    getMerchantCurrentStats,
    getMerchantReportHistory,
    deleteAllMerchantReports,
    deleteTodayMerchantReports,
    deleteAllReports
} from "../controllers/report/merchantReport.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";

const router = express.Router();
router.get("/admin/current", authorize(USER_GROUPS.ADMIN_ONLY), getAdminCurrentStats);
router.get("/admin/history", authorize(USER_GROUPS.ADMIN_ONLY), getAdminReportHistory);
router.get("/admin", authorize(USER_GROUPS.ADMIN_ONLY), getAdminStats);
router.delete("/admin/today", authorize(USER_GROUPS.ADMIN_ONLY), deleteTodayAdminReports);
router.delete("/admin/all", authorize(USER_GROUPS.ADMIN_ONLY), deleteAllAdminReports);

router.get("/merchant/current/:restaurant_id", authorize(USER_GROUPS.OWNER_ADMIN), getMerchantCurrentStats);
router.get("/merchant/history/:restaurant_id", authorize(USER_GROUPS.OWNER_ADMIN), getMerchantReportHistory);
router.get("/merchant/:restaurant_id", authorize(USER_GROUPS.OWNER_ADMIN), getMerchantStats);
router.delete("/merchant/today/:restaurant_id", authorize(USER_GROUPS.ADMIN_ONLY), deleteTodayMerchantReports);
router.delete("/merchant/all/:restaurant_id", authorize(USER_GROUPS.ADMIN_ONLY), deleteAllMerchantReports);
router.delete("/merchant/all/", authorize(USER_GROUPS.ADMIN_ONLY), deleteAllReports);
export default router;