const { isTokenValid } = require("../utils");

const authenticateUser = (req, res, next) => {
  const token = req.signedCookies.token;

  if (!token) {
    throw new Error("Authentication Invalid");
  }
  try {
    const { name, userId, role } = isTokenValid(token);
    // Add user info to the req object
    req.user = { name, userId, role };
    next();
  } catch (error) {
    throw new Error("Authentication Invalid");
  }
};

const authorizePermissions = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      throw new Error("Unauthorized - Access denied");
    } else {
      console.log(`Welcome ${req.user.name}`);
      next();
    }
  };
};

module.exports = { authenticateUser, authorizePermissions };
