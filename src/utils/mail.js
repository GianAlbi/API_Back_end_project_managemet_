// Import Mailgen - a library for generating responsive and professional emails
// Mailgen allows creating well-structured HTML email templates with minimal effort
import Mailgen from "mailgen";

// Import nodemailer - a library for sending emails with Node.js
// Nodemailer provides a simple interface for sending emails through various SMTP services
import nodemailer from "nodemailer";

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// MAIN FUNCTION FOR SENDING EMAILS
// This function handles the preparation and sending of emails
const sendEmail = async (options) => {
    // Create a Mailgen instance with basic configuration
    const mailGenerator = new Mailgen({
        theme: "default",  // Use Mailgen's default theme for the email
        product: {
            name: "Task Manager",  // Application name that appears in the email
            link: "https://taskmanagerlink.com"  // Link to the application website
        }
    })

    // Generate the textual version of the email (for email clients that don't support HTML)
    const emailTextual = mailGenerator.generatePlaintext(options.mailgenContent)
    
    // Generate the HTML version of the email (for modern email clients)
    const emailHtml = mailGenerator.generate(options.mailgenContent)

    //-------------------------------------------------------------------------------------------------------
    // NODEMAILER TRANSPORTER CONFIGURATION
    // Create an SMTP transporter for actual email sending
    
    const transporter = nodemailer.createTransport({
        host: process.env.MAILTRAP_SMTP_HOST,  // SMTP host of Mailtrap service (from environment variables)
        port: process.env.MAILTRAP_SMTP_PORT,  // SMTP port of Mailtrap service (from environment variables)
        auth: {
            user: process.env.MAILTRAP_SMTP_USER,  // Username for SMTP authentication (from environment variables)
            pass: process.env.MAILTRAP_SMTP_PASS   // Password for SMTP authentication (from environment variables)
        }
    })

    // Configure the email object with all necessary details
    const mail = {
        from: "mail.taskmanager@example.com",  // Sender's email address
        to: options.email,                      // Recipient's email address (passed as parameter)
        subject: options.subject,               // Email subject (passed as parameter)
        text: emailTextual,                     // Textual content of the email
        html: emailHtml                         // HTML content of the email
    }

    // Email sending attempt with error handling
    try {
        // Send the email using the configured transporter
        await transporter.sendMail(mail)
        
    } catch (error) {
        // Error handling - show user-friendly error message in console
        console.error("Email service failed silently. Make sure that you have provided your MAILTRAP credentials in the .env file");
        
        // Complete error log for debugging
        console.error("Error: ", error);
    }

};

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// FUNCTION TO GENERATE EMAIL VERIFICATION CONTENT
// Creates the template for email address verification email
const emailVerificationMailgenContent = (username, verificationUrl) => {
    // Returns an object that defines the email structure
    return {
        // body section: contains the main content of the email
        body: {
            // Recipient's name that will appear in the personalized greeting
            name: username,
            // Message introduction - welcome text
            intro: "Welcome to our App! we're excited to have you on board.",
            // action section: contains instructions and button for verification
            action: {
                // Textual instructions explaining what to do
                instructions: "To verify your email please click on the following button",
                // Clickable button configuration
                button: {
                    color: "#22BC66",        // Green color for the button (hexadecimal code)
                    text: "Verify your email", // Text displayed on the button
                    link: verificationUrl,   // URL the button points to (to verify email)
                },
            },
            // Email closing text - offers user support
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        },
    };
};

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// FUNCTION TO GENERATE PASSWORD RESET EMAIL CONTENT
// Creates the template for forgotten password reset email
const forgotPasswordMailgenContent = (username, passwordResetUrl) => {
    // Returns an object that defines the email structure
    return {
        // body section: contains the main content of the email
        body: {
            // Recipient's name that will appear in the personalized greeting
            name: username,
            // Introduction explaining the reason for the email
            intro: "We got a request to reset the password of your account",
            // action section: contains instructions and button for password reset
            action: {
                // Detailed instructions on how to proceed with the reset
                instructions: "To reset your password click on the following button or link.",
                // Clickable button configuration
                button: {
                    color: "#22BC66",        // Green color for the button (same as verification email)
                    text: "Reset password",  // Text displayed on the button
                    link: passwordResetUrl,  // URL the button points to (to reset password)
                },
            },
            // Email closing text - offers user support
            outro: "Need help, or have questions? Just reply to this email, we'd love to help."
        },
    };
};

//-----------------------------------------------------------------------------------------------------------
//-----------------------------------------------------------------------------------------------------------

// Export the three functions to be used in other files
// These functions will be used by the email sending service to generate and send email content
export { emailVerificationMailgenContent, forgotPasswordMailgenContent, sendEmail };