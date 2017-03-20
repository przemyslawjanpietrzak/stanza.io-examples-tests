"use strict";

const exec = require('child_process').exec;

module.exports =  (command, failCb) => {
  exec(command, function(error) {
    if (error) {
      failCb(error);
    }
  });
};
