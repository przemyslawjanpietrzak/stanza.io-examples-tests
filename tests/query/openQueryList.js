'use strict';

const payloadPlugin = require('../../stanzaPlugins/payload');
const settings = require('../../stanzaPlugins/settings');
const clientInitService = require('../../services/clientInit');
const parsePayload = require('../../services/parsePayload');

describe('Response_on_open_query_request', function() {

  let client;

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client = newClient;
        client.use(payloadPlugin);
        client.askForOpenTaskList = function (patientJID) {
          client.sendMessage({
            to: settings.TO,
            from: client.jid.bare, // must have 'from' attr!!!
            type: 'chat', // is needed
            body: 'open_task_list',
            payload: {
              clintype: settings.CLINTYPE_OPENED_QUERY_LIST_REQUEST,
              value: patientJID
            }
          });
        };
      })
    .then(done, done.fail);
  });

  it('Response on open query list request', function(done) {

    const muc = 'patient_1@conference.localhost';
    client.askForOpenTaskList(muc);

    client.on('message', function (msg) {
      if (msg.payload && msg.payload.clintype === settings.CLINTYPE_OPENED_QUERY_LIST_RESPONSE) {
        const data = parsePayload(msg.payload);
        expect(data).toEqual(jasmine.any(Array));
        data.forEach((item) => {
          expect(item).toEqual(jasmine.any(Object));

          expect(Object.keys(item)).toContain('id');
          expect(Object.keys(item)).toContain('msg_text');
          expect(Object.keys(item)).toContain('room_code');
          expect(Object.keys(item)).toContain('procedure_code');

          expect(item.id).toEqual(jasmine.any(Number));
          expect(item.msg_text).toEqual(jasmine.any(String));
          expect(item.procedure_code).toEqual(jasmine.any(String));
          expect(item.room_code).toEqual(muc);
          expect(item.url).toEqual(jasmine.any(String));

        });

        done();
      }
    });

  }, 25000);

  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });

});
