const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const signup = require("../../models/v1/Authentication/authModel");
const secretCode = require("../../models/v1/Authentication/secreatCode");
const { httpSuccess, httpError } = require("../../utils/v1/httpResponse");
const Signup = require("../../models/v1/Authentication/authModel");

const handleSignup = async (req, res) => {
  try {
    const { name, email, password, signupCode } = req.body;
    // console.log(req.body);

    // 1. Validate
    if (!name || !email || !password || !signupCode) {
      return httpError(res, 400, "All fields are required");
    }

    const verified = await secretCode.findOne({ where: { code: signupCode } });
    if (!verified) {
      return httpError(res, 400, "Signup code is not correct");
    }

    // // 2. Check if email exists
    const existingUser = await signup.findOne({ where: { email } });
    if (existingUser) {
      return httpError(res, 400, "Email already in use");
    }

    // // 3. Hash password
    const hashedPassword = await bcrypt.hash(
      password,
      parseInt(process.env.SALT_VALUE) || 10
    );
    // // 4. Save new user
    const newUser = await signup.create({
      name,
      email,
      password: hashedPassword,
    });

    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return httpError(res, 500, "Server error: Missing JWT secret");
    }

    // Generate JWT token with user ID and expiry
    const token = jwt.sign({ id: newUser.id }, jwtSecret, {
      expiresIn: process.env.JWT_TOKEN_EXPIRY,
    });

    const userDetails = {
      name: newUser.name,
      email: newUser.email,
      id: newUser.id,
    };
    // Set JWT as a secure cookie and respond
    return res
      .cookie("crm_checkin_pass", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 34 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "User registered successfully", userDetails });

    // 5. Return success (don’t send password back!)
  } catch (err) {
    console.error(err);
    return httpError(res, 500, "Server error", err.message);
  }
};


const handleLogin = async (req, res) => {
  try {
    const { email, password } = req.body;
    // console.log(req.body);

    // 1. Validate
    if (!email || !password) {
      return httpError(res, 400, "All fields are required");
    }

    const userRecord = await signup.findOne({
      where: { email },
    });

    if (!userRecord) {
      return httpError(res, 404, "Email is not registered");
    }
    if (!userRecord) {
      return httpError(res, 404, "Email is not registered");
    }

    // Compare password with hashed password in DB
    const isMatch = await bcrypt.compare(password, userRecord.password);
    if (!isMatch) {
      return httpError(res, 401, "Incorrect password");
    }

    // Ensure JWT secret is defined
    const jwtSecret = process.env.JWT_SECRET;
    if (!jwtSecret) {
      return httpError(res, 500, "Server error: Missing JWT secret");
    }

    // Generate JWT token with user ID and expiry
    const token = jwt.sign({ id: userRecord.id, email: userRecord.email }, jwtSecret, {
      expiresIn: process.env.JWT_TOKEN_EXPIRY,
    });

    const userDetails = {
      name: userRecord.name,
      email: userRecord.email,
      id: userRecord.id,
      role: userRecord.role
    };

    // Set JWT as a secure cookie and respond
    return res
      .cookie("crm_checkin_pass", token, {
        httpOnly: true,
        secure: false,
        sameSite: "lax",
        maxAge: 34 * 24 * 60 * 60 * 1000,
      })
      .status(200)
      .json({ message: "Login successfull", userDetails });
  } catch (error) {
    console.error("error found in login", error);
    return httpError(res, 500, "Server error", err.message);
  }
};


const roleChecker = async (req,res)=>{
  try {
    const user = req.user;
    const userDetails= await Signup.findOne({where:{id:user.id}});
    if(!userDetails){
      return httpError(res, 404, "User not found");
    }
    return httpSuccess(res, 200, "Role fetched successfully", {role:userDetails.role});
  } catch (error) {
    console.log('error found  in role checker',error);
    return httpError(res, 500, "Server error", err.message);
  }
}

module.exports = { handleSignup, handleLogin, roleChecker };
