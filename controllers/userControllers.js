const express = require("express");
const User = require("../model/userModel");
const Roles = require("../utils/roles");
const mailto = require("../utils/userVerification");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utils/jwttoken");
const Task = require("../model/taskModel");
const Project = require("../model/projectModel");
const AssignedTask = require("../model/assignTaskModel");
// const { calculateUserPerformance } = require('../utils/calculatePerformance');
const balanceleave = require("../model/balanceModel")
// var cron = require('node-cron');


exports.createUser = async (req, res) => {
  const { username, email, newRoleId } = req.body;
  const { roleId } = req.user;

  try {
    if (roleId === Roles.admin) {
    } else if (roleId === Roles.manager) {
      if (newRoleId !== Roles.manager && newRoleId !== Roles.employee) {
        return res.status(403).json({
          message:
            "As a manager, you can only create manager or employee roles.",
        });
      }
    } else if (roleId === Roles.employee) {
      return res
        .status(403)
        .json({ message: "You do not have permission to create a user." })  ;
    } else {
      return res.status(400).json({ message: "Invalid role ID." });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "Email already in use." });
    }

    const verificationToken = generateToken({ email, newRoleId }, "1h");
    const verificationTokenExpires = Date.now() + 3600000;

    const newUser = new User({
      username,
      email,
      roleid: newRoleId,
      isVerified: false,
      verificationToken,
      verificationTokenExpires,
     });
    const token = generateToken(newUser._id);
    newUser.token = token;
     Balanceleave = new balanceleave({  
      userId: newUser._id,
      totalBalance: 12
    })
    // cron.schedule('* * * * *', () => {
    //   console.log('running a task every minute'); 
    // });
      await Balanceleave.save();
    await newUser.save();
    await mailto.sendVerificationEmailPassword(email, verificationToken);
    res.status(201).json({
      message:
        "User created successfully. Please check your email for verification.",
      user: {
        username: newUser.username,
        email: newUser.email,
        roleid: newUser.roleid,
      },
    });
  } catch (error) {
    console.error("Error details:", error);
    res
      .status(500)
      .json({ message: "Error creating user", error: error.message || error });
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
      return res
        .status(400)
        .json({ message: "Invalid verification token or email." });
    }

    if (user.verificationTokenExpires < Date.now()) {
      return res.status(400).json({
        message: "Verification token has expired. Please request a new one.",
      });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    user.password = hashedPassword;
    user.isVerified = true;
    user.verificationToken = undefined;
    user.verificationTokenExpires = undefined;
    await user.save();

    res
      .status(200)
      .json({ message: "Email verified and password set successfully." });
  } catch (error) {
    res.status(500).json({ message: "Error processing verification", error });
  }
};

exports.assignRole = async (req, res) => {
  try {
    const userId = req.params.id;
    const { roleId } = req.user;
    const { newRoleId } = req.body;

    if (!req.user || !req.user.roleId) {
      return res
        .status(401)
        .json({ message: "Unauthorized. User information not available." });
    }
    if (roleId === Roles.admin) {
      console.log("Admin is assigning roles.");
    } else if (roleId === Roles.manager) {
      if (newRoleId == Roles.admin) {
        return res
          .status(403)
          .json({ message: "As a manager, you cannot assign admin roles." });
      }
    } else if (roleId === Roles.employee) {
      return res
        .status(403)
        .json({ message: "You do not have permission to assign roles." });
    } else {
      return res.status(400).json({ message: "Invalid role ID." });
    }

    const existingUser = await User.findById(userId);
    if (!existingUser) {
      return res.status(404).json({ message: "User not found." });
    }

    existingUser.roleId = newRoleId;
    const newToken = generateToken(existingUser._id); 
    existingUser.token = newToken; 
    await existingUser.save();
    res
      .status(200)
      .json({ message: "User role updated successfully.", user: existingUser });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({ message: "An error occurred.", error: error.message });
  }
};

