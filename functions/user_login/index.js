const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

function firebaseRequest(path, method) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'catalyst-notes-app-default-rtdb.firebaseio.com',
      path: `${path}.json`,
      method: method,
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.abort();
      reject(new Error('Request timeout'));
    });
    req.end();
  });
}

module.exports = (context, basicIO) => {
  handleLogin(context, basicIO);
};

async function handleLogin(context, basicIO) {
  try {
    const email = basicIO.getArgument('email');
    const password = basicIO.getArgument('password');

    if (!email || !password) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Email and password are required'
      }));
      context.close();
      return;
    }

    try {
      const result = await firebaseRequest('/users', 'GET');
      const users = result.data || {};

      let foundUser = null;
      let userId = null;
      
      for (const uid in users) {
        if (users[uid].email === email) {
          foundUser = users[uid];
          userId = uid;
          break;
        }
      }

      if (!foundUser) {
        basicIO.write(JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }));
        context.close();
        return;
      }

      const isMatch = await new Promise((resolve, reject) => {
        bcrypt.compare(password, foundUser.password, (err, match) => {
          if (err) reject(err);
          else resolve(match);
        });
      });

      if (!isMatch) {
        basicIO.write(JSON.stringify({
          success: false,
          message: 'Invalid email or password'
        }));
        context.close();
        return;
      }

      const token = jwt.sign(
        { userId, email: foundUser.email, username: foundUser.username },
        JWT_SECRET,
        { expiresIn: '7d' }
      );

      basicIO.write(JSON.stringify({
        success: true,
        message: 'Login successful',
        data: {
          userId,
          username: foundUser.username,
          email: foundUser.email,
          token
        }
      }));
    } catch (dbErr) {
      console.error('Firebase error:', dbErr);
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Database error'
      }));
    }
  } catch (error) {
    console.error('Error:', error);
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
  }
  context.close();
}
