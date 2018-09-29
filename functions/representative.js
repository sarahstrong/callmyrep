'use strict';

const utils = require('./utils');

class Representative {

  constructor(name, office) {
    this.name = name;
    this.office = office;
    this.phones = [];
  }

  addEmail(email) {
    this.email = email;
  }

  addPhone(number, type) {
    this.phones.push(new Phone(number, type));
  }

  /**
   * Set string explaining how to contact the rep
   */
  setContactString() {
    let contactString = '';
    if (this.email) {
      contactString = `You can email them at ${this.email}.`;
    }
    let phoneStrs = [];
    let phone;
    for (let i = 0; i < this.phones.length; i++) {
      phone = this.phones[i];
      if (phone.number) {
        if (phone.type) {
          phoneStrs.push(`their ${phone.type} line at ${phone.number}`);
        }
        else {
          phoneStrs.push(`them at ${phone.number}`);
        }
      }
    }
    if (phoneStrs.length > 0) {
      contactString = [contactString, `You can call ${utils.getConjoined(phoneStrs, 'or')}.`].join(' ');
    }
    this.contactString = contactString;
  }
}

class Phone {
  constructor(number, type) {
    this.number = number;
    this.type = type;
  }
}

module.exports = { Representative };
