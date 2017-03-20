"use strict";

module.exports = function sendNMessagesService(clientAddressee, clientSender, messageCount) {
  // send message from client2 to client
  // when arrived send another
  // repeat N times
  return new Promise(function(resolve) {
    let counterRecived = 0;
    clientAddressee.on('chat', (message) => {
      if (!message.delay && !message.mamItem && message.from.bare === clientSender.jid.bare) {
        if (++counterRecived >= messageCount) {
          resolve();
        } else {
          clientSender.sendMessage({
            to: clientAddressee.jid.bare,
            body: String(counterRecived),
            type: 'chat'
          });
        }
      }
    });

    clientSender.sendMessage({
      to: clientAddressee.jid.bare,
      body: String(counterRecived),
      type: 'chat'
    });
  });
};
