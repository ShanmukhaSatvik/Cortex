import { Router } from "express";
import * as schoolController from "../controllers/school.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRoles } from "../middleware/role.js";

const router = Router();

router.use(authenticate, requireRoles("PLATFORM_ADMIN"));

router.get("/", schoolController.list);
router.post("/", schoolController.create);
router.patch("/:id/active", schoolController.setActive);
router.post("/:id/school-admin", schoolController.assignAdmin);

export default router;
