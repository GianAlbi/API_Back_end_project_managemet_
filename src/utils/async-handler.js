// Define a higher-order function called asyncHandler that takes a requestHandler as parameter
// asyncHandler is a utility function that wraps controller functions to automatically handle errors
// This eliminates the need to write repetitive try-catch blocks in every controller
const asyncHandler = ( requestHandler ) => {  // requestHandler is the controller function we want to wrap

    // Return a new function that follows Express middleware signature (req, res, next)
    // This function will be used by Express as middleware to handle requests
    return (req, res, next) => {  // req = request object, res = response object, next = function to pass to next middleware

        // Wrap the execution of requestHandler in a Promise to handle asynchronous operations
        // Promise.resolve() converts any returned value into a Promise, whether it's sync or async
        Promise
        .resolve(requestHandler(req, res, next))  // Execute the original requestHandler passing req, res and next
        .catch((err) => next(err))  // If requestHandler throws an error (reject), catch it and pass it to Express error middleware
        // next(err) is the standard way in Express to pass errors to error handling middleware
    }
};

// Export the asyncHandler function to be used in other project files
// This allows importing and using asyncHandler to wrap all async controllers
export {asyncHandler};