// exports.getDashboardStats = async (req, res) => {
//   try {
//     const projectsByManager = await User.aggregate([
//       { $match: { roleId: { $exists: true } } },
//       { $group: { _id: "$roleId", projectCount: { $sum: 1 } } },
//       { $project: { roleId: "$_id", projectCount: 1, _id: 0 } },
//     ]);

//     const projectstatus = await Project.aggregate([
//       { $group: { _id: "$status", count: { $sum: 1 } } },
//     ]);

// const noProjectEmployees = await User.aggregate([
//   { $match: { role: "employee", projectId: { $exists: false } } },
//   { $count: "noProjectEmployees" },
// ]);

// const overdueTasks = await Task.aggregate([
//   { $match: { endDate: { $lt: new Date() } } },
//   { $count: "overdueTasks" },
// ]);

//     const [totalTasks, totalEmployees, totalProjects, totalManagers] =
//       await Promise.all([
//         Task.countDocuments({}),
//         User.countDocuments({ roleId: 1 }),
//         Project.countDocuments({}),
//         User.countDocuments({ roleId: 2 }),
//       ]);

//     res.status(200).json({
//       projectsByManager,
//       projectsByStatus,
//       totalTasks,
//       totalEmployees,
//       totalProjects,
//       totalManagers,
//     });
//   } catch (error) {
//     console.error("Error fetching dashboard statistics:", error);
//     res
//       .status(500)
//       .json({ message: "An error occurred fetching statistics", error });
//   }
// };

