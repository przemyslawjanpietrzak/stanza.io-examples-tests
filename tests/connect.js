'use strict';
const clientInitService = require('../services/clientInit');

describe('Creatte Client and Session', function() {
  let client;

  it('Creatte Client and Session', function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client = newClient;
      })
      .then(done, done.fail);

  }, 25000);


  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });


});
