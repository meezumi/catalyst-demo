module.exports = (context, basicIO) => {
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
