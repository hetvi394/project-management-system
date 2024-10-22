const validateProjectFields = (req, res, next) => {
    const { name, description, duration, status } = req.body;
  
    if (!name || typeof name !== "string") {
      return res.status(400).json({ message: "Invalid or missing 'name' field" });
    }
  
    if (!description || typeof description !== "string") {
      return res.status(400).json({ message: "Invalid or missing 'description' field" });
    }
  
    if (!duration || typeof duration !== "number") {
      return res.status(400).json({ message: "Invalid or missing 'duration' field" });
    }
  
    const validStatuses = ["pending", "in progress", "completed"];
    if (!status || !validStatuses.includes(status)) {
      return res.status(400).json({ message: "Invalid or missing 'status' field" });
    }
  
    next();
  };
  

  const validateAssignProject = (req, res, next) => {
    const { projectid, userid } = req.body;
  
    if (!projectid || !userid) {
      return res.status(400).json({ message: "Project ID and User ID are required" });
    }
    next();
  };
  
   module.exports = {
    validateProjectFields,
    validateAssignProject
  };
  