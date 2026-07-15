import { Router } from "express";
import * as contentController from "../controllers/content.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRoles } from "../middleware/role.js";
import { upload } from "../config/multer.js";

const router = Router();

router.get(
  "/",
  authenticate,
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  contentController.list
);

router.get(
  "/media/:contentId",
  authenticate,
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT"),
  contentController.media
);

router.post(
  "/",
  authenticate,
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  upload.single("file"),
  contentController.create
);

router.delete(
  "/:id",
  authenticate,
  requireRoles("SCHOOL_ADMIN", "TEACHER"),
  contentController.remove
);

export default router;
