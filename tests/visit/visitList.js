'use strict';

const payloadPlugin = require('../../stanzaPlugins/payload');
const settings = require('../../stanzaPlugins/settings');
const clientInitService = require('../../services/clientInit');
const parsePayload = require('../../services/parsePayload');

describe('Response_on_visit_list_request', function() {

  let client;

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client = newClient;
        client.use(payloadPlugin);
        client.askForVisitList = function (patientJID) {
          client.sendMessage({
            to: settings.TO,
            from: client.jid.bare, // must have 'from' attr!!!
            type: 'chat', // is needed
            body: 'visit_list',
            payload: {
              clintype: settings.CLINTYPE_VISIT_LIST_REQUEST,
              value: patientJID
            }
          });
        };
      })
    .then(done, done.fail);
  });

  it('Response_on_visit_request', function(done) {

    const muc = 'patient_1@conference.localhost';
    client.askForVisitList(muc);

    client.on('message', function (msg) {
      if (msg.payload && msg.payload.clintype === settings.CLINTYPE_VISIT_LIST_RESPONSE) {
        const data = parsePayload(msg.payload);

        expect(data).toEqual(jasmine.any(Array));
        data.forEach((item) => {
          expect(item.id).toBeDefined();
          expect(item.id).toEqual(jasmine.any(Number));
          expect(item.status).toBeDefined();
          expect(item.status).toContain('open');
          expect(item.time).toBeDefined();
          expect(new Date(item.time)).toEqual(jasmine.any(Date));

          expect(item.visit.description).toBeDefined();
          expect(item.visit.description).toEqual(jasmine.any(String));

          expect(item.visit.title).toBeDefined();
          expect(item.visit.title).toEqual(jasmine.any(String));

          expect(item.procedures).toBeDefined();
          expect(item.procedures).toEqual(jasmine.any(Array));
          item.procedures.forEach((procedure) => {
            expect(procedure.id).toBeDefined();
            expect(procedure.id).toEqual(jasmine.any(Number));

            expect(procedure.procedure_code).toBeDefined();
            expect(procedure.procedure_code).toEqual(jasmine.any(String));

            expect(procedure.status).toBeDefined();
            expect(procedure.status).toEqual(jasmine.any(String));

            expect(procedure.visit).toBeDefined();
            expect(procedure.visit).toEqual(jasmine.any(Number));
            expect(procedure.visit).toEqual(item.id);
          });
        });
        // Example output:
        // [ { id: 1,
        //   status: 'open',
        //   time: '2016-06-22T06:42:24.022018Z',
        //   visit: { description: 'Visit description 0', title: 'Visit 0' } },
        //   procedures: [ { id: 13,
        //     procedure_code: 'VITAL.WEIGHT_KG.12',
        //       status: 'open',
        //       visit: 1
        //     },
        //     {
        //       id: 14,
        //       procedure_code: 'VITAL.WEIGHT_KG.13',
        //       status: 'open',
        //       visit: 1
        //     },
        // { id: 2,
        //   status: 'open',
        //   time: '2016-06-22T06:42:24.022018Z',
        //   visit: { description: 'Visit description 1', title: 'Visit 1' } },
        // { id: 3,
        //   status: 'open',
        //   time: '2016-06-22T06:42:24.022018Z',
        //   visit: { description: 'Visit description 2', title: 'Visit 2' } },
        // { id: 4,
        //   status: 'open',
        //   time: '2016-06-22T06:42:24.022018Z',
        // } ]

        done();
      }
    });

  }, 15000);

  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });

});
