const { initializeApp } = require('firebase/app');
const { getDatabase, ref, push, set } = require('firebase/database');
const firebaseConfig = require('./firebase.config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = async (context, basicIO) => {
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
			context.close();
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
		const notesRef = ref(database, 'notes');
		const newNoteRef = push(notesRef);
		await set(newNoteRef, newNote);

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

	context.close();
};
