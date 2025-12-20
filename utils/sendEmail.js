const sendEmail = async (to, subject, text) => {
  try {
    // In production (Render), just log the email
    if (process.env.NODE_ENV === 'production') {
      console.log('=== EMAIL SIMULATION ===');
      console.log('To:', to);
      console.log('Subject:', subject);
      console.log('Text:', text);
      console.log('Code:', text.match(/(\d{6})/)?.[1] || 'N/A');
      console.log('========================');
      return;
    }

    // In development, send real email
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });

    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to,
      subject,
      text
    });
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
    throw error;
  }
};

module.exports = sendEmail;
