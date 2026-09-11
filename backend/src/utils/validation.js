import ExpressError from "./ExpressError.js";
import mongoose from "mongoose";

/**
 * Trims a string value if it is a string, otherwise returns it as-is.
 */
const trim = (v) => (typeof v === "string" ? v.trim() : v);

/**
 * Validates that all required fields are present and non-empty after trimming.
 * Returns an array of error messages (empty = valid).
 */
const validateRequired = (fields, body) => {
  const errors = [];
  for (const field of fields) {
    const value = body[field];
    if (value === undefined || value === null) {
      errors.push(`${field} is required`);
    } else if (typeof value === "string" && value.trim().length === 0) {
      errors.push(`${field} must not be empty`);
    }
  }
  return errors;
};

/**
 * Validates email format.
 */
const isValidEmail = (email) => {
  if (typeof email !== "string") return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());
};

/**
 * Validates Indian mobile number (10 digits, optionally prefixed with +91).
 */
const isValidMobile = (mobile) => {
  if (typeof mobile !== "string") return false;
  return /^(\+91)?[6-9]\d{9}$/.test(mobile.trim());
};

/**
 * Validates password strength.
 * At least 6 characters long.
 */
const isValidPassword = (password) => {
  if (typeof password !== "string") return false;
  return password.length >= 6;
};

/**
 * Validates that a value is a valid MongoDB ObjectId string.
 */
const isValidObjectId = (id) => {
  return mongoose.Types.ObjectId.isValid(id);
};

/**
 * Validates that a value is a non-negative number.
 */
const isNonNegativeNumber = (value) => {
  return typeof value === "number" && !isNaN(value) && value >= 0;
};

/**
 * Validates that a value is an array of non-empty strings.
 */
const isStringArray = (value) => {
  if (!Array.isArray(value)) return false;
  return value.every((v) => typeof v === "string" && v.trim().length > 0);
};

/**
 * Validates a GeoJSON Point location object.
 * Expects: { type: "Point", coordinates: [lng, lat] }
 */
const isValidGeoPoint = (location) => {
  if (!location || typeof location !== "object") return false;
  if (location.type !== "Point") return false;
  if (
    !Array.isArray(location.coordinates) ||
    location.coordinates.length !== 2
  )
    return false;
  const [lng, lat] = location.coordinates;
  return (
    typeof lng === "number" &&
    typeof lat === "number" &&
    lng >= -180 &&
    lng <= 180 &&
    lat >= -90 &&
    lat <= 90
  );
};

/**
 * Throws an ExpressError(400) if there are any validation errors.
 */
const throwIfErrors = (errors) => {
  if (errors.length > 0) {
    throw new ExpressError(errors.join(", "), 400);
  }
};

export {
  trim,
  validateRequired,
  isValidEmail,
  isValidMobile,
  isValidPassword,
  isValidObjectId,
  isNonNegativeNumber,
  isStringArray,
  isValidGeoPoint,
  throwIfErrors,
};
