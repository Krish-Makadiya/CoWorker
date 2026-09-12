import { User } from "../models/user.model.js";

const authenticateUser = async (req, res, next) => {
  const userId = req.headers["user-id"];

  const user = await User.findById(userId);

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized",
    });
  }

  req.user = user;

  next();
};

const requireRole = (...roles) => {
  const allowedRoles = roles.flat();
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const hasRole = req.user.roles.some((role) => allowedRoles.includes(role));
    if (!hasRole) {
      return res.status(403).json({
        success: false,
        message: `Requires ${allowedRoles.join(" or ")} role`,
      });
    }

    next();
  };
};

export { authenticateUser, requireRole };
