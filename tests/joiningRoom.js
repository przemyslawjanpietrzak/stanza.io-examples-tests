'use strict';
const clientInitService = require('../services/clientInit');
const joinRoomService = require('../services/joinRoom');

describe('Joining to Rooms', () => {
  let client;
  const physican = 'physican1';

  beforeEach((done) => {
    clientInitService(physican)
      .then(newClient => {
        client = newClient;
      })
      .then(done, done.fail);
  });

  it('client should be joined to room after call joinRoom method', (done) => {

    client.on('muc:error', (msg) => {
      done.fail(msg.error.condition);
    });

    joinRoomService(client, 'room1@conference.localhost')
      .then(() => joinRoomService(client, 'room2@conference.localhost') )
      .then(() => {
        expect(client.joinedRooms).toEqual(jasmine.any(Object));
        expect(client.joinedRooms).toEqual({
          'room1@conference.localhost': physican,
          'room2@conference.localhost': physican,
        });
      })
      .then(done, done.fail);

  }, 25000);

  it('client should emit muc:error after put wrong room name', (done) => {
    const roomNameWithTypo = 'room1@confarance.localhost';
    joinRoomService(client, roomNameWithTypo).then(
      done.fail,
      done
    );
  });

  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });


});
