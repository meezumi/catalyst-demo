const jwt = require('jsonwebtoken');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

module.exports = (context, basicIO) => {
  try {
    const token = basicIO.getArgument('token');

    if (!token) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Token is required'
      }));
      context.close();
      return;
    }

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    basicIO.write(JSON.stringify({
      success: true,
      message: 'Token is valid',
      data: decoded
    }));

    console.log('Token verified for user:', decoded.userId);

  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Token has expired'
      }));
    } else if (error.name === 'JsonWebTokenError') {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Invalid token'
      }));
    } else {
      basicIO.write(JSON.stringify({
        success: false,
        message: `Error: ${error.message}`
      }));
    }
    console.error('Token verification error:', error);
  }

  context.close();
};
