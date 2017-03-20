'use strict';
const clientInitService = require('../services/clientInit');
const settings = require('../stanzaPlugins/settings');
const payloadPlugin = require('../stanzaPlugins/payload');
const parsePayload = require('../services/parsePayload');

describe('Procedure definition', function() {
  let client;

  beforeEach((done) => {
    clientInitService('physican1')
      .then(newClient => {
        client = newClient;
        client.use(payloadPlugin);
        client.askForProcedureDefinition = function(procedureCode) {
          this.sendMessage({
            to: settings.TO,
            from: client.jid.bare, // must have 'from' attr!!!
            type: 'chat', // is needed
            body: 'procedure_definition',
            payload: {
              clintype: settings.CLINTYPE_PROCEDURE_DEFINITION_REQUEST,
              value: procedureCode,
            }
          });
        };
      })
      .then(done, done.fail);
  });

  it('payload procedure definition request should return response', (done) => {
    const exampleProcedureCode = 'VITAL.WEIGHT_KG.0';

    client.on('payload:procedureDefinition', (payloadMessage)=>{

      const data = parsePayload(payloadMessage.payload);
      expect(data).toEqual(jasmine.any(Object));

      expect(data.content).toEqual(jasmine.any(String));
      expect(data.name).toEqual(jasmine.any(String));
      done();
    });

    client.askForProcedureDefinition(exampleProcedureCode);
  }, 12000);

  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });

});
