// Import the Router class from the Express framework
// Router allows creating modular and mountable route modules
import { Router } from "express";

// Import the healthCheck function from healthcheck.controller.js file
// This function contains the logic to handle server health check requests
import { healthCheck } from "../controllers/healthcheck.controllers.js";


// Create a new instance of Express Router
// This router will be dedicated exclusively to health check related routes
const router = Router();

// Define a route for the root path ("/") that responds only to GET method
// router.route("/") creates a chainable route handler for the specified path
// .get(healthCheck) associates the HTTP GET method with the imported healthCheck function
// When making a GET request to "/", the healthCheck function will be executed
router.route("/").get(healthCheck);

// Export the router as default export
// This allows importing and mounting this router in the main Express application
export default router;