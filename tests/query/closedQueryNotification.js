'use strict';

const payloadPlugin = require('../../stanzaPlugins/payload');
const clientInitService = require('../../services/clientInit');

const parsePayload = require('../../services/parsePayload');
const triggerCommand = require('../../services/triggerCommand');


describe('Closed query notification', function() {

  let client;
  const command = `~/venv/bin/python ~/code/backend/manage.py simulate_notification 'desk.closed_task_notification'`;

  beforeEach(function(done) {
    clientInitService('physican1').then(newClient => {
      client = newClient;
      client.use(payloadPlugin);
      done();
    });

  });


  it('Should recive notifiacation after simulate request', function(done) {

    const MUC = 'patient_3@conference.localhost';

    client.on('muc:join', (muc) => {
      expect(muc.from.bare).toEqual(MUC);
      triggerCommand(command, done.fail);
    });

    client.on('payload:closeQuery', function (msg) {
      const data = parsePayload(msg.payload);
      expect(data['id']).toEqual(jasmine.any(Number));
      expect(msg.from.bare).toEqual(MUC);
      done();
    });

    client.joinRoom(MUC); // active muc:join handler

  }, 25000);


  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });


});
