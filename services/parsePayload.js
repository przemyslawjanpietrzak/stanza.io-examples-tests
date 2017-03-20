module.exports = (payloadJSON) => {
  return JSON.parse(
    payloadJSON
      .value
      .replace(/^<!\[CDATA\[/, '')
      .replace(/\]\]>$/, '')
  );
};
