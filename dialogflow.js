const dialogflow = require('@google-cloud/dialogflow');
const uuid = require('uuid');

async function dialog(message) {
	// Project ID
	projectId = 'chatbot-fhow';

	// A unique identifier for the given session
	const sessionId = uuid.v4();

	// Create a new session
	const sessionClient = new dialogflow.SessionsClient();
	const sessionPath = sessionClient.projectAgentSessionPath(projectId, sessionId);

	// The text query request.
	const request = {
		session: sessionPath,
		queryInput: {
			text: {
				// The query to send to the dialogflow agent
				text: message,
				// The language used by the client (en-US)
				languageCode: 'en-US'
			}
		}
	};

	// Send request and log result
	const responses = await sessionClient.detectIntent(request);
	// console.log('Detected intent');
	const result = responses[0].queryResult;
	// console.log(`  Query: ${result.queryText}`);
	// console.log(`  Response: ${result.fulfillmentText}`);
	// console.log(`  Intent: ${result.intent.displayName} \n so relaying message`);
	return result.fulfillmentText;
}

exports.dialog = dialog;
