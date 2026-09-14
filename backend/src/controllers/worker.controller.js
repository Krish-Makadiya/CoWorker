import { Worker } from "../models/worker.model.js";
import { Cooperative } from "../models/cooperative.model.js";
import { User } from "../models/user.model.js";
import { registerUser, loginUser } from "../services/user.service.js";
import {
  validateRequired,
  isValidEmail,
  isValidMobile,
  isValidPassword,
  isValidObjectId,
  isNonNegativeNumber,
  isStringArray,
  throwIfErrors,
  trim,
} from "../utils/validation.js";

const registerWorker = async (req, res) => {
  const {
    email,
    password,
    name,
    mobileNumber,
    cooperativeId,
    skills,
    experience,
    certifications,
    address,
  } = req.body;

  const errors = validateRequired(
    ["email", "password", "name", "mobileNumber"],
    req.body
  );

  if (email && !isValidEmail(email)) {
    errors.push("Invalid email format");
  }
  if (password && !isValidPassword(password)) {
    errors.push("Password must be at least 6 characters");
  }
  if (mobileNumber && !isValidMobile(mobileNumber)) {
    errors.push("Invalid mobile number format");
  }
  if (cooperativeId && !isValidObjectId(cooperativeId)) {
    errors.push("Invalid cooperativeId");
  }
  if (skills !== undefined && !isStringArray(skills)) {
    errors.push("skills must be an array of non-empty strings");
  }
  if (experience !== undefined && !isNonNegativeNumber(experience)) {
    errors.push("experience must be a non-negative number");
  }
  if (certifications !== undefined && !isStringArray(certifications)) {
    errors.push("certifications must be an array of non-empty strings");
  }

  throwIfErrors(errors);

  const user = await registerUser(
    trim(email),
    password,
    trim(name),
    trim(mobileNumber),
    "worker"
  );

  const worker = await Worker.create({
    userId: user._id,
    cooperativeId,
    skills,
    experience,
    certifications,
    address: address ? trim(address) : address,
    verification: "pending",
  });

  res.status(201).json({
    message: "Worker registered successfully",
    worker,
  });
};

const loginWorker = async (req, res) => {
  const { email, password } = req.body;

  const errors = validateRequired(["email", "password"], req.body);

  if (email && !isValidEmail(email)) {
    errors.push("Invalid email format");
  }

  throwIfErrors(errors);

  const user = await loginUser(trim(email), password);

  res.status(200).json({
    message: "Login successful",
    user,
  });
};

const listWorkers = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const workers = await Worker.find({
    cooperativeId: cooperative._id,
  }).populate("userId", "name email mobileNumber");

  res.status(200).json({
    success: true,
    workers,
  });
};

const updateWorker = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throwIfErrors(["Invalid worker ID"]);
  }

  const errors = [];
  const { skills, experience, certifications, address } = req.body;

  if (skills !== undefined && !isStringArray(skills)) {
    errors.push("skills must be an array of non-empty strings");
  }
  if (experience !== undefined && !isNonNegativeNumber(experience)) {
    errors.push("experience must be a non-negative number");
  }
  if (certifications !== undefined && !isStringArray(certifications)) {
    errors.push("certifications must be an array of non-empty strings");
  }
  if (
    address !== undefined &&
    (typeof address !== "string" || address.trim().length === 0)
  ) {
    errors.push("address must be a non-empty string");
  }

  throwIfErrors(errors);

  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const worker = await Worker.findOne({
    $or: [{ _id: req.params.id }, { userId: req.params.id }],
    cooperativeId: cooperative._id,
  });

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found in your cooperative",
    });
  }

  const allowedFields = ["skills", "experience", "certifications", "address"];

  allowedFields.forEach((field) => {
    if (req.body[field] !== undefined) {
      worker[field] = req.body[field];
    }
  });

  await worker.save();

  res.status(200).json({
    success: true,
    message: "Worker updated successfully",
    worker,
  });
};

const deleteWorker = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throwIfErrors(["Invalid worker ID"]);
  }

  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const worker = await Worker.findOneAndDelete({
    $or: [{ _id: req.params.id }, { userId: req.params.id }],
    cooperativeId: cooperative._id,
  });

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found in your cooperative",
    });
  }

  await User.findByIdAndDelete(worker.userId);

  res.status(200).json({
    success: true,
    message: "Worker deleted successfully",
  });
};

const verifyWorker = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throwIfErrors(["Invalid worker ID"]);
  }

  const { status } = req.body;

  if (!status || !["pending", "verified", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message:
        "Invalid verification status. Must be: pending, verified, or rejected",
    });
  }

  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const worker = await Worker.findOne({
    $or: [{ _id: req.params.id }, { userId: req.params.id }],
    cooperativeId: cooperative._id,
  });

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found in your cooperative",
    });
  }

  worker.verification = status;
  await worker.save();

  res.status(200).json({
    success: true,
    message: `Worker verification status updated to '${status}'`,
    worker,
  });
};
const registerWorkerByCooperative = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  });

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  const {
    email,
    password,
    name,
    mobileNumber,
    skills,
    experience,
    certifications,
    address,
  } = req.body;

  const errors = validateRequired(
    ["email", "password", "name", "mobileNumber"],
    req.body
  );

  if (email && !isValidEmail(email)) {
    errors.push("Invalid email format");
  }
  if (password && !isValidPassword(password)) {
    errors.push("Password must be at least 6 characters");
  }
  if (mobileNumber && !isValidMobile(mobileNumber)) {
    errors.push("Invalid mobile number format");
  }
  if (skills !== undefined && !isStringArray(skills)) {
    errors.push("skills must be an array of non-empty strings");
  }
  if (experience !== undefined && !isNonNegativeNumber(experience)) {
    errors.push("experience must be a non-negative number");
  }
  if (certifications !== undefined && !isStringArray(certifications)) {
    errors.push("certifications must be an array of non-empty strings");
  }

  throwIfErrors(errors);

  const user = await registerUser(
    trim(email),
    password,
    trim(name),
    trim(mobileNumber),
    "worker"
  );

  const worker = await Worker.create({
    userId: user._id,
    cooperativeId: cooperative._id,
    skills,
    experience,
    certifications,
    address: address ? trim(address) : address,
    verification: "verified",
  });

  res.status(201).json({
    success: true,
    message: "Worker registered and verified successfully",
    worker,
  });
};

const getWorkerById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throwIfErrors(["Invalid worker ID"]);
  }

  const worker = await Worker.findOne({
    $or: [{ _id: req.params.id }, { userId: req.params.id }],
  })
    .populate("userId", "name email mobileNumber")
    .populate("cooperativeId", "name location");

  if (!worker) {
    return res.status(404).json({
      success: false,
      message: "Worker not found",
    });
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
    return res.status(403).json({
      success: false,
      message:
        "Access denied: You are not authorized to view this worker's profile",
    });
  }

  res.status(200).json({
    success: true,
    worker,
  });
};

export {
  registerWorker,
  loginWorker,
  listWorkers,
  updateWorker,
  deleteWorker,
  verifyWorker,
  registerWorkerByCooperative,
  getWorkerById,
};
