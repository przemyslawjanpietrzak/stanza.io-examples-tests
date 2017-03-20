'use strict';

const payloadPlugin = require('../stanzaPlugins/payload');
const settings = require('../stanzaPlugins/settings');
const clientInitService = require('../services/clientInit');
const parsePayload = require('../services/parsePayload');

describe('Client should be able to get his contact list', () => {
  let client;
  beforeEach((done) => {
    clientInitService('physican1')
      .then(newClient => {
        client = newClient;
        client.use(payloadPlugin);
        client.askForContactList = function(name) {
          this.sendMessage({
            to: settings.TO,
            from: client.jid.bare, // must have 'from' attr!!!
            type: 'chat', // is needed
            body: 'role_list',
            payload: {
              clintype: settings.CLINTYPE_RULE_LIST_REQUEST,
              value: JSON.stringify({ name })
            }
          });
        };
      })
    .then(done, done.fail);
  });

  it('should receive response in correct format', (done) => {
    client.askForContactList('eryk');
    client.on('payload:ruleList', (message) => {
      const data = parsePayload(message.payload);
      expect(data).toBeDefined();
      expect(data).toBeObject();
      expect(data).toBeNonEmptyObject();
      expect(data).toHaveArrayOfStrings('general_rooms');
      expect(data).toHaveArrayOfStrings('patient_rooms');
      expect(data).toHaveArrayOfStrings('roster');
      expect(data).toEqual({
        general_rooms: ['general@conference.localhost'],
        patient_rooms: ['patient_1@conference.localhost', 'patient_2@conference.localhost', 'patient_3@conference.localhost' ],
        roster: ['physican1@localhost', 'physican2@localhost', 'physican3@localhost' ]
      });

      done();
    });

  }, 25000);

  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });

});
