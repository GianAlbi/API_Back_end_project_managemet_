// Import the Mongoose library to interact with MongoDB database
// Mongoose provides a schema-based solution for modeling application data
import mongoose from "mongoose";

// Async function to establish connection with MongoDB database
// This function is exported to be used in the main application file
const connectDB = async () => {
    try {
        // Attempt to establish connection with MongoDB database using URI from environment variables
        // process.env.MONGO_URI contains the connection string (ex: mongodb://localhost:27017/databaseName)
        // await suspends execution until the async connection operation completes
        await mongoose.connect(process.env.MONGO_URI);

        // If connection succeeds, print success message in console with checkmark icon
        // This visually confirms that the database is ready to receive operations
        console.log(" ✔ MongoDB Connected");
        

    } catch (error) {
        // If connection fails, the catch block captures the error
        // Print error message in console with cross icon and error details
        console.error(" ❌ MongoDB connection error", error);
        
        // Terminate Node.js process with exit code 1 (indicating error)
        // This is important because without connected database, the application cannot function properly
        // process.exit(1) stops server execution preventing unpredictable behavior
        process.exit(1);
        
    }
};

// Export the connectDB function as default export
// This allows importing and using the function in other files (ex: server.js or index.js)
export default connectDB;