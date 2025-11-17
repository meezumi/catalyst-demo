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
  createNote(basicIO).catch(err => {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${err.message}`
    }));
    console.error('Function error:', err);
    context.close();
  });
};

async function createNote(basicIO) {
  try {
    // Get parameters from request
    const title = basicIO.getArgument('title');
    const content = basicIO.getArgument('content');

    // Validate input
    if (!title || !content) {
      basicIO.write(JSON.stringify({
        success: false,
        message: 'Title and content are required'
      }));
      return;
    }

    // Create note object
    const newNote = {
      title: title,
      content: content,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    // Save to Firebase
    const notesRef = db.ref('notes');
    const newNoteRef = notesRef.push();
    await newNoteRef.set(newNote);

    // Add the Firebase-generated ID to the note
    newNote.id = newNoteRef.key;

    // Return success response
    basicIO.write(JSON.stringify({
      success: true,
      message: 'Note created successfully',
      data: newNote
    }));

    console.log('Note created:', newNote);

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
    console.error('Function error:', error);
  }
}
