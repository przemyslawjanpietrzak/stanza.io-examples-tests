'use strict';
const R = require('ramda');

const clientInitService = require('../services/clientInit');
const joinRoomService = require('../services/joinRoom');
const disconnectService = require('../services/disconnect');

describe('Disco Items', function() {
  let clientList = [];
  const clientsCount = 10;
  const muc = 'room@conference.localhost';

  beforeEach((done) => {
    Promise.all(
      R.times(() => clientInitService('physican1'), clientsCount)
    ).then((clients) => {
      clientList = clients;
    }).then(done, done.fail);
  }, 25000);

  it('Client should be able to ask about some room and get info who is in this room', (done) => {
    Promise.all(clientList.map(client =>
      joinRoomService(client, muc)
    )).then(() => {
      clientList[0].getDiscoItems(muc, null, (error, message) => {
        if (error) {
          done.fail();
        }

        const discoItems = message.discoItems.items;
        expect(discoItems).toBeDefined();
        expect(discoItems).toEqual(jasmine.any(Array));
        expect(discoItems.length).toEqual(10);
        discoItems.forEach((item) => {
          expect(item.name).toEqual('physican1');
          expect(item.jid.unescapedFull)
            .toEqual('room@conference.localhost/physican1');
          expect(item.jid.bare).toEqual('room@conference.localhost');
          expect(item.jid.full)
            .toEqual('room@conference.localhost/physican1');
          expect(item.jid.resource).toEqual('physican1');
        });

        done();
      });
    },
    done.fail);
  });

  afterEach((done) => { // disconnect all
    Promise.all(
      clientList.map(disconnectService)
    ).then(done, done.fail);
  });

});
