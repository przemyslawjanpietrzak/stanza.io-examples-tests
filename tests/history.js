'use strict';

const clientInitService = require('../services/clientInit');
const sendNMessagesService = require('../services/sendNMessages');

describe('Mam XEP history', function() {
  let client1;
  let client2;


  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client1 = newClient;
      })
      .then(done, done.fail);
  }, 10000);

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client2 = newClient;
      })
      .then(done, done.fail);
  }, 10000);


  beforeEach(function(done) {
    sendNMessagesService(client1, client2, 50).then(done, done.fail);
  }, 10000);

  afterEach((done) => {
    client2.on('disconnected', () => {
      done();
    });
    client1.on('disconnected', () => {
      client2.disconnect();
    });
    client1.disconnect();
  });

  it('Client1 should to be able ask for last messages with client2', (done) => {
    client1.on('mam:result:*', (queyrId, mamResult) => {
      const result = [ '45', '45', '46', '46', '47', '47', '48', '48', '49', '49' ]; // messages are double (send and received), id the same in pairs

      const messages = mamResult.mamResult.items;
      expect(mamResult.mamResult.items.length).toEqual(10);
      messages.forEach((mamItem) => {
        const message = mamItem.forwarded.message;
        expect(Object.keys(mamItem)).toContain('id');
        expect(mamItem.id).toEqual(jasmine.any(String));
        expect(Object.keys(message)).toContain('from');
        expect(message.from.bare).toEqual(client2.jid.bare);
        expect(Object.keys(message)).toContain('body');
        expect(message.body).toEqual(jasmine.any(String));
        expect(result).toContain(message.body);
      });
      expect(messages).toEqual(jasmine.any(Array));
      done();

    });
    client1.searchHistory({
      with: client2.jid.bare,
      rsm: { max: 10, before: true },
      complete: false,
    });
  }, 6500);

  it('Client should to be able ask for last messages with client2, and after that ask for 10 more ... and more more more ', (done) => {
    let counter = 0;
    const results = [ // messages are double (send and received), id the same in pairs
      [ '45', '45', '46', '46', '47', '47', '48', '48', '49', '49' ],
      [ '39', '40', '41', '41', '42', '42', '43', '43', '44', '44' ],
      [ '35', '35', '36', '36', '37', '37', '38', '39', '38', '40' ],
      [ '30', '30', '31', '31', '32', '32', '33', '33', '34', '34' ],
      [ '25', '25', '26', '26', '27', '27', '28', '28', '29', '29' ],
      [ '20', '20', '21', '21', '22', '22', '23', '23', '24', '24' ],
      [ '15', '15', '16', '16', '17', '17', '18', '19', '18', '19' ],
      [ '10', '10', '11', '11', '12', '12', '13', '13', '14', '14' ],
    ];

    client1.on('mam:result:*', (queyrId, mamResult) => {

      const messages = mamResult.mamResult.items;
      const ids = messages.map(mamItem => mamItem.id);
      const firstId = ids[0];

      messages.forEach((mamItem) => {
        const message = mamItem.forwarded.message;
        expect(Object.keys(mamItem)).toContain('id');
        expect(mamItem.id).toEqual(jasmine.any(String));
        expect(Object.keys(message)).toContain('from');
        expect(message.from.bare).toEqual(client2.jid.bare);
        expect(Object.keys(message)).toContain('body');
        expect(message.body).toEqual(jasmine.any(String));
        expect(results[counter]).toContain(message.body); // order can be mixed: send and recived message could be switched
      });
      expect(messages).toEqual(jasmine.any(Array));
      expect(messages.length).toEqual(10);
      if (++counter === results.length) {
        done();
      }

      client1.searchHistory({
        with: client2.jid.bare,
        rsm: { max: 10, before: firstId, }, // XEP 0313 http://xmpp.org/extensions/xep-0313.html#query
        complete: false,
      });

    });
    client1.searchHistory({ // init
      with: client2.jid.bare,
      rsm: { max: 10, before: true },
      complete: false,
    });
  }, 10000);

});
