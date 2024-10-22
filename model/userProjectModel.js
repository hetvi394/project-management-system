const mongoose = require("mongoose");

const UserProjectSchema = new mongoose.Schema({
  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,  
  },
  projectid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Project',
    required: true,  
  },
});

module.exports = mongoose.model("UserProject", UserProjectSchema);