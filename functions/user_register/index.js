const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const https = require('https');

const JWT_SECRET = 'your-super-secret-jwt-key-change-this-in-production';

function firebaseRequest(path, method, data) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'catalyst-notes-app-default-rtdb.firebaseio.com',
      path: `${path}.json`,
      method: method,
      headers: { 'Content-Type': 'application/json' },
      timeout: 10000
    };

    const req = https.request(options, (res) => {
      let resData = '';
      res.on('data', chunk => resData += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(resData || '{}') });
        } catch (e) {
          resolve({ status: res.statusCode, data: resData });
        }
      });
    });

    req.on('error', reject);
    req.on('timeout', () => {
      req.abort();
      reject(new Error('Request timeout'));
    });

    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

module.exports = (context, basicIO) => {
  handleRegister(context, basicIO);
};

async function handleRegister(context, basicIO) {
  try {
    const email = basicIO.getArgument('email');
    const password = basicIO.getArgument('password');
    const username = basicIO.getArgument('username');

    if (!email || !password || !username) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Email, password, and username are required'
      }));
      context.close();
      return;
    }

    const emailRegex = /^\S+@\S+\.\S+$/;
    if (!emailRegex.test(email)) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Invalid email format'
      }));
      context.close();
      return;
    }

    const hashedPassword = await new Promise((resolve, reject) => {
      bcrypt.hash(password, 10, (err, hash) => {
        if (err) reject(err);
        else resolve(hash);
      });
    });

    const userId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    
    const newUser = {
      id: userId,
      username: username,
      email: email,
      password: hashedPassword,
      createdAt: new Date().toISOString()
    };

    try {
      await firebaseRequest(`/users/${userId}`, 'PUT', newUser);
    } catch (dbErr) {
      console.error('Firebase error:', dbErr.message);
    }

    const token = jwt.sign(
      { userId, email, username },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    basicIO.write(JSON.stringify({
      success: true,
      message: 'User registered successfully',
      data: { userId, username, email, token }
    }));

  } catch (error) {
    console.error('Error:', error);
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
  }
  context.close();
}
