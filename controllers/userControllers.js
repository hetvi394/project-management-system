const express = require("express");
const User = require("../model/userModel");
const Roles = require("../utils/roles");

exports.createUser = async (req, res) => {
  const { username, password, email, newRoleId } = req.body; 
  const { roleId } = req.user;  

  try {
    // console.log('Logged-in user roleId:', roleId);
    // console.log('New user roleId:', newRoleId);

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

     const newUser = new User({ username, password, email, roleid: newRoleId });
    await newUser.save();
    res.status(201).json({ message: "User created successfully", user: newUser });
  } catch (error) {
     res.status(500).json({ message: "Error creating user", error });
  }
};