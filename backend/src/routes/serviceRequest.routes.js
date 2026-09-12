import { Router } from "express";
import {
  createServiceRequest,
  getMyServiceRequests,
  getAvailableServiceRequests,
  getServiceRequestById,
  uploadPrePhotos,
  uploadPostPhotos,
  acceptServiceRequest,
  startServiceRequest,
  completeServiceRequest,
  cancelServiceRequest,
} from "../controllers/serviceRequest.controller.js";
import {
  authenticateUser,
  requireRole,
} from "../middlewares/auth.middleware.js";
import { upload } from "../middlewares/multer.middleware.js";

const router = Router();

router
  .route("/")
  .post(authenticateUser, requireRole("customer"), createServiceRequest);

router
  .route("/my")
  .get(authenticateUser, requireRole("customer"), getMyServiceRequests);

router
  .route("/available")
  .get(authenticateUser, requireRole("worker"), getAvailableServiceRequests);

router
  .route("/:id")
  .get(
    authenticateUser,
    requireRole("customer", "worker"),
    getServiceRequestById
  );

router
  .route("/:id/pre-photos")
  .post(
    authenticateUser,
    requireRole("customer"),
    upload.array("photos"),
    uploadPrePhotos
  );

router
  .route("/:id/post-photos")
  .post(
    authenticateUser,
    requireRole("worker"),
    upload.array("photos"),
    uploadPostPhotos
  );

router
  .route("/:id/accept")
  .patch(authenticateUser, requireRole("worker"), acceptServiceRequest);

router
  .route("/:id/start")
  .patch(authenticateUser, requireRole("worker"), startServiceRequest);

router
  .route("/:id/complete")
  .patch(authenticateUser, requireRole("worker"), completeServiceRequest);

router
  .route("/:id/cancel")
  .patch(authenticateUser, requireRole("customer"), cancelServiceRequest);

export default router;
