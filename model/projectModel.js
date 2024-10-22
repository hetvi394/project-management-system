const mongoose = require("mongoose");

const ProjectSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  description: {
    type: String,
    required: true,
  },
  duration: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ["ongoing", "completed", "not started"],
    required: true,
  },
});

module.exports = mongoose.model("Project", ProjectSchema);