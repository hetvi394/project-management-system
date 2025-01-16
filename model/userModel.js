const mongoose = require("mongoose");

const UserSchema = new mongoose.Schema({
  username: {
    type: String,
    unique: true,
  },
  email: {
    type: String,
    unique: true,
  },
  password: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false,
  },
  isDeleted: {
    type: Date,
    default: null,
  },
  roleId: {
    type: Number,
    default: 3,
  },
  token: {
    type: String,
   },
}, { timestamps: true });  
// // Middleware to update the 'updatedAt' timestamp before saving
// UserSchema.pre("save", function (next) {
//   this.updatedAt = Date.now();
//   next();
// });

// // Middleware to update 'updatedAt' before running updateOne
// UserSchema.pre("updateOne", function (next) {
//   this.set({ updatedAt: Date.now() });
//   next();
// });

module.exports = mongoose.model("User", UserSchema);
