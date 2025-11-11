module.exports = (context, basicIO) => {
	try {
		// Get the argument passed from the form
		const userInput = basicIO.getArgument('argument1');
		
		// Process the input
		let responseMessage = '';
		
		if (userInput) {
			responseMessage = `Hello! You sent: "${userInput}". This message was processed by the serverless function at ${new Date().toLocaleTimeString()}.`;
		} else {
			responseMessage = `Hello from the serverless function! Current time: ${new Date().toLocaleTimeString()}`;
		}

		// Send the response
		basicIO.write(responseMessage);
		
		console.log('Function executed successfully');
		
	} catch (error) {
		basicIO.write(`Error: ${error.message}`);
		console.error('Function error:', error);
	}
	
	context.close();
};
