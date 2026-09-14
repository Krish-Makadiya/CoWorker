import { registerUser, loginUser } from "../services/user.service.js";
import { Cooperative } from "../models/cooperative.model.js";
import {
  validateRequired,
  isValidEmail,
  isValidMobile,
  isValidPassword,
  throwIfErrors,
  trim,
} from "../utils/validation.js";

const registerCooperative = async (req, res) => {
  const { email, password, name, mobileNumber, registrationNumber, address } =
    req.body;

  const errors = validateRequired(
    ["email", "password", "name", "mobileNumber", "registrationNumber"],
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

  // Validate nested address object
  if (!address || typeof address !== "object") {
    errors.push(
      "address is required and must be an object with city, state, pinCode"
    );
  } else {
    if (
      !address.city ||
      (typeof address.city === "string" && address.city.trim().length === 0)
    ) {
      errors.push("address.city is required");
    }
    if (
      !address.state ||
      (typeof address.state === "string" && address.state.trim().length === 0)
    ) {
      errors.push("address.state is required");
    }
    if (
      !address.pinCode ||
      (typeof address.pinCode === "string" &&
        address.pinCode.trim().length === 0)
    ) {
      errors.push("address.pinCode is required");
    } else if (
      typeof address.pinCode === "string" &&
      !/^\d{6}$/.test(address.pinCode.trim())
    ) {
      errors.push("address.pinCode must be a 6-digit number");
    }
  }

  throwIfErrors(errors);

  const user = await registerUser(
    trim(email),
    password,
    trim(name),
    trim(mobileNumber),
    "cooperative"
  );

  const cooperative = await Cooperative.create({
    userId: user._id,
    name: trim(name),
    registrationNumber: trim(registrationNumber),
    address: {
      city: trim(address.city),
      state: trim(address.state),
      pinCode: trim(address.pinCode),
    },
  });

  res.status(201).json({
    message: "Cooperative registered successfully",
    cooperative,
  });
};

const loginCooperative = async (req, res) => {
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

const listCooperatives = async (req, res) => {
  const cooperatives = await Cooperative.find().populate(
    "userId",
    "name email mobileNumber"
  );

  res.status(200).json({
    success: true,
    cooperatives,
  });
};

const getCooperativeNames = async (req, res) => {
  const cooperatives = await Cooperative.find().select("_id name");

  res.status(200).json({
    success: true,
    cooperatives,
  });
};

const getCooperativeProfile = async (req, res) => {
  const cooperative = await Cooperative.findOne({
    userId: req.user._id,
  }).populate("userId", "name email mobileNumber roles");

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  res.status(200).json({
    success: true,
    cooperative,
  });
};

const updateCooperativeProfile = async (req, res) => {
  const { name, registrationNumber, address } = req.body;

  const errors = [];

  if (
    name !== undefined &&
    (typeof name !== "string" || name.trim().length === 0)
  ) {
    errors.push("name must be a non-empty string");
  }
  if (
    registrationNumber !== undefined &&
    (typeof registrationNumber !== "string" ||
      registrationNumber.trim().length === 0)
  ) {
    errors.push("registrationNumber must be a non-empty string");
  }
  if (address !== undefined) {
    if (typeof address !== "object" || address === null) {
      errors.push("address must be an object with city, state, pinCode");
    } else {
      if (
        address.city !== undefined &&
        (typeof address.city !== "string" || address.city.trim().length === 0)
      ) {
        errors.push("address.city must be a non-empty string");
      }
      if (
        address.state !== undefined &&
        (typeof address.state !== "string" || address.state.trim().length === 0)
      ) {
        errors.push("address.state must be a non-empty string");
      }
      if (address.pinCode !== undefined) {
        if (
          typeof address.pinCode !== "string" ||
          address.pinCode.trim().length === 0
        ) {
          errors.push("address.pinCode must be a non-empty string");
        } else if (!/^\d{6}$/.test(address.pinCode.trim())) {
          errors.push("address.pinCode must be a 6-digit number");
        }
      }
    }
  }

  throwIfErrors(errors);

  const cooperative = await Cooperative.findOneAndUpdate(
    { userId: req.user._id },
    { name, registrationNumber, address },
    { new: true }
  ).populate("userId", "name email mobileNumber roles");

  if (!cooperative) {
    return res.status(404).json({
      success: false,
      message: "Cooperative profile not found",
    });
  }

  res.status(200).json({
    success: true,
    message: "Cooperative profile updated successfully",
    cooperative,
  });
};

export {
  registerCooperative,
  loginCooperative,
  listCooperatives,
  getCooperativeNames,
  getCooperativeProfile,
  updateCooperativeProfile,
};
