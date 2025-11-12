module.exports = (context, basicIO) => {
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

		// Create note object with unique ID (simple approach)
		const newNote = {
			id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
			title: title,
			content: content,
			createdAt: new Date().toISOString(),
			updatedAt: new Date().toISOString()
		};

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
