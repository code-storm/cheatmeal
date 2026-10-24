import { Router } from "express";
import adminAuthRoutes from "./adminAuth.routes";
import adminEventsRoutes from "./adminEvents.routes";
import adminRewardsRoutes from "./adminRewards.routes";
import adminBadgesRoutes from "./adminBadges.routes";
import adminUploadRoutes from "./adminUpload.routes";

// Each sub-router below self-prefixes its own paths (e.g. adminAuthRoutes
// defines "/auth/login", not "/admin/auth/login") - the "/api/admin"
// prefix is applied once at the mount point in index.ts, exactly like
// every other router in this app is mounted under "/api". Every router
// except adminAuthRoutes requires requireAdminAuth internally (see each
// file's own `router.use(requireAdminAuth)`).
const router = Router();

router.use(adminAuthRoutes);
router.use(adminEventsRoutes);
router.use(adminRewardsRoutes);
router.use(adminBadgesRoutes);
router.use(adminUploadRoutes);

export default router;
