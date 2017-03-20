module.exports = function(client, roomName, id) {
  return new Promise((resolve, reject) => {
    client.on('muc:join', (msg) => {
      // why? we have test when we join 10 rooms synchronously, so this service will create 10 handlers on muc:join event
      if (roomName === msg.from.bare) {
        resolve();
      }
    });
    client.on('muc:error', (msg) => {
      reject(msg.error);
    });
    
    client.joinRoom(roomName, client.jid.local);
  });
};
