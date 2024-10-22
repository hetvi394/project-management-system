const User = require("../model/userModel");
const bcrypt = require("bcryptjs");
const { generateToken, verifyToken } = require("../utils/jwttoken");
const { sendVerificationEmail } = require("../utils/sendmail");
const jwt = require("jsonwebtoken");  

exports.register = async (req, res) => {
  const { username, email, password , roleId } = req.body;
  try {
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }
    
     const hashedPassword = await bcrypt.hash(password, 10);
    user = new User({ username, email, password: hashedPassword, isVerified: false , roleId });
    await user.save();

     const verificationToken = generateToken(user._id, '60s');   
    await sendVerificationEmail(user, verificationToken);

    return res.status(201).json({ message: "User registered successfully. Please verify your email." });
  } catch (error) {
    console.error("Error during registration:", error);
    return res.status(500).json({ message: "Server error" });
  }
};

exports.verifyEmail = async (req, res) => {
  const { token } = req.query;
  if (!token) return res.status(400).json({ message: "No token provided" });

  try {
    const decoded = verifyToken(token);  
    const user = await User.findById(decoded.id);
    if (!user) return res.status(404).json({ message: "User not found" });
    if (user.isVerified) return res.status(400).json({ message: "User already verified" });

    user.isVerified = true;
    await user.save();
    res.json({ message: "Email verified successfully" });
  } catch (error) {
    res.status(400).json({ message: "Invalid or expired token" });
  }
};

exports.login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

     const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

     const token = generateToken(user._id, '1h');   
    return res.json({ token });
  } catch (error) {
    return res.status(500).json({ message: "Server error" });
  }
};


//if user isverify true ho or password bhi ho to login hone do 
//if user isverify nahi hai or password hai to usse  verification email send karo 
 



exports.verifyToken = async (req, res) => {
  const { token } = req.body;
  if (!token) return res.status(400).json({ message: "No token provided" });

  try {
    // Verify the token
    const decoded = verifyToken(token); // This will throw an error if the token is invalid or expired
    const user = await User.findById(decoded.id).select("-password");
    if (!user) return res.status(404).json({ message: "User not found" });

    return res.json({
      message: "Token is valid",
      user: { username: user.username, email: user.email, id: user._id },
    });
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      try {
        const decoded = jwt.decode(token); 
        const user = await User.findById(decoded.id).select("-password");
        if (!user) return res.status(404).json({ message: "User not found" });

         const newToken = generateToken(user._id, '1h');  
        return res.json({ message: "Token expired, new token issued", newToken });
      } catch (err) {
        console.error("Error during token issuance:", err);
        return res.status(500).json({ message: "Error issuing new token" });
      }
    }

     console.error("Token verification error:", error);
    return res.status(401).json({ message: "Token is not valid" });
  }
};



exports.DeleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "User not found" });

    user.isDeleted = new Date();   
    await user.save();

    return res.status(200).json({ message: "User soft deleted successfully", user });
  } catch (error) {
    return res.status(500).json({ message: "Internal server error", error });
  }
};




















// const User = require("../model/user");
// const bcrypt = require("bcryptjs");
// const dotenv = require("dotenv");
// const { sendVerificationEmail } = require("../utils/sendmail");
// const { generateToken } = require("../utils/jwt");

// dotenv.config();

// exports.register = async (req, res) => {
//   const { username, email, password } = req.body;

//   try {
//     let user = await User.findOne({ email });
//     if (user) {
//       return res.status(400).json({ message: "User already exists" });
//     }

//     user = new User({ username, email, password, isVerified: false });
//     await user.save();

//     const verificationToken = generateToken(user._id); // Use the generateToken utility function
//     await sendVerificationEmail(user, verificationToken);

//     return res.status(201).json({ message: "User registered successfully. Please verify your email." });
//   } catch (error) {
//     console.error("Error during registration:", error);
//     return res.status(500).json({ message: "Server error" });
//   }
// };

// exports.verifyEmail = async (req, res) => {
//   const { token } = req.query;
//   if (!token) return res.status(400).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id);
//     if (!user) return res.status(404).json({ message: "User not found" });
//     if (user.isVerified) return res.status(400).json({ message: "User already verified" });

//     user.isVerified = true;
//     await user.save();
//     res.json({ message: "Email verified successfully" });
//   } catch (error) {
//     res.status(400).json({ message: "Invalid or expired token" });
//   }
// };

// exports.login = async (req, res) => {
//   const { email, password } = req.body;

//   try {
//     const user = await User.findOne({ email });
//     if (!user) return res.status(400).json({ message: "Invalid credentials" });

//     const isMatch = await bcrypt.compare(password, user.password); // Compare the password with the hashed one
//     if (!isMatch) return res.status(400).json({ message: "Invalid credentials" });

//     if (!user.isVerified) {
//       return res.status(403).json({ message: "Email not verified" });
//     }

//     const token = generateToken(user._id); // Use the generateToken utility function
//     res.json({ token });
//   } catch (error) {
//     res.status(500).json({ message: "Server error" });
//   }
// };

// exports.verifyToken = async (req, res) => {
//   const { token } = req.body;
//   if (!token) return res.status(400).json({ message: "No token provided" });

//   try {
//     const decoded = jwt.verify(token, process.env.JWT_SECRET);
//     const user = await User.findById(decoded.id).select("-password");
//     if (!user) return res.status(404).json({ message: "User not found" });

//     return res.json({
//       message: "Token is valid",
//       user: { username: user.username, email: user.email, id: user._id },
//     });
//   } catch (error) {
//     if (error.name === "TokenExpiredError") {
//       const decoded = jwt.decode(token);
//       const user = await User.findById(decoded.id).select("-password");
//       if (!user) return res.status(404).json({ message: "User not found" });

//       const newToken = generateToken(user._id); // Use the generateToken utility function
//       return res.json({ message: "Token expired, new token issued", newToken });
//     }

//     return res.status(401).json({ message: "Token is not valid" });
//   }
// };

// exports.softDeleteUser = async (req, res) => {
//   try {
//     const user = await User.findById(req.params.id);
//     if (!user) return res.status(404).json({ message: "User not found" });

//     user.isDeleted = new Date();
//     await user.save();

//     res.status(200).json({ message: "User soft deleted successfully", user });
//   } catch (error) {
//     res.status(500).json({ message: "Internal server error", error });
//   }
// };
