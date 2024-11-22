const mongoose = require("mongoose");

const assignTaskSchema = new mongoose.Schema(
  {
    taskid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Task",
     },
    userid: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
     },
     start_date: {
      type:  Date,
       default: ""
     },
     end_date: {
      type: Date,
       default:""
      },
      status: {
        type: String,
        enum: ["assign", "InProgress", "Completed",],
        default: "assign" 
       },
  },
  { timestamps: true }
);

module.exports = mongoose.model("AssignTask", assignTaskSchema);