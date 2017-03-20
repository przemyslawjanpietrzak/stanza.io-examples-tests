'use strict';

const clientInitService = require('../services/clientInit');

describe('Client should be able to sending messages', function() {
  let client1;
  let client2;

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client1 = newClient;
      })
      .then(done, done.fail);
  });

  beforeEach(function(done) {
    clientInitService('physican2')
      .then(newClient => {
        client2 = newClient;
      })
      .then(done, done.fail);
  });

  it('send message callback', function(done) {
    client1.on('message:sent', () => {
      done();
    });

    client1.sendMessage({
      to: 'physican2@localhost',
      body: 'Czesc',
      type: 'chat'
    });

  }, 25000);

  it('should recive chat-message from other client', function(done) {

    client1.on('message', () => {
      done();
    });

    client2.sendMessage({
      to: client1.jid.bare,
      body: 'Czesc',
      type: 'chat'
    });

  }, 15000);

  afterEach((done) => {
    client1.on('disconnected', () => {
      done();
    });
    client1.on('disconnected', () => {
      client2.disconnect();
    });
    client1.disconnect();
  });

});
