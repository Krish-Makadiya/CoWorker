import { Service } from "../models/service.model.js";
import ExpressError from "../utils/ExpressError.js";
import {
  validateRequired,
  isNonNegativeNumber,
  isValidObjectId,
  throwIfErrors,
  trim,
} from "../utils/validation.js";

const createService = async (req, res) => {
  const { name, category, description, basePrice } = req.body;

  const errors = validateRequired(
    ["name", "category", "description"],
    req.body
  );

  if (basePrice === undefined || basePrice === null) {
    errors.push("basePrice is required");
  } else if (!isNonNegativeNumber(basePrice)) {
    errors.push("basePrice must be a non-negative number");
  }

  throwIfErrors(errors);

  const service = await Service.create({
    name: trim(name),
    category: trim(category),
    description: trim(description),
    basePrice,
  });

  res.status(201).json({
    success: true,
    message: "Service created successfully",
    service,
  });
};

const getAllServices = async (req, res) => {
  const services = await Service.find();

  res.status(200).json({
    success: true,
    services,
  });
};

const getServiceById = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service ID", 400);
  }

  const service = await Service.findById(req.params.id);

  if (!service) {
    throw new ExpressError("Service not found", 404);
  }

  res.status(200).json({
    success: true,
    service,
  });
};

const deleteService = async (req, res) => {
  if (!isValidObjectId(req.params.id)) {
    throw new ExpressError("Invalid service ID", 400);
  }

  const service = await Service.findByIdAndDelete(req.params.id);

  if (!service) {
    throw new ExpressError("Service not found", 404);
  }

  res.status(200).json({
    success: true,
    message: "Service deleted successfully",
  });
};

export { createService, getAllServices, getServiceById, deleteService };
