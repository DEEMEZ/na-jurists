import { Router } from "express";
import { Role } from "@prisma/client";
import { requireAuth, requireRole } from "../middleware/auth.js";
import { adminPortalRouter } from "./admin.portal.routes.js";
import { casesSharedRouter } from "./cases.shared.routes.js";
import { mePortalRouter } from "./me.portal.routes.js";

const router = Router();

router.get(
  "/admin/ping",
  requireAuth,
  requireRole(Role.ADMIN),
  (_req, res) => {
    res.json({ scope: "admin", message: "Admin access granted" });
  },
);

router.get(
  "/client/ping",
  requireAuth,
  requireRole(Role.CLIENT),
  (_req, res) => {
    res.json({ scope: "client", message: "Client access granted" });
  },
);

router.use("/admin", adminPortalRouter);
router.use("/me", mePortalRouter);
router.use("/cases", casesSharedRouter);

export { router as apiRouter };
