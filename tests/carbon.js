'use strict';
const clientInitService = require('../services/clientInit');

describe('Creatte Client and Session', function() {
  let client1_1;
  let client1_2;
  let client2;

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client1_1 = newClient;
      })
      .then(done, done.fail);
  });

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client1_2 = newClient;
        client1_1.enableCarbons();
      })
      .then(done, done.fail);
  });

  beforeEach(function(done) {
    clientInitService('physican2')
      .then(newClient => {
        client2 = newClient;
        client2.enableCarbons();
      })
      .then(done, done.fail);
  });

  it(`twin clients should have the same jid's bare, but diffrent full value`, () => {
    expect(client1_1.jid.bare).toEqual(client1_2.jid.bare);
    expect(client1_1.jid.full).not.toEqual(client1_2.jid.full);
  });

  it('sent message should appear in twin client by carbon event', (done) => {
    const messageContent = 'Czesc Mala';
    client1_1.on('carbon:sent', (carbon) => {
      const message = carbon.carbonSent.forwarded.message;

      expect(message.body).toEqual(messageContent);
      expect(message.to.local).toEqual(client2.jid.local);
      expect(message.to.bare).toEqual(client2.jid.bare);

      expect(message.from.local).toEqual(client1_2.jid.local);
      expect(message.from.bare).toEqual(client1_2.jid.bare);
      expect(message.from.full).toEqual(client1_2.jid.full);
      expect(message.from.full).not.toEqual(client1_1.jid.full); // be carefull

      expect(carbon.to.local).toEqual(client1_1.jid.local);
      expect(carbon.to.bare).toEqual(client1_1.jid.bare);
      expect(carbon.from.local).toEqual(client1_1.jid.local);
      expect(carbon.from.bare).toEqual(client1_1.jid.bare);
      expect(carbon.type).toEqual('chat');
      done();
    });

    client1_2.on('carbon:sent', () => {
      done.fail();
    });

    client1_2.sendMessage({
      to: client2.jid.bare,
      body: messageContent,
      type: 'chat'
    });

  });


  it('sent message should appear in twin client by message event', (done) => {
    const messageContent = 'Czesc';

    client1_1.on('message:sent', (message) => {
      expect(message.body).toEqual(messageContent);
      expect(message.to.local).toEqual(client2.jid.local);
      expect(message.to.bare).toEqual(client2.jid.bare);
      expect(message.from.local).toEqual(client1_1.jid.local);
      expect(message.from.bare).toEqual(client1_1.jid.bare);
      expect(message.carbon).toEqual(true); // can be helpful
      expect(message.type).toEqual('chat');
      done();
    });

    client1_2.on('carbon:sent', () => {
      done.fail();
    });

    client1_2.sendMessage({
      to: client2.jid.bare,
      body: messageContent,
      type: 'chat'
    });

  });

  it('carbon received event should be emit after sent message direct to twin client, (only to him)', (done) => {
    const messageContent = 'No elo';

    client1_1.on('carbon:received', (carbon) => {
      const message = carbon.carbonReceived.forwarded.message;

      expect(message.to.full).toEqual(client1_2.jid.full);
      expect(message.body).toEqual(messageContent);
      expect(carbon.to.full).not.toEqual(message.to.full);

      expect(carbon.to.full).toEqual(client1_1.jid.full);
      expect(carbon.to.local).toEqual(client1_1.jid.local);
      expect(carbon.to.bare).toEqual(client1_1.jid.bare);
      done();
    });

    client2.sendMessage({
      to: client1_2.jid.full, //full value is diffrent for client1_1 and client1_2
      body: messageContent,
      type: 'chat'
    });

  }, 5000);

  afterEach((done) => {
    client2.on('disconnected', () => {
      done();
    });
    client1_1.disconnect();
    client1_2.disconnect();
    client2.disconnect();
  });

});
