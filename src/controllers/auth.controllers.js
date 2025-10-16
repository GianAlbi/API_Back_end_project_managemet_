// Import the User model to interact with the users collection in the database
import { User } from "../models/user.models.js";

// Import the ApiResponse class to send standardized and consistent API responses
import { ApiResponse } from "../utils/api-response.js";

// Import the ApiError class to handle standardized API errors
import { ApiError } from "../utils/api-error.js";

// Import the asyncHandler wrapper to automatically handle errors in asynchronous functions
import { asyncHandler } from "../utils/async-handler.js";

// Import functions for email management: templates and sending function
import {
  emailVerificationMailgenContent,
  forgotPasswordMailgenContent,
  sendEmail,
} from "../utils/mail.js";

// Import the jsonwebtoken library to verify and generate JWT tokens
import jwt from "jsonwebtoken";

// Import Node.js crypto module for cryptographic operations (hashing)
import crypto from "crypto";

//-----------------------------------------------------------------------------------------------------------
// FUNCTION TO GENERATE ACCESS AND REFRESH TOKENS
// This function creates and saves both access token and refresh token for a user
//-----------------------------------------------------------------------------------------------------------
const generateAccessAndRefreshTokens = async (userId) => {
  try {
    // Find the user in the database using the provided ID
    const user = await User.findById(userId);
    
    // Generate a new access token using the method defined in the User schema
    const accessToken = user.generateAccessToken();
    
    // Generate a new refresh token using the method defined in the User schema
    const refreshToken = user.generateRefreshToken();

    // Save the refresh token in the user (will be stored in the database)
    user.refreshToken = refreshToken;
    
    // Save the user to the database disabling validation before saving
    await user.save({ validateBeforeSave: false });
    
    // Return both tokens as an object
    return { accessToken, refreshToken };
  } catch (error) {
    // If something goes wrong, throw a standardized API error
    throw new ApiError(
      500,  // Status code 500 - Internal Server Error
      "Something went wrong while generating access token",  // Descriptive error message
    );
  }
};

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER FOR USER REGISTRATION
// Handles the complete process of registering a new user
//-----------------------------------------------------------------------------------------------------------
const registerUser = asyncHandler(async (req, res) => {
  // Extract data from the request body
  const { email, username, password, role } = req.body;

  // CHECK FOR EXISTING USER
  // Verify if a user with the same email or username already exists
  const existedUser = await User.findOne({
    // $or operator: searches for documents that satisfy AT LEAST ONE of the conditions
    $or: [{ username }, { email }],
  });

  // If a user with the same credentials already exists, throw an error
  if (existedUser) {
    throw new ApiError(409, "User with email or username already exists", []);
  }

  // CREATE NEW USER
  // Create a new user document in the database
  const user = await User.create({
    email,           // User's email
    password,        // Password (will be automatically hashed by the pre-save middleware)
    username,        // Unique username
    isEmailVerified: false,  // Set email as unverified initially
  });

  // GENERATE EMAIL VERIFICATION TOKEN
  // Create a temporary token for email verification
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  // Save the hashed token in the user document for future verification
  user.emailVerificationToken = hashedToken;
  
  // Save the token expiration date (20 minutes from generation)
  user.emailVerificationExpiry = tokenExpiry;

  // Save the user with the new token fields (disabling validation)
  await user.save({ validateBeforeSave: false });

  // SEND VERIFICATION EMAIL
  // Send the verification email to the user's email address
  await sendEmail({
    email: user?.email,  // Recipient's email address
    subject: "Please verify your email",  // Email subject
    // Generate email content using the predefined template
    mailgenContent: emailVerificationMailgenContent(
      user.username,  // Username to personalize the email
      // Build the complete verification URL
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  // RETRIEVE CREATED USER (WITHOUT SENSITIVE DATA)
  // Search for the newly created user excluding sensitive fields
  const createdUser = await User.findById(user._id).select(
    // Exclude from response: password, refreshToken and email verification tokens
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  // SECURITY CHECK
  // Verify that the user was created correctly
  if (!createdUser) {
    throw new ApiError(500, "Something went wrong while registering a user");
  }

  // SUCCESS API RESPONSE
  // Return a standardized JSON response with status 201 (Created)
  return res
    .status(201)
    .json(
      new ApiResponse(
        200,  // Custom API status code
        { user: createdUser },  // Created user data (without sensitive information)
        "User registered successfully and verification email has been sent on your email",  // Success message
      ),
    );
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER FOR USER LOGIN
// Handles authentication of existing users
//-----------------------------------------------------------------------------------------------------------
const login = asyncHandler(async (req, res) => {
  // Extract login data from the request body
  const { email, password, username } = req.body;

  // Verify that email is provided (mandatory field for login)
  if (!email) {
    throw new ApiError(400, "Email is required");
  }

  // Search for the user in the database by email
  const user = await User.findOne({ email });

  // If user is not found, throw an error
  if (!user) {
    throw new ApiError(400, "User does not exist");
  }

  // Verify if the provided password is correct
  const isPasswordValid = await user.isPasswordCorrect(password);

  // If password is not valid, throw an error
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid credentials");
  }

  // Generate new access and refresh tokens for the user
  const { accessToken, refreshToken } = await generateAccessAndRefreshTokens(
    user._id,
  );

  // Retrieve user data without sensitive information
  const loggedInUser = await User.findById(user._id).select(
    "-password -refreshToken -emailVerificationToken -emailVerificationExpiry",
  );

  // Configure cookie options
  const options = {
    httpOnly: true,  // Cookies are not accessible via JavaScript (better security)
    secure: true,    // Cookies are sent only over HTTPS connections
  };

  // SUCCESS RESPONSE WITH COOKIES AND TOKENS
  return res
    .status(200)
    .cookie("accessToken", accessToken, options)  // Set access token cookie
    .cookie("refreshToken", refreshToken, options)  // Set refresh token cookie
    .json(
      new ApiResponse(
        200,
        {
          user: loggedInUser,  // User data without sensitive information
          accessToken,         // Access token included in response (for clients not using cookies)
          refreshToken,        // Refresh token included in response
        },
        "User logged in successfully",  // Success message
      ),
    );
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER FOR USER LOGOUT
// Handles logout by removing refresh token and clearing cookies
//-----------------------------------------------------------------------------------------------------------
const logoutUser = asyncHandler(async (req, res) => {
  // Remove refresh token from the user document in the database
  await User.findByIdAndUpdate(
    req.user._id,  // User ID extracted from JWT token (added by verifyJWT middleware)
    {
      $set: {
        refreshToken: "",  // Set refresh token to empty string
      },
    },
    {
      new: true,  // Return the updated document
    },
  );
  
  // Configure cookie options (must match those used in login)
  const options = {
    httpOnly: true,
    secure: true,
  };
  
  // SUCCESS RESPONSE WITH COOKIE CLEARING
  return res
    .status(200)
    .clearCookie("accessToken", options)   // Clear access token cookie
    .clearCookie("refreshToken", options)  // Clear refresh token cookie
    .json(new ApiResponse(200, {}, "User logged out"));  // Success message
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER TO GET CURRENT USER
// Returns data of the currently authenticated user
//-----------------------------------------------------------------------------------------------------------
const getCurrentUser = asyncHandler(async (req, res) => {
  // Return user data already present in the request (added by verifyJWT middleware)
  return res
    .status(200)
    .json(new ApiResponse(200, req.user, "Current user fetched successfully"));
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER FOR EMAIL VERIFICATION
// Handles email address verification via token
//-----------------------------------------------------------------------------------------------------------
const verifyEmail = asyncHandler(async (req, res) => {
  // Extract verification token from URL parameters
  const { verificationToken } = req.params;

  // Verify that the token is present
  if (!verificationToken) {
    throw new ApiError(400, "Email verification token is missing");
  }

  // Calculate hash of the received token to compare it with the one saved in the database
  let hashedToken = crypto
    .createHash("sha256")        // Use SHA-256 algorithm for hashing
    .update(verificationToken)   // Input the unhashed token
    .digest("hex");              // Convert result to hexadecimal string

  // Find user with the hashed token and verify it hasn't expired
  const user = await User.findOne({
    emailVerificationToken: hashedToken,           // Matching token
    emailVerificationExpiry: { $gt: Date.now() },  // Expiration date greater than now
  });

  // If no user is found, the token is invalid or expired
  if (!user) {
    throw new ApiError(400, "Token is invalid or expired");
  }

  // Remove verification token and expiration date from user document
  user.emailVerificationToken = undefined;
  user.emailVerificationExpiry = undefined;

  // Set email as verified
  user.isEmailVerified = true;
  
  // Save changes disabling validation
  await user.save({ validateBeforeSave: false });

  // SUCCESS RESPONSE
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        isEmailVerified: true,  // Confirm that email has been verified
      },
      "Email is verified",  // Success message
    ),
  );
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER TO RESEND EMAIL VERIFICATION
// Sends verification email again to the user
//-----------------------------------------------------------------------------------------------------------
const resendEmailVerification = asyncHandler(async (req, res) => {
  // Find user by ID (extracted from JWT token)
  const user = await User.findById(req.user?._id);

  // Verify that the user exists
  if (!user) {
    throw new ApiError(404, "User does not exist");
  }
  
  // Verify that email is not already verified
  if (user.isEmailVerified) {
    throw new ApiError(409, "Email is already verified");
  }

  // Generate a new temporary token for email verification
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  // Save the new token and expiration date
  user.emailVerificationToken = hashedToken;
  user.emailVerificationExpiry = tokenExpiry;

  // Save changes disabling validation
  await user.save({ validateBeforeSave: false });

  // Send the new verification email
  await sendEmail({
    email: user?.email,  // Recipient's email address
    subject: "Please verify your email",  // Email subject
    mailgenContent: emailVerificationMailgenContent(
      user.username,  // Username to personalize the email
      // Build the new verification URL
      `${req.protocol}://${req.get("host")}/api/v1/users/verify-email/${unHashedToken}`,
    ),
  });

  // SUCCESS RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your email ID"));
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER TO REFRESH ACCESS TOKEN
// Generates a new access token using a valid refresh token
//-----------------------------------------------------------------------------------------------------------
const refreshAccessToken = asyncHandler(async (req, res) => {
  // Extract refresh token from cookies or request body
  const incomingRefreshToken =
    req.cookies.refreshToken || req.body.refreshToken;

  // Verify that refresh token is present
  if (!incomingRefreshToken) {
    throw new ApiError(401, "Unauthorized access");
  }

  try {
    // Verify and decode the refresh token using the secret key
    const decodedToken = jwt.verify(
      incomingRefreshToken,
      process.env.REFRESH_TOKEN_SECRET,
    );

    // Find user by ID extracted from the token
    const user = await User.findById(decodedToken?._id);
    
    // If user is not found, the token is invalid
    if (!user) {
      throw new ApiError(401, "Invalid refresh token");
    }

    // Verify that the refresh token matches the one saved in the database
    if (incomingRefreshToken !== user?.refreshToken) {
      throw new ApiError(401, "Refresh token is expired");
    }

    // Configure cookie options
    const options = {
      httpOnly: true,
      secure: true,
    };

    // Generate new access and refresh tokens
    const { accessToken, refreshToken: newRefreshToken } =
      await generateAccessAndRefreshTokens(user._id);

    // Save the new refresh token in the database
    user.refreshToken = newRefreshToken;
    await user.save();

    // SUCCESS RESPONSE WITH NEW COOKIES AND TOKENS
    return res
      .status(200)
      .cookie("accessToken", accessToken, options)       // Set new access token as cookie
      .cookie("refreshToken", newRefreshToken, options)  // Set new refresh token as cookie
      .json(
        new ApiResponse(
          200,
          { accessToken, refreshToken: newRefreshToken },  // Include new tokens in response
          "Access token refreshed",  // Success message
        ),
      );
  } catch (error) {
    // If token verification fails
    throw new ApiError(401, "Invalid refresh token");
  }
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER TO REQUEST PASSWORD RESET
// Handles password reset request via email
//-----------------------------------------------------------------------------------------------------------
const forgotPasswordRequest = asyncHandler(async (req, res) => {
  // Extract email from request body
  const { email } = req.body;

  // Find user by email
  const user = await User.findOne({ email });

  // If user is not found, throw an error
  if (!user) {
    throw new ApiError(404, "User does not exist", []);
  }

  // Generate a temporary token for password reset
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  // Save the token and expiration date in the user document
  user.forgotPasswordToken = hashedToken;
  user.forgotPasswordExpiry = tokenExpiry;

  // Save changes disabling validation
  await user.save({ validateBeforeSave: false });

  // Send password reset email
  await sendEmail({
    email: user?.email,  // Recipient's email address
    subject: "Password reset request",  // Email subject
    mailgenContent: forgotPasswordMailgenContent(
      user.username,  // Username to personalize the email
      // Build password reset URL
      `${process.env.FORGOT_PASSWORD_REDIRECT_URL}/${unHashedToken}`,
    ),
  });

  // SUCCESS RESPONSE
  return res
    .status(200)
    .json(
      new ApiResponse(
        200,
        {},
        "Password reset mail has been sent on your mail id",  // Success message
      ),
    );
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER TO RESET FORGOTTEN PASSWORD
// Handles actual password reset using the token
//-----------------------------------------------------------------------------------------------------------
const resetForgotPassword = asyncHandler(async (req, res) => {
  // Extract reset token from URL parameters and new password from body
  const { resetToken } = req.params;
  const { newPassword } = req.body;

  // Calculate hash of the received token to compare it with the one saved in the database
  let hashedToken = crypto
    .createHash("sha256")    // Use SHA-256 algorithm for hashing
    .update(resetToken)      // Input the unhashed token
    .digest("hex");          // Convert result to hexadecimal string

  // Find user with the hashed token and verify it hasn't expired
  const user = await User.findOne({
    forgotPasswordToken: hashedToken,           // Matching token
    forgotPasswordExpiry: { $gt: Date.now() },  // Expiration date greater than now
  });

  // If no user is found, the token is invalid or expired
  if (!user) {
    throw new ApiError(489, "Token is invalid or expired");
  }

  // Remove reset token and expiration date from user document
  user.forgotPasswordExpiry = undefined;
  user.forgotPasswordToken = undefined;

  // Set the new password (will be automatically hashed by the pre-save middleware)
  user.password = newPassword;
  
  // Save changes disabling validation
  await user.save({ validateBeforeSave: false });

  // SUCCESS RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password reset successfully"));
});

//-----------------------------------------------------------------------------------------------------------
// CONTROLLER TO CHANGE CURRENT PASSWORD
// Handles password change for already authenticated users
//-----------------------------------------------------------------------------------------------------------
const changeCurrentPassword = asyncHandler(async (req, res) => {
  // Extract old and new password from request body
  const { oldPassword, newPassword } = req.body;

  // Find user by ID (extracted from JWT token)
  const user = await User.findById(req.user?._id);

  // Verify that the old password is correct
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  // If old password is not valid, throw an error
  if (!isPasswordValid) {
    throw new ApiError(400, "Invalid old Password");
  }

  // Set the new password (will be automatically hashed by the pre-save middleware)
  user.password = newPassword;
  
  // Save changes disabling validation
  await user.save({ validateBeforeSave: false });

  // SUCCESS RESPONSE
  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));
});

//-----------------------------------------------------------------------------------------------------------
// EXPORT ALL CONTROLLERS
//-----------------------------------------------------------------------------------------------------------
export {
  registerUser,
  login,
  logoutUser,
  getCurrentUser,
  verifyEmail,
  resendEmailVerification,
  refreshAccessToken,
  forgotPasswordRequest,
  changeCurrentPassword,
  resetForgotPassword,
};