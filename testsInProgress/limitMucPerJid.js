'use strict';

const R = require('ramda');

const clientInitService = require('../services/clientInit');
const joinRoomService = require('../services/joinRoom');
const disconnectService = require('../services/disconnect');
const discoService = require('../services/disco');

const MUC_LIMIT_PER_JID = 10;

describe('Limit MUC per JID', function() {
  let clientList = [];
  let extraClient;
  const CLIENT_NAME = 'physican1';
  const MUC = 'room@conference.localhost';

  beforeEach((done) => {
    Promise.all([
      Promise.all(
        R.times(() => clientInitService(CLIENT_NAME), MUC_LIMIT_PER_JID)
      ).then((clients) => {
        clientList = clients;
      }),
      clientInitService(CLIENT_NAME)
        .then(newClient => {
          extraClient = newClient;
        }),
    ]).then(done, done.fail);
  }, 25000);

  afterEach((done) => { // disconnect all
    Promise.all(clientList.map(disconnectService)).then(done, done.fail);
  });

  it('one client should be able to join the room MUC_LIMIT_PER_JID times, next join should fail with 503 error',
  (done) => {
    const clientJoinRoomPromise = clientList.reduce(
      (prev, client, index) => prev
        .then(() => discoService(client, MUC))
        .then((clientsInRoom) => {
          expect(clientsInRoom.length).toEqual(index);
        })
        .then(() => joinRoomService(client, MUC, index))
        .then(() => discoService(client, MUC))
        .then((clientsInRoom) => {
          expect(clientsInRoom.length).toEqual(index + 1);
        }),
      Promise.resolve()
    );

    clientJoinRoomPromise
    .then(
      () => joinRoomService(extraClient, MUC, 'extra'),
      done.fail
    ).then(
      done.fail,
      (error) => {
        expect(error.code).toEqual('503');
        expect(error.type).toEqual('cancel');
        expect(error.condition).toEqual('service-unavailable');
        done();
      }
    );
  }, 22000);

  it('one client should be able to join MUC_LIMIT_PER_JID different rooms, joining to next one should fail with 503 error',
  (done) => {
    const clientJoinRoomPromise = clientList.reduce(
      (prev, client, index) => prev.then(() => joinRoomService(client, 'patient' + index + '@conference.localhost', index)),
      Promise.resolve()
    );

    clientJoinRoomPromise
    .then(
      () => joinRoomService(extraClient, 'patient' + MUC_LIMIT_PER_JID + '@conference.localhost', 'extra'),
      done.fail
    ).then(
      done.fail,
      (error) => {
        expect(error.code).toEqual('503');
        expect(error.type).toEqual('cancel');
        expect(error.condition).toEqual('service-unavailable');
        done();
      }
    );
  }, 22000);
});
