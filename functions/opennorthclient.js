'use strict';
const request = require('request');

const bodyParser = require('body-parser');

const baseURL = 'https://represent.opennorth.ca/'

// Get representatives for a location
function getReps(lat, lon) {
  return new Promise((resolve, reject) => {
    const url = baseURL + 'representatives';
    const q = { point: `${lat},${lon}` };
    request({ url: url, qs: q }, (err, res) => {
      if (err) {
        console.log(err);
        return reject(err);
      }
      return resolve(res.body);
    });
  });
}
exports.getReps = getReps;

// Take JSON as returned by getReps and return a map of available offices
// to the corresponding rep. Example offices: ['Mayor', 'City councilor', 'MP, 'MPP']
function getOffices(repsJSON) {
  const reps = repsJSON.objects;
  let offices = {};
  let rep = {};
  for (let i = 0; i < reps.length; i++) {
    rep = reps[i];
    offices[rep.elected_office] = rep;
  }
  return offices;
}
exports.getOffices = getOffices;

/**
 * Return list of strings as a sentence fragment with conjunction.
 * Example: (['apples, 'oranges', 'bananas'], 'or') => 'apples, oranges, and bananas'
 */
function getConjoined(list, conjunction) {
  if (list.length === 1) {
    return list[0];
  } else if (list.length === 2) {
    return `${list[0]} ${conjunction} ${list[1]}`;
  } else {
    return `${list.slice(0, -1).join(', ')}, ${conjunction} ${list[list.length - 1]}`;
  }
}
exports.getConjoined = getConjoined;

function getContactString(rep) {
  let contactString = '';
  if (rep.email) {
    contactString = `You can email them at ${rep.email}.`;
  }
  let phones = [];
  if (rep.offices) {
    for (let i = 0; i < rep.offices.length; i++) {
      if (rep.offices[i].tel) {
        if (rep.offices[i].type) {
          phones.push(`their ${rep.offices[i].type} line at ${rep.offices[i].tel}`);
        }
        else {
          phones.push(`them at ${rep.offices[i].tel}`);
        }
      }
    }
  }
  if (phones.length > 0) {
    contactString = contactString + ` You can call ${getConjoined(phones, 'or')}.`
  }
  return contactString;
}
exports.getContactString = getContactString;
