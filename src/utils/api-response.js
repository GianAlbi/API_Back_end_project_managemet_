// Class to standardize API responses throughout the project
// This ensures that all responses have the same consistent structure
class ApiResponse {  // NOTE: "Response" would be the correct spelling, but we keep your name

    // Class constructor that initializes a new instance of ApiResponse
    // Defines the standard structure that all API responses will have
    constructor(statusCode, data, message = "Success") {  // Parameters are: HTTP statusCode, data to return, optional message
        this.statusCode = statusCode;  // Stores the HTTP status code (ex: 200, 201, 400, 404, 500)
        this.data = data;  // Stores the actual data to return to the client (can be any type: object, array, string, etc.)
        this.message = message;  // Stores the descriptive response message (default: "Success" if not specified)
        this.success = statusCode < 400;  // Automatically calculates if the response is successful based on status code
        // statusCode < 400 means: all 2xx and 3xx codes are considered success, 4xx and 5xx are errors
    }
}

// Export the ApiResponse class to be used in other project files
// This allows importing and using the class in any controller or route handler
export { ApiResponse };