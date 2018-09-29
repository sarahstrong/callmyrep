'use strict';
const request = require('request-promise-native');
const functions = require('firebase-functions');
const { Representative } = require('./representative.js');

const baseURL = 'https://www.googleapis.com/civicinfo/v2/representatives'

const officeSearchStrings = {
  '^mayor$': 'Mayor',
  '^attorney general$': 'Attorney General',
  'council': 'Councillor',
  'senate': 'Senator',
  'house of representatives': 'House Rep',
  '^governor$': 'Governor',
  'president of the united states': 'President',
  'vice-president of the united states': 'Vice-President',
  '^sheriff$': 'Sheriff',
}

// Get representatives for a location
async function getReps(lat, lon) {
  const url = baseURL + 'representatives';
  const key = functions.config().civicinfo.key;
  const q = { address: `${lat},${lon}`, key: key };
  const response = await request({ url: url, qs: q });
  try {
    const json = JSON.parse(response);
    if (json.error) {
      throw Error('Server error, likely unsupported location.');
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
function getOffices(rawJSON) {
  let rawOffices;
  try {
    rawOffices = rawJSON.offices;
  } catch (e) {
    console.log(`Error (${e}) JSON: ${rawJSON}`);
    throw new Error('Malformed JSON');
  }
  let officeIndices = {};
  let officeName, searchString;
  for (let i = 0; i < rawOffices.length; i++) {
    for (let j = 0; j < Object.keys(officeSearchStrings).length; j++) {
      searchString = Object.keys(officeSearchStrings)[j];
      if (rawOffices[i].name.match(new RegExp(searchString, 'i'))) {
        officeName = officeSearchStrings[searchString];
        if (officeIndices[officeName]) {
          officeIndices[officeName].concat(rawOffices[i].officialIndices);
        } else {
          officeIndices[officeName] = rawOffices[i].officialIndices;
        }
      }
    }
  }
  let officeMap = {};
  let rep, index;
  for (let i = 0; i < Object.keys(officeIndices).length; i++) {
    officeName = Object.keys(officeIndices)[i];
    officeMap[officeName] = [];
    for (let j = 0; j < officeIndices[officeName].length; j++) {
      index = officeIndices[officeName][j];
      rep = repFromRaw(officeName, rawJSON.officials[index]);
      officeMap[officeName].push(rep);
    }
  }
  return officeMap;
}
exports.getOffices = getOffices;

function repFromRaw(office, rawRep) {
  let rep = new Representative(rawRep.name, office);
  if (rawRep.emails) {
    rep.addEmail(rawRep.emails[0]);
  }
  if (rawRep.phones) {
    let office;
    for (let i = 0; i < rawRep.phones.length; i++) {
      rep.addPhone(rawRep.phones[i], null);
    }
  }
  rep.setContactString();
  return rep;
}
exports.repFromRaw = repFromRaw;
