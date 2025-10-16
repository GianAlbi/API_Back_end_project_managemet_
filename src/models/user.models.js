// Import Mongoose and Schema module from mongoose library
// Mongoose is an ODM (Object Document Mapper) that provides a schema-based solution for modeling application data
import mongoose, {Schema} from "mongoose";

// Import bcrypt library for password hashing
// bcrypt is a cryptography library specialized in secure password hashing
import bcrypt from "bcrypt";

// Import jsonwebtoken library for JWT token generation and verification
// JWT (JSON Web Token) is an open standard for creating access tokens
import jwt from "jsonwebtoken";

// Import Node.js crypto module for cryptographic operations
// Crypto provides cryptographic functionalities for generating secure tokens
import crypto from "crypto";

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// Define the user schema that specifies the structure of documents in the 'users' MongoDB collection
// The schema defines fields, data types, validations, and options for each user document
const userSchema = new Schema(
    {
        // avatar field: represents the user profile image with support for URL and local path
        avatar: {
            type: {  // Defines a subdocument with two fields to manage the avatar
                url: String,  // Public URL of the avatar image (for externally hosted images)
                localPath: String,  // Local file path of the avatar (for images uploaded to the server)
            },
            default: {  // Default values for avatar when not specified
                url: `https://placehold.co/200x200`,  // Default placeholder image of 200x200 pixels
                localPath: ""  // Empty local path by default
            }
        },

        // username field: unique username for identification and login
        username: {
            type: String,  // String type for username
            required: true,  // Required field - must always be present
            unique: true,  // Must be unique across the entire collection (no duplicates)
            lowercase: true,  // Automatically converts value to lowercase before saving
            trim: true,  // Removes whitespace from beginning and end of value
            index: true  // Creates database index for faster searches on username field
        },

        // email field: user's email address for communications and password recovery
        email: {
            type: String,  // String type for email address
            required: true,  // Required field - must always be present
            unique: true,  // Must be unique across the entire collection (no duplicate emails)
            lowercase: true,  // Automatically converts value to lowercase before saving
            trim: true,  // Removes whitespace from beginning and end of value
        },

        // fullName field: user's full name (optional field)
        fullName: {
            type: String,  // String type for full name
            trim: true  // Removes whitespace from beginning and end of value
        },

        // password field: encrypted user password for authentication
        password: {
            type: String,  // String type for password (will be hashed before saving)
            required: [true, "Password is required"]  // Required field with custom error message
        },

        // isEmailVerified field: flag indicating whether the user's email has been verified
        isEmailVerified: {
            type: Boolean,  // Boolean type (true/false)
            default: false  // Default value false - email is not verified upon creation
        },

        // refreshToken field: JWT token for authentication refresh
        refreshToken: {
            type: String  // String type to store the JWT refresh token
        },

        // forgotPasswordToken field: temporary token for password reset
        forgotPasswordToken: {
            type: String  // String type to store the password reset token
        },

        // forgotPasswordExpiry field: expiration date of the password reset token
        forgotPasswordExpiry: {
            type: Date  // Date type to store the reset token expiration
        },

        // emailVerificationToken field: token for email address verification
        emailVerificationToken: {
            type: String  // String type to store the email verification token
        },

        // emailVerificationExpiry field: expiration date of the email verification token
        emailVerificationExpiry: {
            type: Date  // Date type to store the verification token expiration
        }

    }, {
        // Schema options
        timestamps: true  // Automatically adds createdAt and updatedAt fields to each document
        // createdAt: document creation date (auto-generated)
        // updatedAt: document last modification date (auto-updated)
    }
);

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// PRE-SAVE MIDDLEWARE (PRE HOOKS) - Executed automatically before document saving
// This middleware triggers every time a User document is about to be saved to the database
userSchema.pre("save", async function(next) {  // "save" is the event that triggers this middleware

    // Check if the password field has been modified in the current save operation
    // If password has not been modified, skip hashing and proceed with saving
    // This avoids re-hashing an already hashed password when updating other fields
    if (!this.isModified("password")) return next()

    // If password has been modified, hash the password using bcrypt
    // bcrypt.hash() takes two parameters: plaintext password and number of salt rounds (10 = good security/performance balance)
    // await waits for completion of the asynchronous hashing operation
    this.password = await bcrypt.hash(this.password, 10)

    // Call next() to proceed with saving the document to the database
    // Without next(), saving would block indefinitely
    next()
});

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// INSTANCE METHOD TO VERIFY PASSWORD - Added to schema as custom method
// This method can be called on any User model instance to verify a password
userSchema.methods.isPasswordCorrect = async function(password) {  // Defines an instance method called isPasswordCorrect
    // Compare the provided password (plaintext) with the hashed password saved in the database
    // bcrypt.compare() takes plaintext password and saved hash, then returns true/false
    // await waits for completion of the asynchronous comparison
    // return directly returns the comparison result (true = correct password, false = wrong password)
    return await bcrypt.compare(password, this.password)  // this.password refers to the current user's hashed password
};

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// METHOD TO GENERATE JWT ACCESS TOKEN
// This method generates a short-lived access token for authentication
userSchema.methods.generateAccessToken = function(){
    // Create and return a signed JWT (JSON Web Token)
    return jwt.sign(
        // Token payload: data that will be included in the token
        {
            _id: this._id,           // Unique user ID from database
            email: this.email,        // User's email
            username: this.username   // User's username
        },
        // Secret key to sign the token, taken from environment variables
        process.env.ACCESS_TOKEN_SECRET,
        // Token options: specifies token expiration
        { expiresIn: process.env.ACCESS_TOKEN_EXPIRY }
    )
};

// METHOD TO GENERATE JWT REFRESH TOKEN  
// This method generates a long-lived refresh token to obtain new access tokens
userSchema.methods.generateRefreshToken = function(){
    // Create and return a JWT (JSON Web Token) for refresh
    return jwt.sign(
        // Token payload: contains only user ID to minimize exposed data
        {
            _id: this._id,  // Only user ID is needed for refresh token
        },
        // Secret key to sign the refresh token, taken from environment variables
        process.env.REFRESH_TOKEN_SECRET,
        // Token options: specifies refresh token expiration
        { expiresIn: process.env.REFRESH_TOKEN_EXPIRY }
    )
};

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// METHOD TO GENERATE TEMPORARY TOKENS (email verification, password reset)
// This method generates secure tokens for temporary operations like email verification and password reset
userSchema.methods.generateTemporaryToken = function(){
    // Generate a random unhashed token of 20 bytes and convert to hexadecimal
    const unHashedToken = crypto.randomBytes(20).toString("hex")

    // Create a hashed version of the token for secure storage in database
    // SHA-256 is a secure cryptographic hashing algorithm
    const HashedToken = crypto
        .createHash("sha256")        // Create hash object using SHA-256 algorithm
        .update(unHashedToken)       // Input the unhashed token into the algorithm
        .digest("hex")               // Convert result to hexadecimal string

    // Calculate token expiration date: current time + 20 minutes
    const tokenExpiry = Date.now() + (20 * 60 * 1000) // 20 minutes in milliseconds

    // Return an object with all token information
    return {unHashedToken, HashedToken, tokenExpiry}
};

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// Create and export the User model based on the defined schema
// 'User' is the model name that Mongoose will use for the 'users' collection (automatically pluralizes)
// The model provides methods to create, read, update, and delete documents in the collection
export const User = mongoose.model("User", userSchema);