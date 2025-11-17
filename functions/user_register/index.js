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
    const username = basicIO.getArgument('username');

    // Validate inputs
    if (!email || !password || !username) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Email, password, and username are required'
      }));
      context.close();
      return;
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Invalid email format'
      }));
      context.close();
      return;
    }

    // Hash password and register user
    bcrypt.hash(password, 10, (err, hashedPassword) => {
      if (err) {
        basicIO.write(JSON.stringify({
          success: false,
          message: 'Error processing password'
        }));
        context.close();
        return;
      }

      // Create new user
      const newUserRef = db.ref('users').push();
      const userId = newUserRef.key;
      
      const newUser = {
        id: userId,
        username: username,
        email: email,
        password: hashedPassword,
        createdAt: new Date().toISOString()
      };

      newUserRef.set(newUser, (dbErr) => {
        if (dbErr) {
          basicIO.write(JSON.stringify({
            success: false,
            message: `Failed to register: ${dbErr.message}`
          }));
          context.close();
          return;
        }

        // Generate JWT token
        const token = jwt.sign(
          { userId, email, username },
          JWT_SECRET,
          { expiresIn: '7d' }
        );

        basicIO.write(JSON.stringify({
          success: true,
          message: 'User registered successfully',
          data: {
            userId,
            username,
            email,
            token
          }
        }));

        context.close();
      });
    });

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
    context.close();
  }
};
