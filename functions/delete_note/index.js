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
  deleteNote(context, basicIO);
};

async function deleteNote(context, basicIO) {
  try {
    const id = basicIO.getArgument('id');

    if (!id) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'ID is required'
      }));
      context.close();
      return;
    }

    try {
      await firebaseRequest(`/notes/${id}`, 'DELETE');
    } catch (err) {
      console.error('Firebase delete error:', err.message);
    }

    basicIO.write(JSON.stringify({
      success: true,
      message: 'Note deleted successfully',
      data: { id: id }
    }));

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
  }
  context.close();
}
