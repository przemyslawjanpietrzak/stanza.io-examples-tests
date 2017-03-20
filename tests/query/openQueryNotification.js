'use strict';

const payloadPlugin = require('../../stanzaPlugins/payload');

const clientInitService = require('../../services/clientInit');
const parsePayload = require('../../services/parsePayload');
const triggerCommand = require('../../services/triggerCommand');

const command = `~/venv/bin/python ~/code/backend/manage.py simulate_notification 'ecrf.query.open'`;


describe('Open query notification', function() {
  'use strict';
  let client;

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client = newClient;
        client.use(payloadPlugin);
      })
      .then(done, done.fail);
  });


  it('Should recive notifiacation after simulate request', function(done) {

    const MUC = 'patient_3@conference.localhost';

    client.on('muc:join', (muc) => {
      expect(muc.from.bare).toEqual(MUC);
      triggerCommand(command, done.fail);
    });


    client.on('payload:openQuery', function (msg) {
      const data = parsePayload(msg.payload);
      expect(data.id).toEqual(jasmine.any(Number));
      expect(data.msg_text).toEqual(jasmine.any(String));
      expect(data.procedure_code).toEqual(jasmine.any(String));
      expect(data.room_code).toEqual(jasmine.any(String));
      expect(data.url).toEqual(jasmine.any(String));
      done();
    });

    client.joinRoom(MUC);

  }, 25000);


  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });

});
