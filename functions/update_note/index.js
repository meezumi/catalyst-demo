const admin = require('firebase-admin');

// Firebase configuration
const firebaseConfig = {
  databaseURL: 'https://catalyst-notes-app-default-rtdb.firebaseio.com'
};

// Initialize Firebase Admin
if (!admin.apps.length) {
  admin.initializeApp({
    databaseURL: firebaseConfig.databaseURL
  });
}

const db = admin.database();

module.exports = (context, basicIO) => {
  updateNote(basicIO).catch(err => {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${err.message}`
    }));
    console.error('Function error:', err);
    context.close();
  });
};

async function updateNote(basicIO) {
  try {
    // Get parameters from request
    const id = basicIO.getArgument('id');
    const title = basicIO.getArgument('title');
    const content = basicIO.getArgument('content');

    // Validate input
    if (!id || !title || !content) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'ID, title, and content are required'
      }));
      return;
    }

    // Update note in Firebase
    const noteRef = db.ref(`notes/${id}`);
    const updates = {
      title: title,
      content: content,
      updatedAt: new Date().toISOString()
    };

    await noteRef.update(updates);

    // Return success response
    basicIO.write(JSON.stringify({
      success: true,
      message: 'Note updated successfully',
      data: {
        id: id,
        ...updates
      }
    }));

    console.log('Note updated:', id);

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
    console.error('Function error:', error);
  }
}
