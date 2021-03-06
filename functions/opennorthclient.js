'use strict';
const request = require('request-promise-native');
const { Representative } = require('./representative.js');

const baseURL = 'https://represent.opennorth.ca/'

// Get representatives for a location
async function getReps(lat, lon) {
  const url = baseURL + 'representatives';
  const q = { point: `${lat},${lon}` };
  const response = await request({ url: url, qs: q });
  try {
    const json = JSON.parse(response);
    if (json.objects.length === 0) {
      throw Error(`No representatives found for address ${lat},${lon}`);
    }
    return json;
  } catch (e) {
    console.log(e);
    console.log(response);
    throw e;
  }
}
exports.getReps = getReps;

// Take JSON as returned by getReps and return a map of available offices
// to the corresponding rep. Example offices: ['Mayor', 'City councilor', 'MP, 'MPP']
function getOffices(repsJSON) {
  let rawReps;
  try {
    rawReps = repsJSON.objects;
  } catch (e) {
    console.log(`Error (${e}) JSON: ${repsJSON}`);
    throw new Error('Malformed JSON');
  }
  if (rawReps.length === 0) {
    throw new Error('No results');
  }
  let offices = {};
  let rawRep;
  for (let i = 0; i < rawReps.length; i++) {
    rawRep = rawReps[i];
    offices[rawRep.elected_office] = [repFromRaw(rawRep)];
  }
  return offices;
}
exports.getOffices = getOffices;

function repFromRaw(rawRep) {
  let rep = new Representative(rawRep.name, rawRep.elected_office);
  rep.addEmail(rawRep.email);
  if (rawRep.offices) {
    let office;
    for (let i = 0; i < rawRep.offices.length; i++) {
      office = rawRep.offices[i];
      if (office.tel) {
        rep.addPhone(office.tel, office.type);
      }
    }
  }
  rep.setContactString();
  return rep;
}
exports.repFromRaw = repFromRaw;
