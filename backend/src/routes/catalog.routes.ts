import { Router } from "express";
import * as catalogController from "../controllers/catalog.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRoles } from "../middleware/role.js";

const router = Router();

router.use(
  authenticate,
  requireRoles("SCHOOL_ADMIN", "TEACHER", "STUDENT")
);

router.get("/grades", catalogController.grades);
router.get("/classes/:gradeId", catalogController.classes);
router.get("/subjects", catalogController.subjects);
router.get("/chapters/:subjectId", catalogController.chapters);
router.get("/topics/:chapterId", catalogController.topics);

export default router;
