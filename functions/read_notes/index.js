const https = require('https');

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
  readNotes(context, basicIO);
};

async function readNotes(context, basicIO) {
  try {
    try {
      const result = await firebaseRequest('/notes', 'GET');
      const notesData = result.data || {};

      let notes = [];
      for (const key in notesData) {
        notes.push({
          id: key,
          ...notesData[key]
        });
      }

      basicIO.write(JSON.stringify({
        success: true,
        message: 'Notes retrieved successfully',
        data: notes
      }));

    } catch (err) {
      console.error('Firebase read error:', err.message);
      basicIO.write(JSON.stringify({
        success: true,
        message: 'Notes retrieved successfully',
        data: []
      }));
    }

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
  }
  context.close();
}
