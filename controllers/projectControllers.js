const Project = require("../model/projectModel");
const User = require("../model/userModel");
const UserProject = require("../model/userProjectModel");
const Roles = require("../utils/roles");

exports.createProject = async (req, res) => {
  const { name, description, duration, status } = req.body;
  const { roleId } = req.user;  

  try {
    console.log(roleId , 'roleId');
    
    if (roleId === Roles.admin) {
    } else if (roleId === Roles.manager) {
   } else if (roleId === Roles.employee) {
      return res.status(403).json({ message: "You do not have permission to create a Project." });
   } else {
     return res.status(400).json({ message: "Invalid role ID." });
   }
    const newProject = new Project({ name, description, duration, status });
    await newProject.save();
    res.status(201).json(newProject);
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.assignProject = async (req, res) => {
  const { projectid, userid } = req.body;
  const { roleId } = req.user;  

  try {
    
    if (roleId === Roles.admin) {
    } else if (roleId === Roles.manager) {
      if (roleId !== Roles.manager && roleId !== Roles.employee) {
       return res.status(403).json({ message: "As a manager, you can only create manager or employee roles." });
     }
   } else if (roleId === Roles.employee) {
      return res.status(403).json({ message: "You do not have permission to create a user." });
   } else {
     return res.status(400).json({ message: "Invalid role ID." });
   }
    const project = await Project.findById(projectid);
    if (!project) return res.status(404).json({ message: "Project not found" });

    const user = await User.findById(userid);
    if (!user) return res.status(404).json({ message: "User not found" });

    const userProject = new UserProject({ userid, projectid });
    await userProject.save();

    res.status(201).json({
      message: "Project successfully assigned to user",
      Project: project,
      user: user,
    });
  } catch (error) {
    res.status(400).json({ message: error.message });
  }
};

exports.getAssignedProjects = async (req, res) => {
  try {
    const assignedProjects = await UserProject.find()
      .populate("userid", "username email")
      .populate("projectid", "name description status");

    if (!assignedProjects || assignedProjects.length === 0) {
      return res.status(404).json({ message: "No assigned projects found" });
    }

    res.status(200).json({
      message: "Assigned projects retrieved successfully",
      projects: assignedProjects,
    });
  } catch (error) {
    console.error("Error fetching assigned projects:", error);
    res.status(500).json({
      message: "An error occurred while fetching assigned projects.",
      error: error.message,
    });
  }
};

exports.searchProjects = async (req, res) => {
  const { search, sortby } = req.query;

  try {
    const sortOrder = sortby === "asec" ? 1 : sortby === "desc" ? -1 : 1;

    const searchResult = await UserProject.aggregate([
      {
        $lookup: {
          from: "users",
          localField: "userid",
          foreignField: "_id",
          as: "userInfo",
        },
      },
      {
        $unwind: "$userInfo",
      },
      {
        $lookup: {
          from: "projects",
          localField: "projectid",
          foreignField: "_id",
          as: "projectInfo",
        },
      },
      {
        $unwind: "$projectInfo",
      },
      {
        $match: {
          $or: [
            { "userInfo.username": { $regex: search, $options: "i" } },
            { "projectInfo.name": { $regex: search, $options: "i" } },
          ],
        },
      },
      {
        $group: {
          _id: "$projectInfo._id",
          name: { $first: "$projectInfo.name" },
          description: { $first: "$projectInfo.description" },
          duration: { $first: "$projectInfo.duration" },
          status: { $first: "$projectInfo.status" },
          users: {
            $push: {
              id: "$userInfo._id",
              username: "$userInfo.username",
              email: "$userInfo.email",
            },
          },
        },
      },
      {
        $project: {
          _id: 0,
          name: 1,
          description: 1,
          duration: 1,
          status: 1,
          users: 1,
        },
      },
      {
        $sort: {
          name: sortOrder,
        },
      },
    ]);

    if (!searchResult || searchResult.length === 0) {
      return res.status(404).json({ message: "No user projects found." });
    }

    res.status(200).json({
      message: "Projects retrieved successfully",
      projects: searchResult,
    });
  } catch (err) {
    console.error("Error fetching user projects:", err);
    res.status(500).json({
      message: "An error occurred while fetching user projects.",
      error: err.message,
    });
  }
};
