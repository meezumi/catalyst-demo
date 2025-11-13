const { initializeApp } = require('firebase/app');
const { getDatabase, ref, update } = require('firebase/database');
const firebaseConfig = require('./firebase.config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = async (context, basicIO) => {
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
			context.close();
			return;
		}

		// Update note in Firebase
		const noteRef = ref(database, `notes/${id}`);
		const updates = {
			title: title,
			content: content,
			updatedAt: new Date().toISOString()
		};

		await update(noteRef, updates);

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

	context.close();
};
