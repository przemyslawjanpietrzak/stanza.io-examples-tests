'use strict';

const payloadPlugin = require('../../stanzaPlugins/payload');

const clientInitService = require('../../services/clientInit');
const parsePayload = require('../../services/parsePayload');
const triggerCommand = require('../../services/triggerCommand');

const command = `~/venv/bin/python ~/code/backend/manage.py simulate_notification 'ecrf.visit.open'`; // wait for backend


describe('Open visit notification', function() {
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

    const MUC = 'patient_1@conference.localhost';

    client.on('muc:join', (muc) => {
      expect(muc.from.bare).toEqual(MUC);
      triggerCommand(command, done.fail);
    });

    client.on('payload:openVisit', function (msg) {
      const data = parsePayload(msg.payload);

      expect(new Date(data.time)).toEqual(jasmine.any(Date));
      expect(data.id).toEqual(jasmine.any(Number));
      expect(data.status).toEqual('open');

      expect(data.visit).toEqual(jasmine.any(Object));
      expect(data.visit.description).toEqual(jasmine.any(String));
      expect(data.visit.title).toEqual(jasmine.any(String));

      expect(msg.from.bare).toEqual(MUC);
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
