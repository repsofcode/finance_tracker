// backend/controllers/authController.js  (or wherever you put it)

const User = require('../models/User');
const { createAccessToken, createRefreshToken } = require('../utils/jwt');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    // 1. Basic validation
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    if (password.length < 8) {
      return res.status(400).json({ error: 'Password should be at least 8 characters long' });
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // 2. Check if email exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    // 3. Create and save user (triggers hashing)
    const newUser = new User({
      name,
      email,
      password, // plain text — model hashes it
    });

    await newUser.save(); // ← THIS WAS MISSING — very important!

    // 4. Generate tokens
    const accessToken = createAccessToken({
      id: newUser._id,
      email: newUser.email,
    });

    const refreshToken = createRefreshToken({
      id: newUser._id,
    });

    // 5. Set secure httpOnly cookie for refresh token
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000, // 14 days in milliseconds
      path: '/',
    });

    // 6. Success response
    res.status(201).json({
      message: 'User registered successfully',
      accessToken,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({ error: 'Server error during registration' });
  }
};
