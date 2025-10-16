// Import the User model to interact with the users collection in the database
import { User } from "../models/user.models.js";

// Import the ProjectMember model to manage project members and their roles
import { ProjectMember } from "../models/projectmember.models.js";

// Import the ApiError class to handle standardized API errors
import { ApiError } from "../utils/api-error.js";

// Import the asyncHandler wrapper to automatically handle errors in asynchronous functions
import { asyncHandler } from "../utils/async-handler.js";

// Import the jsonwebtoken library to verify and decode JWT tokens
import jwt from "jsonwebtoken";

// Import mongoose to use Types.ObjectId in queries
import mongoose from "mongoose";

// MIDDLEWARE TO VERIFY JWT TOKEN
// This middleware authenticates the user by verifying the validity of the JWT token
export const verifyJWT = asyncHandler(async (req, res, next) => {
  // Extract the token from two possible sources:
  // 1. From request cookies (req.cookies?.accessToken)
  // 2. From Authorization header, removing the "Bearer " prefix (req.header("Authorization")?.replace("Bearer ", ""))
  const token =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  // If no token is found, throw an authorization error
  if (!token) {
    throw new ApiError(401, "Unauthorized request");
  }

  try {
    // Verify and decode the token using the ACCESS_TOKEN_SECRET secret key
    const decodedToken = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
    
    // Find the user in the database using the ID extracted from the token
    // .select() excludes sensitive fields from the response
    const user = await User.findById(decodedToken?._id).select(
      "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
    );

    // If user is not found, the token is valid but the user no longer exists
    if (!user) {
      throw new ApiError(401, "Invalid access token");
    }
    
    // Add the user object to the request to make it available to subsequent middleware
    req.user = user;
    
    // Proceed to the next middleware or controller
    next();
  } catch (error) {
    // If token verification fails (expired token, invalid signature, etc.)
    throw new ApiError(401, "Invalid access token");
  }
});

// MIDDLEWARE TO VALIDATE PROJECT PERMISSIONS
// This middleware verifies that the user has the necessary permissions to access a specific project
export const validateProjectPermission = (roles = []) => {
  // Returns a custom middleware that accepts allowed roles as parameter
  return asyncHandler(async (req, res, next) => {
    // Extract the project ID from the request parameters
    const { projectId } = req.params;

    // Verify that the project ID is present
    if (!projectId) {
      throw new ApiError(400, "project id is missing");
    }

    // Find the project member that combines the project ID and user ID
    const project = await ProjectMember.findOne({
      project: new mongoose.Types.ObjectId(projectId),  // Convert string to MongoDB ObjectId
      user: new mongoose.Types.ObjectId(req.user._id),  // Convert string to MongoDB ObjectId
    });

    // If no project is found, the user is not a member of this project
    if (!project) {
      throw new ApiError(400, "project not found");
    }

    // Extract the user's role in the project
    const givenRole = project?.role;

    // Add the user's role to the user object in the request
    req.user.role = givenRole;

    // Verify if the user's role is included among the allowed roles for this operation
    if (!roles.includes(givenRole)) {
      throw new ApiError(
        403,  // Status code 403 - Forbidden
        "You do not have permission to perform this action",  // Clear error message
      );
    }

    // If all checks pass, proceed to the next middleware
    next();
  });
};