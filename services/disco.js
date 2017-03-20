'use strict';

module.exports = function discoService(client, muc) {
  return new Promise((resolve, reject) => {
    client.getDiscoItems(muc, null, (err, message) => {
      if (err) {
        reject(err);
      } else {
        resolve(message.discoItems.items || []);
      }
    });
  });
};
