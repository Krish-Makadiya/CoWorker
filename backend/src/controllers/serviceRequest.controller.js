import { ServiceRequest } from "../models/serviceRequest.model.js";
import { Customer } from "../models/customer.model.js";
import { Worker } from "../models/worker.model.js";
import { Cooperative } from "../models/cooperative.model.js";
import { Service } from "../models/service.model.js";
import ExpressError from "../utils/ExpressError.js";
import { uploadToCloudinary } from "../services/cloudinary.service.js";
import {
  validateRequired,
  isValidObjectId,
  isValidGeoPoint,
  throwIfErrors,
  trim,
} from "../utils/validation.js";

const createServiceRequest = async (req, res) => {
  const customer = await Customer.findOne({ userId: req.user._id });
  if (!customer) {
    throw new ExpressError("Customer profile not found", 404);
  }

  const { serviceId, title, description, address, location, scheduledAt } =
    req.body;

  const errors = validateRequired(
    ["serviceId", "title", "description", "scheduledAt"],
    req.body
  );

  if (serviceId && !isValidObjectId(serviceId)) {
    errors.push("Invalid serviceId");
  }

  if (scheduledAt) {
    const scheduledDate = new Date(scheduledAt);
    if (isNaN(scheduledDate.getTime())) {
      errors.push("Invalid scheduledAt date format");
    }
  }

  const finalAddress = address ? trim(address) : customer.address;
  if (
    !finalAddress ||
    (typeof finalAddress === "string" && finalAddress.trim().length === 0)
  ) {
    errors.push("address is required");
  }

  const finalLocation = location !== undefined ? location : customer.location;
  if (!finalLocation || !isValidGeoPoint(finalLocation)) {
    errors.push(
      'location must be a valid GeoJSON Point: { type: "Point", coordinates: [lng, lat] }'
    );
  }

  throwIfErrors(errors);

  const service = await Service.findById(serviceId);
  if (!service) {
    throw new ExpressError("Service not found", 404);
  }

  const serviceRequest = await ServiceRequest.create({
    customerId: customer._id,
    serviceId,
    title: trim(title),
    description: trim(description),
    address: finalAddress,
    location: finalLocation,
    scheduledAt: new Date(scheduledAt),
    status: "open",
  });

  res.status(201).json({
    success: true,
    message: "Service request created successfully",
    serviceRequest,
  });
};

const getMyServiceRequests = async (req, res) => {
  const customer = await Customer.findOne({ userId: req.user._id });
  if (!customer) {
    throw new ExpressError("Customer profile not found", 404);
  }

  const serviceRequests = await ServiceRequest.find({
    customerId: customer._id,
  })
    .populate("serviceId")
    .populate({
      path: "workerId",
      populate: { path: "userId", select: "name email mobileNumber" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    serviceRequests,
  });
};

const getAvailableServiceRequests = async (req, res) => {
  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) {
    throw new ExpressError("Worker profile not found", 404);
  }

  const serviceRequests = await ServiceRequest.find({ status: "open" })
    .populate("serviceId")
    .populate({
      path: "customerId",
      populate: { path: "userId", select: "name email mobileNumber" },
    })
    .sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    serviceRequests,
  });
};

const getServiceRequestById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service request ID", 400);
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id)
    .populate("serviceId")
    .populate({
      path: "customerId",
      populate: { path: "userId", select: "name email mobileNumber" },
    })
    .populate({
      path: "workerId",
      populate: { path: "userId", select: "name email mobileNumber" },
    });

  if (!serviceRequest) {
    throw new ExpressError("Service request not found", 404);
  }

  let isAuthorized = false;

  if (req.user.roles.includes("customer")) {
    const customer = await Customer.findOne({ userId: req.user._id });
    if (
      customer &&
      serviceRequest.customerId &&
      serviceRequest.customerId._id.toString() === customer._id.toString()
    ) {
      isAuthorized = true;
    }
  }

  if (req.user.roles.includes("worker")) {
    const worker = await Worker.findOne({ userId: req.user._id });
    if (worker) {
      if (serviceRequest.status === "open") {
        isAuthorized = true;
      } else if (
        serviceRequest.workerId &&
        serviceRequest.workerId._id.toString() === worker._id.toString()
      ) {
        isAuthorized = true;
      }
    }
  }

  if (!isAuthorized) {
    throw new ExpressError("Access denied for this service request", 403);
  }

  res.status(200).json({
    success: true,
    serviceRequest,
  });
};

