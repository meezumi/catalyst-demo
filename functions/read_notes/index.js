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
  readNotes(basicIO).catch(err => {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${err.message}`
    }));
    console.error('Function error:', err);
    context.close();
  });
};

async function readNotes(basicIO) {
  try {
    // Read all notes from Firebase
    const notesRef = db.ref('notes');
    const snapshot = await notesRef.once('value');

    let notes = [];
    if (snapshot.exists()) {
      const notesData = snapshot.val();
      // Convert Firebase object to array
      notes = Object.keys(notesData).map(key => ({
        id: key,
        ...notesData[key]
      }));
    }

    basicIO.write(JSON.stringify({
      success: true,
      message: 'Notes retrieved successfully',
      data: notes
    }));

    console.log(`Retrieved ${notes.length} notes`);

  } catch (error) {
    basicIO.write(JSON.stringify({
      success: false,
      message: `Error: ${error.message}`
    }));
    console.error('Function error:', error);
  }
}
