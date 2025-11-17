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
  deleteNote(basicIO).catch(err => {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${err.message}`
    }));
    console.error('Function error:', err);
    context.close();
  });
};

async function deleteNote(basicIO) {
  try {
    // Get parameters from request
    const id = basicIO.getArgument('id');

    // Validate input
    if (!id) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'ID is required'
      }));
      return;
    }

    // Delete note from Firebase
    const noteRef = db.ref(`notes/${id}`);
    await noteRef.remove();

    // Return success response
    basicIO.write(JSON.stringify({
      success: true,
      message: 'Note deleted successfully',
      data: { id: id }
    }));

    console.log('Note deleted with ID:', id);

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
    console.error('Function error:', error);
  }
}