exports.getStatistics = async (req, res) => {
  try {
    const statistics = await User.aggregate([
      {
        $facet: {
          totalEmployeeCount: [{ $match: { roleId: 3 } }, { $count: "count" }],
          totalManagerCount: [{ $match: { roleId: 2 } }, { $count: "count" }],
          projectsStatus: [
            {
              $lookup: {
                from: "projects",
                localField: "_id",
                foreignField: "assignedTo",
                as: "projects",
              },
            },
            {
              $unwind: { path: "$projects", preserveNullAndEmptyArrays: true },
            },
            {
              $group: {
                _id: "$projects.status",
                count: { $sum: 1 },
              },
            },
          ],
          tasksStatus: [
            {
              $lookup: {
                from: "tasks",
                localField: "_id",
                foreignField: "assignedTo",
                as: "tasks",
              },
            },
            { $unwind: { path: "$tasks", preserveNullAndEmptyArrays: true } },
            {
              $group: {
                _id: "$tasks.status",
                count: { $sum: 1 },
              },
            },
          ],
        },
      },
    ]);

    const projectStatistics = await Project.aggregate([
      {
        $facet: {
          totalProjectCount: [{ $count: "count" }],
          totalProjectCompleted: [
            { $match: { status: "completed" } },
            { $count: "count" },
          ],
          totalProjectPending: [
            { $match: { status: "pending" } },
            { $count: "count" },
          ],
          totalProjectInProgress: [
            { $match: { status: "ongoing" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const taskStatistics = await Task.aggregate([
      {
        $facet: {
          totalTaskCount: [{ $count: "count" }],
          totalTaskCompleted: [
            { $match: { status: "Completed" } },
            { $count: "count" },
          ],
          totalTaskPending: [
            { $match: { status: "Pending" } },
            { $count: "count" },
          ],
          totalTaskInProgress: [
            { $match: { status: "In Progress" } },
            { $count: "count" },
          ],
        },
      },
    ]);

    const currentDate = new Date();

    const AssignedTaskStatistics = await AssignedTask.aggregate([
      {
        $facet: {
          overdueTasks: [
            { $match: { end_date: { $lt: currentDate } } },
            { $count: "overdueCount" },
          ],
        },
      },
    ]);

    const managerWithTasksCount = await User.aggregate([
      { $match: { roleId: 2 } },
      {
        $lookup: {
          from: "Task",
          localField: "_id",
          foreignField: "assignedTo",
          as: "Task",
        },
      },
      { $match: { tasks: { $ne: [] } } },
      { $count: "managerWithTasksCount" },
    ]);

    const managerWithTasks =
      managerWithTasksCount[0]?.managerWithTasksCount || 0;
    const result = {
      totalEmployees: statistics[0].totalEmployeeCount[0]?.count || 0,
      totalProjects: projectStatistics[0].totalProjectCount[0]?.count || 0,
      totalTaskCount: taskStatistics[0].totalTaskCount[0]?.count || 0,
      totalManagers: statistics[0].totalManagerCount[0]?.count || 0,
      totalProjectCompleted:
        projectStatistics[0].totalProjectCompleted[0]?.count || 0,
      totalProjectPending:
        projectStatistics[0].totalProjectPending[0]?.count || 0,
      totalProjectInProgress:
        projectStatistics[0].totalProjectInProgress[0]?.count || 0,
      totalTaskCompleted: taskStatistics[0].totalTaskCompleted[0]?.count || 0,
      totalTaskPending: taskStatistics[0].totalTaskPending[0]?.count || 0,
      totalTaskInProgress: taskStatistics[0].totalTaskInProgress[0]?.count || 0,
      overdueTasks:
        AssignedTaskStatistics[0].overdueTasks.length > 0
          ? AssignedTaskStatistics[0].overdueTasks[0].overdueCount
          : 0,
      managerWithTasks: managerWithTasks,
    };

    res.status(200).json({ statistics: result });
  } catch (error) {
    console.error("Error fetching statistics:", error);
    res
      .status(500)
      .json({
        message: "Error fetching statistics",
        error: error.message || error,
      });
  }
};

// exports.calculateTaskPerformance = async (req, res) => {
//   try {
//     const { userId } = req.params;

//      const userTasks = await AssignedTask.find({ assignedTo: userId });
//     console.log("Tasks assigned to user:", userTasks);

//      const performanceData = await Task.aggregate([
//       { $match: { assignedTo: userId } },  
//       {
//         $facet: {
//           completedTasks: [
//             { $match: { status: "Completed" } },
//             { $count: "completedCount" }, 
//           ],
//           totalTasks: [     
//             { $count: "totalCount" }  
//           ],
//         },
//       },
//     ]);

//     console.log("Aggregation Result:", performanceData);

//     const completedTasks = performanceData[0].completedTasks[0]?.completedCount || 0;
//     const totalTasks = performanceData[0].totalTasks[0]?.totalCount || 0;
//      const performance = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0;

//     res.status(200).json({ performance });
//   } catch (error) {
//     console.error("Error calculating task performance:", error);
//     res.status(500).json({ message: "Error calculating task performance", error: error.message });
//   }
// };

exports.getAssignedTasksForUser = async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({ message: "User ID is required" });
    }

     const tasks = await AssignedTask.find({ userid: userId })
      .populate("taskid", "_id")
      .populate("userid", "username")
      .exec();

    const totalTasks = tasks.length;
    let completedOnTime = 0;

    tasks.forEach(task => {
      const isCompleted = task.status === "Completed";
      const isOverdue = new Date(task.end_date) < new Date() && !isCompleted;

      if (isCompleted && !isOverdue) {
        completedOnTime++;
      }
    });

    const completionPercentage = totalTasks > 0 ? Math.round((completedOnTime / totalTasks) * 100) : 0;

    res.status(200).json({ tasks, completionPercentage });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "An error occurred while retrieving tasks" });
  }
};

 // exports.assignTask = async (req, res) => {
//   const { task_id, user_id } = req.body;

//   try {
//      const user = await User.findById(user_id);
//     if (!user) {
//       return res.status(404).json({ message: "User not found" });
//     }

//      const task = await Task.findById(task_id);
//     if (!task) {
//       return res.status(404).json({ message: "Task not found" });
//     }

//      const userTaskAssignment = new AssignTask({
//       task_id,
//       user_id,
//     });

//     await userTaskAssignment.save();

//     res.status(201).json({
//       message: "Task successfully assigned to user",
//       task: task,
//       user: user,
//     });
//   } catch (error) {
//     res.status(400).json({ message: error.message });
//   }
// };
