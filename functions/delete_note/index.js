const { initializeApp } = require('firebase/app');
const { getDatabase, ref, remove } = require('firebase/database');
const firebaseConfig = require('./firebase.config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = async (context, basicIO) => {
	try {
		// Get parameters from request
		const id = basicIO.getArgument('id');

		// Validate input
		if (!id) {
			basicIO.write(JSON.stringify({
				success: false,
				message: 'ID is required'
			}));
			context.close();
			return;
		}

		// Delete note from Firebase
		const noteRef = ref(database, `notes/${id}`);
		await remove(noteRef);

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

	context.close();
};
