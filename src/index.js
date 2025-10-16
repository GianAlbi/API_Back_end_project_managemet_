
// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------
// MAIN APPLICATION FILE (index.js or server.js)

import dotenv from "dotenv";  // Imports dotenv package to manage environment variables

import app from "./app.js";  // Imports configured Express application from app.js file

import connectDB from "./db/index.js";  // Imports database connection function for MongoDB

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

dotenv.config({  // Configures dotenv to load environment variables into Node.js process
    path: "./.env"  // Specifies path of .env file to load variables from (in project root)
});

// -----------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// Defines server port: takes from .env or uses default 3000
// process.env.PORT comes from environment variables loaded by dotenv
const PORT = process.env.PORT || 3000;  // Uses port from .env if defined, otherwise uses 3000


// ------------------------------------------------------------------------------------------------
// -----------------------------------------------------------------------------------------------

// Callback function when server goes online
// Starts server on specified port only after database is connected
connectDB()  // Calls MongoDB database connection function
    .then(() => {  // If database connection succeeds
        // Starts Express server on specified port
        app.listen(PORT, () => console.log(` ✔ Server started on port ${PORT} Link => http://localhost:${PORT}`)); 
    })
    .catch((err) => {  // If database connection fails
        // Prints MongoDB connection error in console
        console.error("MongoDB connection error", err);
        // Terminates Node.js process with error code 1
        process.exit(1);
    });

// Makes server listen on specified port and logs access URL