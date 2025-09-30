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
    const token = jwt.sign(
      { id: userRecord.id, email: userRecord.email },
      jwtSecret,
      {
        expiresIn: process.env.JWT_TOKEN_EXPIRY,
      }
    );

    const userDetails = {
      name: userRecord.name,
      email: userRecord.email,
      id: userRecord.id,
      role: userRecord.role,
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

const logout = async (req, res) => {
  const user = req.user;
  // console.log('user')
  try {
    if (user) {
      res.clearCookie("crm_checkin_pass", {
        httpOnly: true,
        secure: false, // must match how you set it
        sameSite: "lax",
      });
      return res.status(200).json({ message: "Logout successful" });
    } else {
      return res.status(500).json({ message: "some internal error found" });
    }
  } catch (error) {
    console.log("error found in logout", error);
  }
};

const roleChecker = async (req, res) => {
  try {
    const user = req.user;
    const userDetails = await Signup.findOne({ where: { id: user.id } });
    if (!userDetails) {
      return httpError(res, 404, "User not found");
    }
    return httpSuccess(res, 200, "Role fetched successfully", {
      role: userDetails.role,
    });
  } catch (error) {
    console.log("error found  in role checker", error);
    return httpError(res, 500, "Server error", err.message);
  }
};

const getPin = async (req, res) => {
  const user = req.user;

  try {
    const userDetails = await Signup.findOne({ where: { id: user.id } });
    if (!userDetails) {
      return httpError(res, 404, "User not found");
    }

    const role = userDetails.role;
    if (!role) {
      return httpError(res, 403, "Access denied. Admins only.");
    }

    const existing = await secretCode.findOne({
      include: [
        {
          model: signup,
          as: "staff", // must match the alias in belongsTo
          attributes: ["name", "email"],
        },
      ],
    });

    return httpSuccess(res, 200, "Pin fetched successfully", {
      existing,
    });
  } catch (error) {
    console.log("error found in getting pin", error);
    return httpError(res, 500, "Server error", err.message);
  }
};

const createPin = async (req, res) => {
  const user = req.user; // logged-in user
  const { pin } = req.body; // pin from request

  console.log(req.body);
  if (!pin) {
    return httpError(res, 400, "Pin is required");
  }

  try {
    // check if user exists
    const userDetails = await Signup.findOne({ where: { id: user.id } });
    if (!userDetails) return httpError(res, 404, "User not found");

    // optional: check role if needed
    if (!userDetails.role)
      return httpError(res, 403, "Access denied. Admins only.");

    // get current date and time
    const now = new Date();
    const date = now.toISOString().split("T")[0]; // YYYY-MM-DD
    const time = now.toTimeString().split(" ")[0]; // HH:MM:SS

    // check if a pin already exists for this staff
    const existing = await secretCode.findOne({});

    if (!existing) {
      return res
        .status(400)
        .json({ message: "some thing wrong in pin generation" });
    }

    // update existing
    existing.code = pin;
    existing.date = date;
    existing.time = time;
    existing.staffId = user.id;

    await existing.save();
    return res
      .status(200)
      .json({ message: "Pin updated successfully", pin: existing });
  } catch (err) {
    console.error("Error in creating pin:", err);
    return httpError(res, 500, "Server error", err.message);
  }
};

module.exports = {
  handleSignup,
  handleLogin,
  logout,
  roleChecker,
  getPin,
  createPin,
};
