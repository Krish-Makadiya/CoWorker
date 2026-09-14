import { Router } from "express";
import {
  getCooperativeProfile,
  listCooperatives,
  getCooperativeNames,
  loginCooperative,
  registerCooperative,
  updateCooperativeProfile,
} from "../controllers/cooperative.controller.js";
import {
  authenticateUser,
  requireRole,
} from "../middlewares/auth.middleware.js";

const router = Router();

router.route("/").get(listCooperatives);
router.route("/names").get(getCooperativeNames);
router.route("/list-names").get(getCooperativeNames);
router.route("/register").post(registerCooperative);
router.route("/login").post(loginCooperative);

router
  .route("/profile")
  .get(authenticateUser, getCooperativeProfile)
  .put(authenticateUser, requireRole("cooperative"), updateCooperativeProfile);

export default router;
