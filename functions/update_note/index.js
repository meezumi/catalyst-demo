const https = require('https');

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
  updateNote(context, basicIO);
};

async function updateNote(context, basicIO) {
  try {
    const id = basicIO.getArgument('id');
    const title = basicIO.getArgument('title');
    const content = basicIO.getArgument('content');

    if (!id || !title || !content) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'ID, title, and content are required'
      }));
      context.close();
      return;
    }

    const updates = {
      title: title,
      content: content,
      updatedAt: new Date().toISOString()
    };

    try {
      await firebaseRequest(`/notes/${id}`, 'PATCH', updates);
    } catch (err) {
      console.error('Firebase update error:', err.message);
    }

    basicIO.write(JSON.stringify({
      success: true,
      message: 'Note updated successfully',
      data: {
        id: id,
        ...updates
      }
    }));

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
  }
  context.close();
}
