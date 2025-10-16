// Import the Router class from Express to create a modular router
// The router allows defining routes in separate files and then mounting them in the main app
import { Router } from "express";

// Import all authentication controllers from the controllers folder
// These controllers contain the business logic for each endpoint
import {
  changeCurrentPassword,
  forgotPasswordRequest,
  getCurrentUser,
  login,
  logoutUser,
  refreshAccessToken,
  registerUser,
  resendEmailVerification,
  resetForgotPassword,
  verifyEmail,
} from "../controllers/auth.controllers.js";

// Import the validate middleware that handles validation error checking
// validate checks if there are errors in validators and returns standardized errors
import { validate } from "../middlewares/validator.middleware.js";

// Import validators for different authentication routes
// Each validator defines validation rules for specific fields
import {
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userLoginValidator,
  userRegisterValidator,
  userResetForgotPasswordValidator,
} from "../validators/index.js";

// Import the verifyJWT middleware for authentication via JSON Web Token
// verifyJWT verifies token validity and adds user to the request
import { verifyJWT } from "../middlewares/auth.middleware.js";

// Create a new Router instance
// This router will contain all authentication-related routes
const router = Router();

//-----------------------------------------------------------------------------------------------------------
// UNPROTECTED ROUTES (PUBLIC) - Accessible without authentication
//-----------------------------------------------------------------------------------------------------------

// POST route for new user registration
// Sequence: Validation → Error checking → Registration
router.route("/register").post(userRegisterValidator(), validate, registerUser);

// POST route for user login
// Sequence: Validation → Error checking → Login
router.route("/login").post(userLoginValidator(), validate, login);

// GET route for email verification via token
// Doesn't require validators because token is passed as URL parameter
router.route("/verify-email/:verificationToken").get(verifyEmail);

// POST route for access token refresh using refresh token
// Used when access token expires but refresh token is still valid
router.route("/refresh-token").post(refreshAccessToken);

// POST route to request password reset (forgotten password)
// Sequence: Validation → Error checking → Reset email sending
router
  .route("/forgot-password")
  .post(userForgotPasswordValidator(), validate, forgotPasswordRequest);

// POST route to actually reset password using reset token
// Sequence: Validation → Error checking → Password reset
router
  .route("/reset-password/:resetToken")
  .post(userResetForgotPasswordValidator(), validate, resetForgotPassword);

//-----------------------------------------------------------------------------------------------------------
// PROTECTED ROUTES (PRIVATE) - Require JWT authentication
//-----------------------------------------------------------------------------------------------------------

// POST route for user logout
// Sequence: JWT verification → Logout (removes tokens and cookies)
router.route("/logout").post(verifyJWT, logoutUser);

// POST route to get current user data
// Sequence: JWT verification → User data retrieval
router.route("/current-user").post(verifyJWT, getCurrentUser);

// POST route to change current password
// Sequence: JWT verification → Validation → Error checking → Password change
router
  .route("/change-password")
  .post(
    verifyJWT,  // First verify that user is authenticated
    userChangeCurrentPasswordValidator(),  // Then validate request fields
    validate,  // Check if there are validation errors
    changeCurrentPassword,  // Finally execute password change
  );

// POST route to resend verification email
// Sequence: JWT verification → Send new verification email
router
  .route("/resend-email-verification")
  .post(verifyJWT, resendEmailVerification);

// Export the router as default module
// This allows importing and using this router in the main Express application
export default router;