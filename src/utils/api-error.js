// Define a custom ApiError class that extends JavaScript's native Error class
// This class standardizes error handling in the application with consistent structure
class ApiError extends Error {  // 'extends Error' means ApiError inherits all properties and methods from Error class

    // Class constructor that initializes a new instance of ApiError
    // Defines parameters with default values for usage flexibility
    constructor(
        statusCode,        // HTTP status code for the error (required, ex: 400, 404, 500)
        message = "Something went wrong",  // Descriptive error message (default in English)
        errors = [],       // Optional array for multiple validation errors or additional details
        stack = ""         // Optional stack trace for debugging (if empty, generated automatically)
    ){
        // Call the parent class constructor (Error) passing the message
        // This initializes the basic properties of the Error class
        super(message)
        
        // Set the HTTP status code for the error (ex: 400 Bad Request, 404 Not Found, 500 Internal Server Error)
        this.statusCode = statusCode;
        
        // Set data to null since we don't return useful data in errors
        // Maintains consistency with ApiResponse structure but without data
        this.data = null;
        
        // Override the inherited message (even though super(message) already sets it, we reiterate for clarity)
        this.message = message;
        
        // Always set success to false for errors (consistent with ApiResponse where success = statusCode < 400)
        this.success = false;
        
        // Store the array of additional errors (useful for validation errors with multiple violations)
        this.errors = errors;

        // Stack trace handling for debugging
        if(stack){
            // If a custom stack trace was provided, use that one
            this.stack = stack;
        } else {
            // If no stack trace was provided, capture it automatically
            // Error.captureStackTrace creates a .stack property on the error instance
            // The second parameter (this.constructor) excludes the ApiError constructor from the stack trace
            Error.captureStackTrace(this, this.constructor);
        }

    }
}

// Export the ApiError class to be used in other project files
// This allows throwing standardized errors in any part of the application
export {ApiError};