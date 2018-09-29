'use strict';

const express = require('express');
const civicInfoClient = require('./civicinformationclient');
const functions = require('firebase-functions');
const cors = require('cors')({ origin: true });

const app = express();
// Automatically allow cross-origin requests
app.use(cors);

// json list of all us reps for the location
app.get('/usReps/:latlon', async (req, res) => {

  let lat, lon;
  try {
    console.log(req.params.latlon);
    const splitLL = req.params.latlon.split(',');
    lat = splitLL[0];
    lon = splitLL[1];
  } catch (e) {
    console.log(e);
    res.send({ error: 'Invalid latitude and longitude provided.' });
  }
  try {
    const rawJSON = await civicInfoClient.getReps(lat, lon);
    const reps = civicInfoClient.getRawRepsWithOffice(rawJSON);
    res.send(reps);
  } catch (e) {
    console.log(e);
    res.send({ error: 'Could not retrieve reps from civic info API. ' +
                      'Your location may not be supported.' });
  }
});

// Expose Express API as a single Cloud Function:
exports.civicinfo = functions.https.onRequest(app);
