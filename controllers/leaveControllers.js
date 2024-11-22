const LeaveRequest = require("../model/leaveRequestModel");
const User = require("../model/userModel");
const Roles = require("../utils/roles");
const BalanceLeave = require("../model/balanceModel");
const { updateLeaveBalances } = require("../crons/leaveBalnceCron"); // Import the cron job function

const createLeaveRequest = async (req, res) => {
  try {
    const { userId, leaveType, startDate, endDate, reason } = req.body;
    const leaveRequest = new LeaveRequest({
      userId,
      leaveType,
      startDate,
      endDate,
      reason,
    });
    await leaveRequest.save();
    res.status(201).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const getAllLeaveRequests = async (req, res) => {
  try {
    const userId = req.user._id;
    const userRoleId = req.user.roleId;
    const { myLeaves } = req.query;

    let leaveRequests;

    if (userRoleId === Roles.employee) {
      leaveRequests = await LeaveRequest.find({ userId: userId });
    } else if (userRoleId === Roles.hr && myLeaves) {
      leaveRequests = await LeaveRequest.find({ userId: userId });
    } else if (userRoleId === Roles.hr) {
      leaveRequests = await LeaveRequest.find();
    } else {
      return res
        .status(403)
        .json({ message: "You do not have permission to view this data." });
    }

    res.status(200).json(leaveRequests);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const updateLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const { leaveType, startDate, endDate, reason, status } = req.body;
    const userId = req.user._id;
    const userRoleId = req.user.roleId;

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (
      leaveRequest.employeeId &&
      leaveRequest.employeeId.toString() === userId.toString()
    ) {
      leaveRequest.startDate = startDate || leaveRequest.startDate;
      leaveRequest.endDate = endDate || leaveRequest.endDate;
      leaveRequest.reason = reason || leaveRequest.reason;
    } else if (userRoleId === Roles.manager || userRoleId === Roles.hr) {
      if (reason) {
        return res
          .status(403)
          .json({ message: "Managers and HR cannot update the reason." });
      }

      leaveRequest.status = status || leaveRequest.status;

      if (status === "Rejected" && userRoleId === Roles.manager) {
        const balance = await BalanceLeave.findOne({
          userId: leaveRequest.userId,
        });
        if (balance) {
          balance.totalBalance += 1;
          await balance.save();
        }
      }
    } else {
      return res
        .status(403)
        .json({
          message: "You do not have permission to update this leave request.",
        });
    }
    await leaveRequest.save();
    console.log("Manual trigger for leave balance update...");
    await updateLeaveBalances();
    res.status(200).json(leaveRequest);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

const deleteLeaveRequest = async (req, res) => {
  try {
    const { id } = req.params;
    const employeeId = req.user._id;

    const leaveRequest = await LeaveRequest.findById(id);
    if (!leaveRequest) {
      return res.status(404).json({ message: "Leave request not found" });
    }

    if (leaveRequest.employeeId.toString() !== employeeId.toString()) {
      return res
        .status(403)
        .json({ message: "You are not authorized to delete this request" });
    }

    await leaveRequest.deleteOne();
    res.status(200).json({ message: "Leave request deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

module.exports = {
  createLeaveRequest,
  getAllLeaveRequests,
  updateLeaveRequest,
  deleteLeaveRequest,
};
