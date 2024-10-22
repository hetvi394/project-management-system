const express = require("express");
const router = express.Router();
const authController = require("../controllers/authControllers");
const projectController = require("../controllers/projectControllers");
const {
    validateProjectFields,
    validateAssignProject,
  } = require("../middleware/projectMiddleware");
  const createRoles = require("../controllers/userControllers")
  const authenticateJWT = require("../middleware/authMiddleware")
 

router.post("/register",  authController.register);
router.get("/verify-email", authController.verifyEmail);
router.post("/login", authController.login);
router.post("/verify-token", authController.verifyToken);
router.delete("/delete/:id", authController.DeleteUser);
router.post("/create_project",authenticateJWT, validateProjectFields, projectController.createProject);
router.post("/assign_project",authenticateJWT, validateAssignProject,projectController.assignProject);
router.get("/assigned_projects",authenticateJWT , projectController.getAssignedProjects);
router.get('/search', authenticateJWT,projectController.searchProjects);
router.post('/createuser',authenticateJWT, createRoles.createUser);
router.post("/send-verification", createRoles.sendVerification );


module.exports = router;