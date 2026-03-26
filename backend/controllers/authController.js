

const User = require('../models/User');
const { createAccessToken, createRefreshToken, verifyRefreshToken } = require('../utils/jwt');

exports.refresh = async (req, res) => {
  try {
       const refreshToken = req.cookies.refreshToken;

    if (!refreshToken) {
      return res.status(401).json({ error: 'No refresh token provided' });
    }

   
    let decoded;
    try {
      decoded = verifyRefreshToken(refreshToken);
    } catch (err) {
      return res.status(403).json({ error: 'Invalid or expired refresh token' });
    }

    
    const user = await User.findOne({
      _id: decoded.id,
      'refreshTokens.token': refreshToken,
    });

    if (!user) {
      return res.status(403).json({ error: 'Refresh token revoked or invalid' });
    }

    
    const newAccessToken = createAccessToken({
      id: user._id,
      email: user.email,
    });

    const newRefreshToken = createRefreshToken({
      id: user._id,
    });


    user.refreshTokens = user.refreshTokens.filter(
      rt => rt.token !== refreshToken
    );

    user.refreshTokens.push({
      token: newRefreshToken,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 14 days
    });

    await user.save();


    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 14 * 24 * 60 * 60 * 1000,
      path: '/',
    });


    res.status(200).json({
      accessToken: newAccessToken,
      message: 'Tokens refreshed successfully',
    });
  } catch (error) {
    console.error('Refresh error:', error);
    res.status(500).json({ error: 'Server error during token refresh' });
  }
};
