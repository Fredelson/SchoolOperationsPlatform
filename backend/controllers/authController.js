const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const { sql, poolPromise } = require("../config/db");

const login = async (req, res) => {
  try {
    const { schoolEmail, password } = req.body;

    if (!schoolEmail || !password) {
      return res.status(400).json({
        message: "School email and password are required",
      });
    }

    const pool = await poolPromise;

    const result = await pool
      .request()
      .input("schoolEmail", sql.VarChar, schoolEmail)
      .query(`
        SELECT TOP 1 *
        FROM Users
        WHERE schoolEmail = @schoolEmail
      `);

    const user = result.recordset[0];

    if (!user) {
      return res.status(401).json({
        message: "Invalid school email or password",
      });
    }

    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return res.status(401).json({
        message: "Invalid school email or password",
      });
    }

    const token = jwt.sign(
      {
        id: user.id,
        schoolEmail: user.schoolEmail,
        role: user.role,
        department: user.department,
        section: user.section,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    res.json({
      message: "Login successful",
      token,
      user: {
        id: user.id,
        name: user.name,
        schoolEmail: user.schoolEmail,
        role: user.role,
        department: user.department,
        section: user.section,
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    res.status(500).json({
      message: "Server error during login",
    });
  }
};

module.exports = {
  login,
};