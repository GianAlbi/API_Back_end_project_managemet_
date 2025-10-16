// Import the ApiResponse class from the utils/api-response.js file
// ApiResponse standardizes the structure of all API responses in the application
import { ApiResponse } from "../utils/api-response.js";

// Import the asyncHandler function from the utils/async-handler.js file
// asyncHandler is a utility wrapper that automatically handles errors in async functions
// Eliminates the need to write repetitive try-catch blocks in every controller
import { asyncHandler } from "../utils/async-handler.js";


// COMMENTED VERSION of healthCheck controller with manual error handling:
// This approach requires an explicit try-catch block for each async function

// const healthCheck = async (req, res, next) => {
//     try {
//         const user = await getUserFromDB()  // Example of async operation that might fail
//         res
//         .status(200)
//         .json(
//             new ApiResponse(200, {message: "Server is running"})
//         )
//     } catch (error) {
//         next(err);  // Passes the error to Express error handling middleware
//     }
// };


// IMPROVED VERSION of healthCheck controller using asyncHandler:
// asyncHandler wraps the function and automatically handles errors
// If an error occurs in async operations, it is automatically passed to next()

const healthCheck = asyncHandler(async (req, res) => {  // asyncHandler automatically catches any errors

    // Executes controller logic without needing a try-catch block
    // If this operation fails, asyncHandler would automatically catch the error
    res
    .status(200)  // Sets HTTP status to 200 (OK)
    .json(new ApiResponse(200, { message: "Server is Running" }));  // Returns a standardized response with ApiResponse
});

// Export the healthCheck function to be used in application routes
// This allows importing and mounting the controller in routing files
export { healthCheck };