const uploadPrePhotos = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service request ID", 400);
  }

  const customer = await Customer.findOne({ userId: req.user._id });
  if (!customer) {
    throw new ExpressError("Customer profile not found", 404);
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) {
    throw new ExpressError("Service request not found", 404);
  }

  if (serviceRequest.customerId.toString() !== customer._id.toString()) {
    throw new ExpressError(
      "You are not authorized to modify this service request",
      403
    );
  }

  const files = req.files || (req.file ? [req.file] : []);
  if (!files || files.length === 0) {
    throw new ExpressError("No photos provided", 400);
  }

  const photoUrls = [];

  for (const file of files) {
    console.log(
      `[Cloudinary] Uploading: ${file.filename} (${file.size} bytes)`
    );

    const uploadRes = await uploadToCloudinary(file.path);

    if (uploadRes?.secure_url || uploadRes?.url) {
      const url = uploadRes.secure_url || uploadRes.url;
      photoUrls.push(url);
      console.log(`[Cloudinary] Uploaded: ${file.filename} → ${url}`);
    } else {
      console.log(`[Cloudinary] Failed: ${file.filename}`);
    }
  }

  if (photoUrls.length === 0) {
    throw new ExpressError("Failed to upload photos to Cloudinary", 500);
  }

  serviceRequest.preServicePhotos.push(...photoUrls);
  await serviceRequest.save();

  res.status(200).json({
    success: true,
    message: "Pre-service photos uploaded successfully",
    serviceRequest,
  });
};

const uploadPostPhotos = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service request ID", 400);
  }

  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) {
    throw new ExpressError("Worker profile not found", 404);
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) {
    throw new ExpressError("Service request not found", 404);
  }

  if (
    !serviceRequest.workerId ||
    serviceRequest.workerId.toString() !== worker._id.toString()
  ) {
    throw new ExpressError("You are not assigned to this service request", 403);
  }

  const files = req.files || (req.file ? [req.file] : []);
  if (!files || files.length === 0) {
    throw new ExpressError("No photos provided", 400);
  }

  const photoUrls = [];
  for (const file of files) {
    const uploadRes = await uploadToCloudinary(file.path);
    if (uploadRes && (uploadRes.secure_url || uploadRes.url)) {
      photoUrls.push(uploadRes.secure_url || uploadRes.url);
    }
  }

  if (photoUrls.length === 0) {
    throw new ExpressError("Failed to upload photos to Cloudinary", 500);
  }

  serviceRequest.postServicePhotos.push(...photoUrls);
  await serviceRequest.save();

  res.status(200).json({
    success: true,
    message: "Post-service photos uploaded successfully",
    serviceRequest,
  });
};

const acceptServiceRequest = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service request ID", 400);
  }

  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) {
    throw new ExpressError("Worker profile not found", 404);
  }

  if (worker.verification !== "verified") {
    throw new ExpressError("Worker is not verified", 403);
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) {
    throw new ExpressError("Service request not found", 404);
  }

  if (serviceRequest.status !== "open") {
    throw new ExpressError("Service request is not open for acceptance", 400);
  }

  serviceRequest.workerId = worker._id;
  serviceRequest.status = "accepted";
  await serviceRequest.save();

  res.status(200).json({
    success: true,
    message: "Service request accepted successfully",
    serviceRequest,
  });
};

const startServiceRequest = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service request ID", 400);
  }

  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) {
    throw new ExpressError("Worker profile not found", 404);
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) {
    throw new ExpressError("Service request not found", 404);
  }

  if (
    !serviceRequest.workerId ||
    serviceRequest.workerId.toString() !== worker._id.toString()
  ) {
    throw new ExpressError("You are not assigned to this service request", 403);
  }

  if (serviceRequest.status !== "accepted") {
    throw new ExpressError(
      "Service request must be in 'accepted' status to start",
      400
    );
  }

  serviceRequest.status = "in_progress";
  await serviceRequest.save();

  res.status(200).json({
    success: true,
    message: "Service request started successfully",
    serviceRequest,
  });
};

const completeServiceRequest = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service request ID", 400);
  }

  const worker = await Worker.findOne({ userId: req.user._id });
  if (!worker) {
    throw new ExpressError("Worker profile not found", 404);
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) {
    throw new ExpressError("Service request not found", 404);
  }

  if (
    !serviceRequest.workerId ||
    serviceRequest.workerId.toString() !== worker._id.toString()
  ) {
    throw new ExpressError("You are not assigned to this service request", 403);
  }

  if (serviceRequest.status !== "in_progress") {
    throw new ExpressError(
      "Service request must be in 'in_progress' status to complete",
      400
    );
  }

  serviceRequest.status = "completed";
  await serviceRequest.save();

  res.status(200).json({
    success: true,
    message: "Service request completed successfully",
    serviceRequest,
  });
};

