'use strict';

// Import the firebase-functions package for deployment.
const functions = require('firebase-functions');
const north = require('./opennorthclient');
const civicInfoClient = require('./civicinformationclient');
const utils = require('./utils');

// Import the Dialogflow module and response creation dependencies
// from the Actions on Google client library.
const {
  dialogflow,
  Permission,
  BasicCard,
  Button,
  NewSurface,
} = require('actions-on-google');

// Instantiate the Dialogflow client.
const app = dialogflow({ debug: true });

app.middleware((conv) => {
  console.log(`Intent=${conv.intent}`);
  conv.utils = new utils.Utils(conv);
});

// Handle the Dialogflow intent named 'Default Welcome Intent'.
app.intent('Default Welcome Intent', (conv) => {
  // Asks the user's permission to know their name, for personalization.
  conv.utils.ask(new Permission({
    context: 'To find your local representative',
    permissions: 'DEVICE_PRECISE_LOCATION',
  }));
});

// Handle the Dialogflow intent named 'actions_intent_PERMISSION'. If user
// agreed to PERMISSION prompt, then boolean value 'permissionGranted' is true.
app.intent('actions_intent_PERMISSION', async (conv, params, permissionGranted) => {
  if (!permissionGranted) {
    conv.close(`Sorry, I need your location to find your local representative.`);
    return;
  }
  conv.data.lat = conv.device.location.coordinates.latitude;
  conv.data.lon = conv.device.location.coordinates.longitude;
  let repsJSON, repsByOffice;
  const errorString = 'Sorry, something went wrong finding your representative. ' +
                      'Your location may not be supported.';
  try {
    repsJSON = await civicInfoClient.getReps(conv.data.lat, conv.data.lon);
    repsByOffice = civicInfoClient.getOffices(repsJSON);
    conv.data.country = 'usa';
  } catch (e) {
    console.log(e);
    console.log('Failed to get rep info from US, trying Canada.');
    try {
      repsJSON = await north.getReps(conv.data.lat, conv.data.lon);
      repsByOffice = north.getOffices(repsJSON);
      conv.data.country = 'canada';
    } catch (e2) {
      console.log(e2);
      console.log('Failed to get rep info from Canada, closing conv');
      conv.utils.close(errorString);
      return;
    }
  }
  conv.data.repsByOffice = JSON.stringify(repsByOffice);
  const reps = utils.getConjoined(Object.keys(repsByOffice), 'or');
  conv.utils.ask(`Would you like to talk to your ${reps}?`);
});

app.intent('actions_intent_PERMISSION - choose_office', (conv, params) => {
  const repsByOffice = JSON.parse(conv.data.repsByOffice);
  const rep = repsByOffice[params.office][0];
  if (!rep) {
    const reps = utils.getConjoined(Object.keys(repsByOffice), 'or');
    conv.utils.close(`Couldn't find rep ${params.office} in any of ${reps}.`)
  } else {
    const repInfo = `Your local ${params.office}'s name is ${rep.name}. ${rep.contactString}`;
    if (conv.utils.screenActive) {
      conv.utils.close(repInfo, getRepCard(conv.data.country, conv.data.lat, conv.data.lon));
    } else if (conv.utils.screenAvailable) {
      conv.data.repInfo = repInfo;
      const context = 'I have contact information for you.';
      const notification = 'Contact your local representative';
      const capabilities = ['actions.capability.SCREEN_OUTPUT'];
      conv.utils.ask(new NewSurface({context, notification, capabilities}));
    } else {
      conv.utils.ask(`${repInfo} Would you like me to repeat that?`);
    }
  }
});

app.intent('new surface', (conv, input, newSurface) => {
  const repInfo = conv.data.repInfo;
  if (newSurface.status === 'OK') {
    conv.utils.close(repInfo, getRepCard(conv.data.country, conv.data.lat, conv.data.lon));
  } else {
    conv.utils.ask(`${repInfo} Would you like me to repeat that?`);
  }
});

app.intent(['reprompt',
            'new surface - yes',
            'actions_intent_PERMISSION - choose_office - yes'], (conv) => {
  conv.utils.retainCurrentContexts();
  conv.utils.ask(conv.data.lastResponse);
});

function getRepCard(country, lat, lon) {
  const projectID = process.env.GCLOUD_PROJECT;
  let url;
  if (country === 'canada') {
    url = `https://${projectID}.firebaseapp.com/careps.html?lat=${lat}&lon=${lon}`;
  } else if (country === 'usa') {
    url = `https://${projectID}.firebaseapp.com/usreps.html?lat=${lat}&lon=${lon}`;
  } else {
    console.log(`Unrecognized country ${country}, skipping card`);
    return undefined;
  }
  return new BasicCard({
    text: 'Your local representatives',
    buttons: new Button({
      title: 'Contact',
      url: url,
    }),
  });
}

// Set the DialogflowApp object to handle the HTTPS POST request.
exports.dialogflowFirebaseFulfillment = functions.https.onRequest(app);
