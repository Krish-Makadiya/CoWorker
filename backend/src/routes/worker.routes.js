import { Router } from "express";
import {
  listWorkers,
  loginWorker,
  registerWorker,
  updateWorker,
  deleteWorker,
  verifyWorker,
  registerWorkerByCooperative,
  getWorkerById,
} from "../controllers/worker.controller.js";
import {
  authenticateUser,
  requireRole,
} from "../middlewares/auth.middleware.js";

import {
  getWorkerOngoingServices,
  getWorkerPreviousServices,
} from "../controllers/serviceRequest.controller.js";

const router = Router();

router.get("/", authenticateUser, requireRole("cooperative"), listWorkers);
router.route("/register").post(registerWorker);
router.route("/login").post(loginWorker);
router
  .route("/register-by-cooperative")
  .post(
    authenticateUser,
    requireRole("cooperative"),
    registerWorkerByCooperative
  );
router
  .route("/:id/ongoing")
  .get(
    authenticateUser,
    requireRole("worker", "cooperative"),
    getWorkerOngoingServices
  );
router
  .route("/:id/ongoing-services")
  .get(
    authenticateUser,
    requireRole("worker", "cooperative"),
    getWorkerOngoingServices
  );
router
  .route("/:id/previous")
  .get(
    authenticateUser,
    requireRole("worker", "cooperative"),
    getWorkerPreviousServices
  );
router
  .route("/:id/previous-services")
  .get(
    authenticateUser,
    requireRole("worker", "cooperative"),
    getWorkerPreviousServices
  );
router
  .route("/:id")
  .get(authenticateUser, requireRole("worker", "cooperative"), getWorkerById)
  .put(authenticateUser, requireRole("cooperative"), updateWorker)
  .delete(authenticateUser, requireRole("cooperative"), deleteWorker);
router
  .route("/:id/verify")
  .patch(authenticateUser, requireRole("cooperative"), verifyWorker);

export default router;
