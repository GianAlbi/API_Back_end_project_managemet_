// Import the multer module for file upload management
// Multer is a middleware for Express that facilitates file uploads via form-data
import multer from "multer";

// Configure storage for file uploads using multer.diskStorage
// diskStorage allows defining where to save files and how to rename them
const storage = multer.diskStorage({
  // destination function: determines the folder where uploaded files will be saved
  destination: function (req, file, cb) {
    // Specify the destination folder: ./public/images/
    // Files will be publicly accessible via URL
    cb(null, `./public/images`);
  },
  // filename function: determines how to rename uploaded files
  filename: function (req, file, cb) {
    // Create a unique filename using:
    // - Date.now(): current timestamp in milliseconds (ensures uniqueness)
    // - file.originalname: original filename maintaining the extension
    // Format: timestamp-originalname.extension (ex: 1635781234567-photo.jpg)
    cb(null, `${Date.now()}-${file.originalname}`);
  },
});

// Create and export the configured multer instance
// This instance will be used as middleware in routes that require file upload
export const upload = multer({
  storage,  // Use the storage configuration defined above
  limits: {
    fileSize: 1 * 1000 * 1000,  // Set maximum file size limit to 1MB
    // 1 * 1000 * 1000 = 1,000,000 bytes = 1 Megabyte
    // If a file exceeds this limit, multer will generate an error
  },
});