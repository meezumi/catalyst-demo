const { initializeApp } = require('firebase/app');
const { getDatabase, ref, get } = require('firebase/database');
const firebaseConfig = require('./firebase.config');

// Initialize Firebase
const app = initializeApp(firebaseConfig);
const database = getDatabase(app);

module.exports = async (context, basicIO) => {
	try {
		// Read all notes from Firebase
		const notesRef = ref(database, 'notes');
		const snapshot = await get(notesRef);

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

	context.close();
};
