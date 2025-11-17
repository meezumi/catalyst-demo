const admin = require('firebase-admin');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Firebase configuration
const firebaseConfig = {
  databaseURL: 'https://catalyst-notes-app-default-rtdb.firebaseio.com'
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: firebaseConfig.databaseURL,
  });
}

const db = admin.database();
const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

module.exports = (context, basicIO) => {
  try {
    const email = basicIO.getArgument('email');
    const password = basicIO.getArgument('password');

    // Validate inputs
    if (!email || !password) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Email and password are required'
      }));
      context.close();
      return;
    }

    // Query users by email
    db.ref('users').orderByChild('email').equalTo(email).once('value', (snapshot) => {
      if (!snapshot.exists()) {
        basicIO.write(JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }));
        context.close();
        return;
      }

      // Get user data
      let user = null;
      let userId = null;
      snapshot.forEach(child => {
        user = child.val();
        userId = child.key;
      });

      // Compare passwords
      bcrypt.compare(password, user.password, (err, isMatch) => {
        if (err || !isMatch) {
          basicIO.write(JSON.stringify({
            success: false,
            message: 'Invalid email or password'
          }));
          context.close();
          return;
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId, email: user.email, username: user.username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        basicIO.write(JSON.stringify({
          success: true,
          message: 'Login successful',
          data: {
            userId,
            username: user.username,
            email: user.email,
            token
          }
        }));

        context.close();
      });
    }, (err) => {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Database error'
      }));
      context.close();
    });

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
    context.close();
  }
};
