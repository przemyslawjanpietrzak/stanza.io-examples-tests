var XMPP = require('stanza.io');

module.exports = function(jidName, resource) { // resource is optional

  return new Promise((resolve) => {
    const client = XMPP.createClient({
      jid: `${jidName}@localhost`,
      password: 'wiatrak',
      transports: 'websocket',
      wsURL: `ws://${ process.argv[2] || 'localhost' }:5280/websocket`,
      resource,
    });

    client.on('session:started', () => { // imortant as fuck
      client.updateCaps();
      client.sendPresence({
        caps: client.disco.caps
      });

      resolve(client);
    });

    client.connect();


  });
};
