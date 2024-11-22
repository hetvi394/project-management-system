const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const projectController = require("../controllers/projectControllers");
const {
  validateProjectFields,
  validateAssignProject,
} = require("../middleware/projectMiddleware");
const createRoles = require("../controllers/userControllers");
const authenticateJWT = require("../middleware/authMiddleware");
const taskController = require("../controllers/taskControllers");
const importCSV = require("../controllers/userDataImportControllers");
const multer = require("multer");
const uploads = multer({ dest: "uploads/" });
const leaveController = require("../controllers/leaveControllers");
const balanceleave = require("../controllers/BalanceConroller")


router.post("/register", authController.register);
router.get("/verify_email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/verify-token", authController.verifyToken);
router.delete("/delete/:id", authController.DeleteUser);
router.post("/forget_password", authController.ForgetPassword);
router.post(
  "/create_project",
  authenticateJWT,
  validateProjectFields,
  projectController.createProject
);
router.post(
  "/assign_project",
  authenticateJWT,
  projectController.assignProject
);
router.get(
  "/assigned_projects",
  authenticateJWT,
  projectController.getAssignedProjects
);
router.get(
  "/searchProjects",
  authenticateJWT,
  projectController.searchProjects
);
router.post(
  "/updateAssignedTaskDates",
  projectController.updateAssignedTaskDates
);
router.post("/createuser", authenticateJWT, createRoles.createUser);
router.post("/createNewPassword",authenticateJWT, createRoles.createNewPassword);
router.patch("/assign_role/:id", authenticateJWT, createRoles.assignRole);
router.get("/dashboard", authenticateJWT, createRoles.getStatistics);
router.get("/performance",authenticateJWT, createRoles.getAssignedTasksForUser);
router.post("/createTask",authenticateJWT, taskController.createTask);
router.get("/retrieved/:id",authenticateJWT, taskController.getTaskById);
router.put("/updateTask/:id",authenticateJWT, taskController.updateTask);
router.delete("/deleteTask/:id",authenticateJWT, taskController.deleteTask);
router.post("/importCSV", uploads.single("csvfile"), importCSV.importCSV);
router.get("/exportCSV", authenticateJWT, importCSV.exportCSV);

router.post("/leave-request",authenticateJWT, leaveController.createLeaveRequest);
router.get("/getAllLeaveRequests", authenticateJWT,leaveController.getAllLeaveRequests);
router.put("/updateLeaveRequest/:id", authenticateJWT ,leaveController.updateLeaveRequest);
router.delete("/deleteLeaveRequest/:id",authenticateJWT, leaveController.deleteLeaveRequest);

 router.put("/updateBalance/:userId", balanceleave.updateBalanceLeave)
router.get("/getBalance", balanceleave.getBalanceLeave)

module.exports = router;