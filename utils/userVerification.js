require('dotenv').config();
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST, 
  port: process.env.EMAIL_PORT,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

 const sendVerificationEmailPassword = async (email, verificationToken) => {
  const verificationUrl = `${process.env.BASE_URL}/api/send-verification?token=${verificationToken}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,   
    to: email,
    subject: "Set Your Password",
    html: `<p>Please Enter new password on this link:</p><a href="${verificationUrl}">Verify Email</a>`,
  };

  await transporter.sendMail(mailOptions);
};

module.exports = { sendVerificationEmailPassword };