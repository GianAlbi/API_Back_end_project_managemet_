// Import the body function from express-validator
// body is a validator that checks fields in the HTTP request body
import { body } from "express-validator";

// Import available user role constants
// AvailableUserRole contains the valid roles that a user can have in the system
import { AvailableUserRole } from "../utils/constants.js";

//-----------------------------------------------------------------------------------------------------------
// VALIDATOR FOR USER REGISTRATION
// Defines validation rules for registering a new user
//-----------------------------------------------------------------------------------------------------------
const userRegisterValidator = () => {
  return [
    // Validator for email field
    body("email")
      .trim()  // Removes whitespace from beginning and end of string
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Email is required")  // Error message if field is empty
      .isEmail()  // Verifies that the value is a valid email
      .withMessage("Email is invalid"),  // Error message if email is not valid
    
    // Validator for username field
    body("username")
      .trim()  // Removes whitespace from beginning and end of string
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Username is required")  // Error message if field is empty
      .isLowercase()  // Verifies that username is all lowercase
      .withMessage("Username must be in lower case")  // Error message if not lowercase
      .isLength({ min: 3 })  // Verifies that length is at least 3 characters
      .withMessage("Username must be at least 3 characters long"),  // Error message if too short
    
    // Validator for password field
    body("password")
      .trim()  // Removes whitespace from beginning and end of string
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Password is required"),  // Error message if field is empty

    // Validator for fullName field (optional)
    body("fullName")
      .optional()  // Indicates this field is optional (if not present, skips validation)
      .trim()  // If present, removes whitespace from beginning and end
  ];
};

//-----------------------------------------------------------------------------------------------------------
// VALIDATOR FOR USER LOGIN
// Defines validation rules for user login
//-----------------------------------------------------------------------------------------------------------
const userLoginValidator = () => {
  return [
    // Validator for email field (optional in login)
    body("email")
      .optional()  // Email field is optional in login (username could be used instead)
      .isEmail()  // If email is provided, verifies it is valid
      .withMessage("Email is invalid"),  // Error message if email is not valid
    
    // Validator for password field (required in login)
    body("password")
      .notEmpty()  // Verifies that password field is not empty
      .withMessage("Password is required")  // Error message if password is empty
  ];
};

//-----------------------------------------------------------------------------------------------------------
// VALIDATOR FOR PASSWORD CHANGE
// Defines validation rules for changing current password
//-----------------------------------------------------------------------------------------------------------
const userChangeCurrentPasswordValidator = () => {
  return [
    // Validator for oldPassword field (current password)
    body("oldPassword")
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Old password is required"),  // Error message if old password is empty
    
    // Validator for newPassword field (new password)
    body("newPassword")
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("New password is required")  // Error message if new password is empty
  ];
};

//-----------------------------------------------------------------------------------------------------------
// VALIDATOR FOR FORGOTTEN PASSWORD REQUEST
// Defines validation rules for requesting password reset
//-----------------------------------------------------------------------------------------------------------
const userForgotPasswordValidator = () => {
  return [
    // Validator for email field (required for password reset)
    body("email")
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Email is required")  // Error message if email is empty
      .isEmail()  // Verifies that the value is a valid email
      .withMessage("Email is invalid")  // Error message if email is not valid
  ];
};

//-----------------------------------------------------------------------------------------------------------
// VALIDATOR FOR FORGOTTEN PASSWORD RESET
// Defines validation rules for actually resetting the password
//-----------------------------------------------------------------------------------------------------------
const userResetForgotPasswordValidator = () => {
  return [
    // Validator for newPassword field (new password after reset)
    body("newPassword")
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Password is required")  // Error message if new password is empty
  ];
};

//-----------------------------------------------------------------------------------------------------------
// VALIDATOR FOR PROJECT CREATION
// Defines validation rules for creating a new project
//-----------------------------------------------------------------------------------------------------------
const createProjectValidator = () => {
  return [
    // Validator for name field (project name)
    body("name")
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Name is required"),  // Error message if name is empty
    
    // Validator for description field (project description)
    body("description")
      .optional()  // Description field is optional
  ];
};

//-----------------------------------------------------------------------------------------------------------
// VALIDATOR FOR ADDING MEMBERS TO PROJECT
// Defines validation rules for adding a member to a project
//-----------------------------------------------------------------------------------------------------------
const addMembertoProjectValidator = () => {
  return [
    // Validator for email field (email of member to add)
    body("email")
      .trim()  // Removes whitespace from beginning and end of string
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Email is required")  // Error message if email is empty
      .isEmail()  // Verifies that the value is a valid email
      .withMessage("Email is invalid"),  // Error message if email is not valid
    
    // Validator for role field (member's role in project)
    body("role")
      .notEmpty()  // Verifies that the field is not empty
      .withMessage("Role is required")  // Error message if role is empty
      .isIn(AvailableUserRole)  // Verifies that role is among available roles
      .withMessage("Role is invalid")  // Error message if role is not valid
  ];
};

//-----------------------------------------------------------------------------------------------------------
// EXPORT ALL VALIDATORS
//-----------------------------------------------------------------------------------------------------------
export {
  userRegisterValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
  userResetForgotPasswordValidator,
  createProjectValidator,
  addMembertoProjectValidator,
};