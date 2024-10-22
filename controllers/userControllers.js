// const express = require("express");
// const User = require("../model/userModel");
// const Roles = require("../utils/roles");
// const mailto = require("../utils/userVerification");

// exports.createUser = async (req, res) => {
//   const { username, password, email, newRoleId } = req.body; 
//   const { roleId } = req.user;  

//   try {
//     // console.log('Logged-in user roleId:', roleId);
//     // console.log('New user roleId:', newRoleId);
 
//      if (roleId === Roles.admin) {
//      } else if (roleId === Roles.manager) {
//        if (newRoleId !== Roles.manager && newRoleId !== Roles.employee) {
//         return res.status(403).json({ message: "As a manager, you can only create manager or employee roles." });
//       }
//     } else if (roleId === Roles.employee) {
//        return res.status(403).json({ message: "You do not have permission to create a user." });
//     } else {
//       return res.status(400).json({ message: "Invalid role ID." });
//     }
//      const newUser = new User({ username, password, email, roleid: newRoleId });  
//     await newUser.save();
//     res.status(201).json({ message: "User created successfully", user: newUser   });
//   } catch (error) {
//      res.status(500).json({ message: "Error creating user", error });
//   }
// };

// //in this user i want now email verification from user isVerified hai or whah pe hi new password or confom password password nhi set krna hai 



// exports.sendVerification = async (req, res) => {
//   const { email, verificationToken, newPassword, confirmPassword } = req.body;

//   // Check if new password and confirm password match
//   if (newPassword !== confirmPassword) {
//     return res.status(400).json({ message: "Passwords do not match" });
//   }

//   try {
//     // Send verification email with password fields
//     await mailto.sendVerificationEmail(email, verificationToken, newPassword);

//     res.status(200).json({ message: "Verification email sent successfully." });
//   } catch (error) {
//     res.status(500).json({ message: "Error sending verification email", error });
//   }
// };



const express = require("express");
const User = require("../model/userModel");
const Roles = require("../utils/roles");
const mailto = require("../utils/userVerification");
const bcrypt = require("bcryptjs");
const crypto = require("crypto");

exports.createUser = async (req, res) => {
  const { username, password, email, newRoleId } = req.body; 
  const { roleId } = req.user;  

  try {
     if (roleId === Roles.admin) {
     } else if (roleId === Roles.manager) {
      if (newRoleId !== Roles.manager && newRoleId !== Roles.employee) {
        return res.status(403).json({ message: "As a manager, you can only create manager or employee roles." });
      }
    } else if (roleId === Roles.employee) {
      return res.status(403).json({ message: "You do not have permission to create a user." });
    } else {
      return res.status(400).json({ message: "Invalid role ID." });
    }

     const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const hashedPassword = crypto.createHash('sha256').update(password).digest('hex'); // Hash password with crypto

    const verificationToken = crypto.randomBytes(32).toString("hex");

     const newUser = new User({
      username,
      email,
      roleid: newRoleId,
      password: hashedPassword, 
      isVerified: false,
      verificationToken,  
    });

    await newUser.save();
    await mailto.sendVerificationEmail(email, verificationToken);

    res.status(201).json({
      message: "User created successfully. Please check your email for verification.",
      user: {
        username: newUser.username,
        email: newUser.email,
        roleid: newUser.roleid,
      },
    });
  } catch (error) {
    console.error("Error details:", error);  
    res.status(500).json({ message: "Error creating user", error: error.message || error });
  }
};


exports.createNewPassword = async (req, res) => {
  const { email, verificationToken, newPassword, confirmPassword } = req.body;

   if (newPassword !== confirmPassword) {
    return res.status(400).json({ message: "Passwords do not match." });
  }

  try {
     const user = await User.findOne({ email, verificationToken });
    if (!user) {
      return res.status(400).json({ message: "Invalid verification token or email." });
    }
     const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isVerified = true; 
    user.verificationToken = undefined; 
    await user.save(); 

    res.status(200).json({ message: "Email verified and password set successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error processing verification", error });
  }
};
