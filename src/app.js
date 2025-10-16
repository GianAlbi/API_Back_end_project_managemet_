// Import the Express framework from the express library
// Express is a minimal and flexible web framework for Node.js
// that provides a robust set of features for web applications and APIs
import express from 'express';

// Import CORS middleware (Cross-Origin Resource Sharing) from cors library
// CORS allows web applications on different domains to make requests to the API
import cors from "cors";

// Import cookie-parser middleware to parse and manage cookies in HTTP requests
// cookie-parser extracts cookies from request headers and makes them available in req.cookies
import cookieParser from "cookie-parser";

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// Create an Express application instance by calling the express() function
// This instance (app) represents our web application and will be used
// to configure middleware, define routes, and start the server
const app = express();

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// BASIC MIDDLEWARE - Fundamental configurations for request parsing

// Middleware to parse request body in JSON format
app.use(express.json({ limit: "16kb"}));  // Sets a 16kb limit to prevent DOS attacks with large payloads

// Middleware to parse request body in URL-encoded format (from HTML forms)
app.use(express.urlencoded({ extended: true, limit: "16kb"}));  // extended: true allows parsing nested objects

// Middleware to serve static files (images, CSS, JS) from the "public" folder
app.use(express.static("public"));  // Files in the public folder will be directly accessible via URL

// Middleware to parse cookies from HTTP requests
// cookieParser() analyzes the Cookie header and populates req.cookies with an object containing cookies
app.use(cookieParser());

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------
// CORS CONFIGURATION - Cross-origin access control

// Configure CORS middleware with specific options for security and functionality
app.use(cors({
    origin: process.env.CORS_ORIGIN?.split(",") || "http://localhost:5173",  // Authorized domains: from .env or localhost:5173 (Vite)
    credentials: true,  // Allows sending cookies and authentication headers between different domains
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],  // Allowed HTTP methods
    allowedHeaders: ["Content-Type", "Authorization"]  // Allowed headers in requests
}));

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// Import health check router from healthcheck.routes.js file
// This router contains specific routes for server status checking
import healthCheckRouter from "./routes/healthcheck.routes.js";

// Import authentication router from auth.routes.js file
// This router contains all routes related to authentication (login, registration, etc.)
import authRouter from "./routes/auth.routes.js";

// Mount health check router under the base path /api/v1/healthcheck
// All routes defined in healthCheckRouter will be accessible via /api/v1/healthcheck/...
// The v1 version in the URL allows future API evolutions while maintaining compatibility
app.use("/api/v1/healthcheck", healthCheckRouter);

// Mount authentication router under the base path /api/v1/auth
// All routes defined in authRouter will be accessible via /api/v1/auth/...
// Example: /api/v1/auth/register for user registration
app.use("/api/v1/auth", authRouter);

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// MAIN ROUTE - Welcome endpoint and application landing page
// Defines the main (root) route of the application that responds to the '/' path
app.get('/', (req, res) => {  // GET route for the '/' path that serves as welcome page
    return res.status(200).json({ message: "Welcome to basecampy"});  // Responds with 200 OK status and welcome message in JSON format
});

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// Export the Express application instance as default export
// This allows importing and using the same app instance in other project files
// while maintaining centralized application configuration
export default app;