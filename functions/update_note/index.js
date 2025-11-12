module.exports = (context, basicIO) => {
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

		// Create updated note object
		const updatedNote = {
			id: id,
			title: title,
			content: content,
			updatedAt: new Date().toISOString()
		};

		// Return success response
		basicIO.write(JSON.stringify({
			success: true,
			message: 'Note updated successfully',
			data: updatedNote
		}));

		console.log('Note updated:', updatedNote);

	} catch (error) {
		basicIO.write(JSON.stringify({
			success: false,
			message: `Error: ${error.message}`
		}));
		console.error('Function error:', error);
	}

	context.close();
};
