// Import Mongoose and Schema module from mongoose library
// Mongoose is an ODM (Object Document Mapper) that provides a schema-based solution for modeling application data
import mongoose, { Schema } from "mongoose";

// Import available user role constants from constants.js file
// AvailableUserRole contains the array of valid roles, UserRolesEnum contains constants for each role
import { AvailableUserRole, UserRolesEnum } from "../utils/constants.js";

// Define the schema for project members
// This schema manages the many-to-many relationship between users and projects with their respective roles
const projectMemberSchema = new Schema(
  {
    // user field: reference to the user who is a member of the project
    user: {
      type: Schema.Types.ObjectId,  // MongoDB ObjectId type to store the user ID
      ref: "User",  // Reference to the User model to populate user data
      required: true,  // Required field - every member must be associated with a user
    },
    
    // project field: reference to the project the user belongs to
    project: {
      type: Schema.Types.ObjectId,  // MongoDB ObjectId type to store the project ID
      ref: "Project",  // Reference to the Project model to populate project data
      required: true,  // Required field - every member must be associated with a project
    },
    
    // role field: defines the user's role within the project
    role: {
      type: String,  // String type to store the role
      enum: AvailableUserRole,  // Limits possible values to the array of available roles
      default: UserRolesEnum.MEMBER,  // Default value: MEMBER (base role for new members)
    },
  },
  { timestamps: true },  // Schema options: automatically adds createdAt and updatedAt fields
);

// Create and export the ProjectMember model based on the defined schema
// 'ProjectMember' is the model name that Mongoose will use for the 'projectmembers' collection (automatically pluralizes)
export const ProjectMember = mongoose.model(
  "ProjectMember",  // Model name
  projectMemberSchema,  // Schema defined above
);