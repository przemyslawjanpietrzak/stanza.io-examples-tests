module.exports = function disconnect(client) {
  return new Promise((resolve) => {
    client.on('disconnected', resolve);
    client.disconnect();
  });
};
