"use strict";
const settings = require('./settings');

module.exports = function roleListPlugin(client, stanzas) {

  const types = stanzas.utils;

  let Payload = stanzas.define({
    name: 'payload',
    element: 'payload',
    namespace: 'clinwork',
    fields: {
      clintype: types.attribute('clintype'),
      value: types.text()
    }
  });

  stanzas.withMessage(function (Message) {
    stanzas.extend(Message, Payload);
  });

  client.on('message', (msg) => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_RULE_LIST_RESPONSE) {
      client.emit('payload:ruleList', msg);
    }
  });

  client.on('message', (msg) => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_OPENED_TODO_LIST_RESPONSE) {
      client.emit('payload:openedTaskList', msg);
    }
  });

  client.on('message', msg => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_OPEN_QUERY_NOTIFICATION) {
      client.emit('payload:openQuery', msg);
    }
  });

  client.on('message', msg => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_CLOSED_QUERY_NOTIFICATION) {
      client.emit('payload:closeQuery', msg);
    }
  });

  client.on('message', msg => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_PROCEDURE_DEFINITION_RESPONSE) {
      client.emit('payload:procedureDefinition', msg);
    }
  });

  client.on('message', msg => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_VISIT_LIST_RESPONSE) {
      client.emit('payload:visitList', msg);
    }
  });

  client.on('message', msg => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_OPEN_VISIT_NOTIFICATION) {
      client.emit('payload:openVisit', msg);
    }
  });

  client.on('message', msg => {
    if (!msg.delay && msg.payload && msg.payload.clintype === settings.CLINTYPE_CLOSE_VISIT_NOTIFICATION) {
      client.emit('payload:closeVisit', msg);
    }
  });

};
