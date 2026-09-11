import { Customer } from "../models/customer.model.js";
import { registerUser, loginUser } from "../services/user.service.js";
import {
  validateRequired,
  isValidEmail,
  isValidMobile,
  isValidPassword,
  isValidGeoPoint,
  throwIfErrors,
  trim,
} from "../utils/validation.js";

const registerCustomer = async (req, res) => {
  const { email, password, name, mobileNumber, address, location } = req.body;

  const errors = validateRequired(
    ["email", "password", "name", "mobileNumber", "address"],
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
  if (location !== undefined && !isValidGeoPoint(location)) {
    errors.push(
      'location must be a valid GeoJSON Point: { type: "Point", coordinates: [lng, lat] }'
    );
  }

  throwIfErrors(errors);

  const user = await registerUser(
    trim(email),
    password,
    trim(name),
    trim(mobileNumber),
    "customer"
  );

  const customer = await Customer.create({
    userId: user._id,
    address: trim(address),
    location,
  });

  res.status(201).json({
    message: "Customer registered successfully",
    customer,
  });
};

const loginCustomer = async (req, res) => {
  const { email, mobileNumber, password } = req.body;

  const errors = [];

  if (
    !password ||
    (typeof password === "string" && password.trim().length === 0)
  ) {
    errors.push("password is required");
  }

  const identifier = email || mobileNumber;
  if (!identifier) {
    errors.push("email or mobileNumber is required");
  } else if (email && !isValidEmail(email)) {
    errors.push("Invalid email format");
  } else if (mobileNumber && !isValidMobile(mobileNumber)) {
    errors.push("Invalid mobile number format");
  }

  throwIfErrors(errors);

  const user = await loginUser(
    typeof identifier === "string" ? identifier.trim() : identifier,
    password
  );

  res.status(200).json({
    message: "Login successful",
    user,
  });
};

export { registerCustomer, loginCustomer };
