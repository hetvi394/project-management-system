const mongoose = require("mongoose");

const BalanceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",  
    required: true,
  },
  totalBalance: {
    type: Number,
    required: true,
    default: 12,  
  },
}, { timestamps: true });  

module.exports = mongoose.model("Balance", BalanceSchema);