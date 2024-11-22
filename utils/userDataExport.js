require("dotenv").config();
const nodemailer = require("nodemailer");

const sendVerificationEmail = async (emailAddress, filePath) => {
  const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST,
    port: process.env.EMAIL_PORT,
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: emailAddress,   
    subject: "Employee CSV Export",
    text: "Please find attached the employee CSV file.",
    attachments: [
      {
        filename: "employees.csv",
        path: filePath,
      },
    ],
  };
  
  console.log("Email address:", emailAddress);


  try {
    await transporter.sendMail(mailOptions);
    console.log("Email sent successfully");
  } catch (error) {
    console.error("Error sending email:", error);
    throw new Error("Failed to send email");
  }
};

module.exports = { sendVerificationEmail };