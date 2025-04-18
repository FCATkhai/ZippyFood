import express from "express";
import {
    getAdminStats,
    getAdminCurrentStats,
    getAdminReportHistory
} from "../controllers/adminReport.controller";

import {
    getMerchantStats,
    getMerchantCurrentStats,
    getMerchantReportHistory
} from "../controllers/merchantReport.controller";
import { authorize } from "../middleware/auth.middleware";
import { USER_GROUPS } from "../config/constants";

const router = express.Router();
router.get("/admin/current", authorize(USER_GROUPS.ADMIN_ONLY), getAdminCurrentStats);
router.get("/admin/history", authorize(USER_GROUPS.ADMIN_ONLY), getAdminReportHistory);
router.get("/admin", authorize(USER_GROUPS.ADMIN_ONLY), getAdminStats);

router.get("/merchant/current", authorize(USER_GROUPS.RESTAURANT_OWNER), getMerchantCurrentStats);
router.get("/merchant/history", authorize(USER_GROUPS.RESTAURANT_OWNER), getMerchantReportHistory);
router.get("/merchant", authorize(USER_GROUPS.RESTAURANT_OWNER), getMerchantStats);
export default router;