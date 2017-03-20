'use strict';

const clientInitService = require('../services/clientInit');
const disconnectService = require('../services/disconnect');

describe('Create Client and Session', () => {
  const someExampleResource = 'MY_BEAUTIFUL_RESOURCE';
  let client;

  beforeEach((done) => {
    clientInitService('physican1', someExampleResource)
      .then(newClient => {
        client = newClient;
      })
      .then(done, done.fail);
  }, 25000);

  afterEach((done) => {
    disconnectService(client).then(done, done.fail);
  });

  it('Should be able to create client with exact resource value', () => {
    expect(client.jid.resource).toEqual(someExampleResource);
  });
});
