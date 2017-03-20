'use strict';

var clientInitService = require('../services/clientInit');
const joinRoomService = require('../services/joinRoom');

describe('Sending and reciving groupchat messages to MUCs', function() {
  let client1;
  let client2;
  let client3;

  const MUC = 'some_room@conference.localhost';
  const messageContent = 'Hej Malenka ;)';

  beforeEach(function(done) {
    clientInitService('physican1')
    .then(newClient =>  {
      client1 = newClient;
      return joinRoomService(client1, MUC);
    })
    .then(done, done.fail);
  });

  beforeEach(function(done) {
    clientInitService('physican2')
    .then(newClient =>  {
      client2 = newClient;
      return joinRoomService(client2, MUC);
    })
    .then(done, done.fail);
  });

  beforeEach(function(done) {
    clientInitService('physican3')
    .then(newClient =>  {
      client3 = newClient;
      return joinRoomService(client3, MUC);
    })
    .then(done, done.fail);
  });


  it('send message callback', function(done) {


    client1.on('groupchat', (message) => {
      expect(message.body).toEqual(messageContent);
      expect(message.from.bare).toEqual(MUC);
      expect(message.from.resource).toEqual('physican2');
      expect(message.type).toEqual('groupchat');
      done();
    });

    client2.sendMessage({
      to: MUC,
      body: messageContent,
      type: 'groupchat'
    });

  }, 25000);

  it('every client in room should recive message', (done) => {
    const promise1 = Promise;
    const promise2 = Promise;

    client1.on('groupchat', (message) => {
      expect(message.body).toEqual(messageContent);
      expect(message.from.bare).toEqual(MUC);
      expect(message.from.resource).toEqual('physican3');
      expect(message.type).toEqual('groupchat');
      promise1.resolve();
    });

    client2.on('groupchat', (message) => {
      expect(message.body).toEqual(messageContent);
      expect(message.from.bare).toEqual(MUC);
      expect(message.from.resource).toEqual('physican3');
      expect(message.type).toEqual('groupchat');
      promise2.resolve();
    });

    client3.sendMessage({
      to: MUC,
      body: messageContent,
      type: 'groupchat'
    });

    Promise.all([promise1, promise2]).then(done, done.fail);
  });

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
