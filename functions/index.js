'use strict';

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
  dialogflow,
  Permission,
} = require('actions-on-google');

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  // Asks the user's permission to know their name, for personalization.
  conv.ask(new Permission({
    context: ' Hi there! To find your local representative',
    permissions: 'DEVICE_PRECISE_LOCATION',
  }));
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    conv.close(`Sorry, I need your location to find your local representative.`);
  } else {
    console.log(conv);
    conv.data.lat = conv.device.location.coordinates.latitude;
    conv.data.lon = conv.device.location.coordinates.longitude;
    conv.ask(`Thanks for providing your location!.`);
    conv.followup('request_level_of_government');
  }
});

app.intent('request_level_of_government', (conv, params) => {
  conv.close(`You requested your ${params.level_of_government} representative.`);
});

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
