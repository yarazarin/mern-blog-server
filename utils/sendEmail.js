const sendEmail = async (to, subject, text) => {
    try {
        // In production (Render), just log the email - no need for Gmail credentials
        if (process.env.NODE_ENV === "production") {
            console.log("=== EMAIL SIMULATION ===");
            console.log("To:", to);
            console.log("Subject:", subject);
            console.log("Text:", text);
            console.log(
                "Code:",
                text.match(/(\d{6})/)?.[1] || "N/A"
            );
            console.log("========================");
            return;
        }

        // In development, send real email if Gmail credentials are provided
        if (
            !process.env.EMAIL_USER ||
            !process.env.EMAIL_PASS
        ) {
            console.log(
                "=== EMAIL SIMULATION (No Gmail credentials) ==="
            );
            console.log("To:", to);
            console.log("Subject:", subject);
            console.log("Text:", text);
            console.log(
                "Code:",
                text.match(/(\d{6})/)?.[1] || "N/A"
            );
            console.log("========================");
            return;
        }

        // Send real email in development
        const nodemailer = require("nodemailer");
        const transporter = nodemailer.createTransport({
            service: "gmail",
            auth: {
                user: process.env.EMAIL_USER,
                pass: process.env.EMAIL_PASS,
            },
        });

        await transporter.sendMail({
            from: process.env.EMAIL_USER,
            to,
            subject,
            text,
        });
        console.log("Email sent successfully");
    } catch (error) {
        console.error("Error sending email:", error);
        throw error;
    }
};

module.exports = sendEmail;
