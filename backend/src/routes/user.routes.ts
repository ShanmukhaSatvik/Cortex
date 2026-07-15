import { Router } from "express";
import * as userController from "../controllers/user.controller.js";
import { authenticate } from "../middleware/auth.js";
import { requireRoles } from "../middleware/role.js";

const router = Router();

router.use(authenticate, requireRoles("SCHOOL_ADMIN"));

router.get("/teachers", userController.listTeachers);
router.post("/teachers", userController.createTeacher);
router.get("/students", userController.listStudents);
router.post("/students", userController.createStudent);

export default router;
