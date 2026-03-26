const jwt = require('jsonwebtoken');

const ACCESS_SECRET = 'short-lived-tokens-122333';   
const REFRESH_SECRET = 'long-lived-tokens-444455555';

function createAccessToken(payload) {
  return jwt.sign(
    payload,
    ACCESS_SECRET,
    { expiresIn: '20m' }
  );
}

function createRefreshToken(payload) {
  return jwt.sign(
    payload,
    REFRESH_SECRET,
    { expiresIn: '14d' }
  );
}

function verifyAccessToken(token) {
  try {
    return jwt.verify(token, ACCESS_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired access token');
  }
}

function verifyRefreshToken(token) {
  try {
    return jwt.verify(token, REFRESH_SECRET);
  } catch (err) {
    throw new Error('Invalid or expired refresh token');
  }
}

module.exports = {
  createAccessToken,       
  createRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
};
