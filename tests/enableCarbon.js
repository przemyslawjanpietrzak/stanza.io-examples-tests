'use strict';
const clientInitService = require('../services/clientInit');

describe('Enable carbons', function() {
  let client;

  beforeEach(function(done) {
    clientInitService('physican1')
      .then(newClient => {
        client = newClient;
      })
      .then(done, done.fail);
  });

  it('enable carbons action should NOT raise any errors', (done) => {
    client.enableCarbons((err) => {
      if (err) {
        done.fail('enable carbons error');
      } else {
        done();
      }
    });
  }, 10000);


  afterEach((done) => {
    client.on('disconnected', () => {
      done();
    });
    client.disconnect();
  });

});
