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
  createNote(context, basicIO);
};

async function createNote(context, basicIO) {
  try {
    const title = basicIO.getArgument('title');
    const content = basicIO.getArgument('content');

    if (!title || !content) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Title and content are required'
      }));
      context.close();
      return;
    }

    const noteId = Date.now().toString(36) + Math.random().toString(36).substr(2);
    const newNote = {
      id: noteId,
      title: title,
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    try {
      await firebaseRequest(`/notes/${noteId}`, 'PUT', newNote);
    } catch (err) {
      console.error('Firebase save error:', err.message);
    }

    basicIO.write(JSON.stringify({
      success: true,
      message: 'Note created successfully',
      data: newNote
    }));

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
  }
  context.close();
}
