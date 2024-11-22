const mongoose = require("mongoose");
 
const taskSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    description: { type: String, required: true },
    status: {
      type: String,
      enum: ["Pending", "InProgress", "Completed"],
      default: "Pending",
    },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High"],
      default: "Medium",
    },
    project_id: { 
        type: mongoose.Schema.Types.ObjectId,
         ref: "Project", 
         },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);