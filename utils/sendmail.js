require("dotenv").config();
const nodemailer = require("nodemailer");
const cron = require('node-cron');


const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: process.env.EMAIL_PORT,
  secure: process.env.EMAIL_SECURE === "true", // Use true if you are using a secure connection (e.g., for port 465)
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});


 const sendVerificationEmail = async (user, token) => {
  const verificationUrl = `${process.env.BASE_URL}/api/verify_email?token=${token}`;

  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: user.email,
    subject: "Verify Your Email",
    html: `<p>Click the link below to verify your email:</p><a href="${verificationUrl}">Verify Email</a>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
  }
};

// Function to send email when a task is assigned
const sendTaskAssignedEmail = async (userEmail, task) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Task Assigned",
    html: `<p>You have been assigned a new task: <strong>${task.description}</strong>.</p><p>Details: ${task.details}.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Task assigned email sent successfully");
  } catch (error) {
    console.error("Error sending task assigned email:", error);
  }
};

 const sendTaskStatusUpdateEmail = async (userEmail, taskId, status) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: userEmail,
    subject: "Task Status Updated",
    html: `<p>The status of task ID <strong>${taskId}</strong> has been updated to <strong>${status}</strong>.</p>`,
  };

  try {
    await transporter.sendMail(mailOptions);
    console.log("Task status update email sent successfully");
  } catch (error) {
    console.error("Error sending task status update email:", error);
  }
};

// // General notification email function
// const sendNotificationEmail = async (userEmail, subject, message) => {
//   const mailOptions = {
//     from: process.env.EMAIL_USER,
//     to: userEmail,
//     subject,
//     html: `<p>${message}</p>`,
//   };

//   try {
//     await transporter.sendMail(mailOptions);
//     console.log("Notification email sent successfully");
//   } catch (error) {
//     console.error("Error sending notification email:", error);
//   }
// };

module.exports = {
  sendVerificationEmail,
  sendTaskAssignedEmail,
  sendTaskStatusUpdateEmail,
 };