const cancelServiceRequest = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service request ID", 400);
  }

  const customer = await Customer.findOne({ userId: req.user._id });
  if (!customer) {
    throw new ExpressError("Customer profile not found", 404);
  }

  const serviceRequest = await ServiceRequest.findById(req.params.id);
  if (!serviceRequest) {
    throw new ExpressError("Service request not found", 404);
  }

  if (serviceRequest.customerId.toString() !== customer._id.toString()) {
    throw new ExpressError(
      "You are not authorized to cancel this service request",
      403
    );
  }

  if (["completed", "cancelled"].includes(serviceRequest.status)) {
    throw new ExpressError(
      "Cannot cancel a completed or already cancelled service request",
      400
    );
  }

  serviceRequest.status = "cancelled";
  await serviceRequest.save();

  res.status(200).json({
    success: true,
    message: "Service request cancelled successfully",
    serviceRequest,
  });
};

const getWorkerOngoingServices = async (req, res) => {
  const { id } = req.params;
  let worker = null;

  if (id === "my") {
    worker = await Worker.findOne({ userId: req.user._id });
  } else {
    if (!isValidObjectId(id)) {
      throw new ExpressError("Invalid worker ID or user ID", 400);
    }
    worker = await Worker.findOne({
      $or: [{ _id: id }, { userId: id }],
    });
  }

  if (!worker) {
    throw new ExpressError("Worker profile not found", 404);
  }

  let isAuthorized = false;

  if (req.user.roles.includes("worker")) {
    const requestingWorker = await Worker.findOne({ userId: req.user._id });
    if (
      requestingWorker &&
      requestingWorker._id.toString() === worker._id.toString()
    ) {
      isAuthorized = true;
    }
  }

  if (req.user.roles.includes("cooperative")) {
    const requestingCooperative = await Cooperative.findOne({
      userId: req.user._id,
    });
    const coopId = worker.cooperativeId?._id || worker.cooperativeId;
    if (
      requestingCooperative &&
      coopId &&
      coopId.toString() === requestingCooperative._id.toString()
    ) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    throw new ExpressError(
      "Access denied: You are not authorized to view this worker's services",
      403
    );
  }

  const ongoingServices = await ServiceRequest.find({
    workerId: worker._id,
    status: { $in: ["accepted", "in_progress"] },
  })
    .populate("serviceId")
    .populate({
      path: "customerId",
      populate: { path: "userId", select: "name email mobileNumber" },
    })
    .sort({ scheduledAt: 1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: ongoingServices.length,
    serviceRequests: ongoingServices,
    ongoingServices,
  });
};

const getWorkerPreviousServices = async (req, res) => {
  const { id } = req.params;
  let worker = null;

  if (id === "my") {
    worker = await Worker.findOne({ userId: req.user._id });
  } else {
    if (!isValidObjectId(id)) {
      throw new ExpressError("Invalid worker ID or user ID", 400);
    }
    worker = await Worker.findOne({
      $or: [{ _id: id }, { userId: id }],
    });
  }

  if (!worker) {
    throw new ExpressError("Worker profile not found", 404);
  }

  let isAuthorized = false;

  if (req.user.roles.includes("worker")) {
    const requestingWorker = await Worker.findOne({ userId: req.user._id });
    if (
      requestingWorker &&
      requestingWorker._id.toString() === worker._id.toString()
    ) {
      isAuthorized = true;
    }
  }

  if (req.user.roles.includes("cooperative")) {
    const requestingCooperative = await Cooperative.findOne({
      userId: req.user._id,
    });
    const coopId = worker.cooperativeId?._id || worker.cooperativeId;
    if (
      requestingCooperative &&
      coopId &&
      coopId.toString() === requestingCooperative._id.toString()
    ) {
      isAuthorized = true;
    }
  }

  if (!isAuthorized) {
    throw new ExpressError(
      "Access denied: You are not authorized to view this worker's services",
      403
    );
  }

  const previousServices = await ServiceRequest.find({
    workerId: worker._id,
    status: { $in: ["completed", "cancelled"] },
  })
    .populate("serviceId")
    .populate({
      path: "customerId",
      populate: { path: "userId", select: "name email mobileNumber" },
    })
    .sort({ updatedAt: -1, createdAt: -1 });

  res.status(200).json({
    success: true,
    count: previousServices.length,
    serviceRequests: previousServices,
    previousServices,
  });
};

export {
  createServiceRequest,
  getMyServiceRequests,
  getAvailableServiceRequests,
  getServiceRequestById,
  getWorkerOngoingServices,
  getWorkerPreviousServices,
  uploadPrePhotos,
  uploadPostPhotos,
  acceptServiceRequest,
  startServiceRequest,
  completeServiceRequest,
  cancelServiceRequest,
};
