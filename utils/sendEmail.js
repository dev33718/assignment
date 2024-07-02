const nodemailer = require('nodemailer');
const jwt = require('jsonwebtoken');

const sendEmail = async (to) => {
  try {
    const transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          type: 'OAUTH2',
          user: process.env.EMAIL_USER,
          accessToken: process.env.ACCESS_TOKEN
        },
      });
      const token = jwt.sign({ to }, process.env.JWT_SECRET, { expiresIn: '1h' });
      const link = `http://localhost:3000/dashboard?token=${token}`;
      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: to,
        subject: 'Registration Confirmation',
        text: `You are registered. Click on the link to complete the registration: ${link}`,
      };

    await transporter.sendMail(mailOptions);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email:', error);
  }
};

module.exports = sendEmail;