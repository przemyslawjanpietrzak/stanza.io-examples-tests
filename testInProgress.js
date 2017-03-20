var Jasmine = require('jasmine');
var jasmine = new Jasmine();

jasmine.loadConfig({
  "spec_dir": "spec",
  "spec_files": [
    "../testsInProgress/**/*.js"
  ],
  "helpers": [
    "helpers/**/*.js",
    "../node_modules/jasmine-expect/index.js",
    "../node_modules/jasmine-es6/lib/install.js"
  ],
  "stopSpecOnExpectationFailure": false,
  "random": false
});
jasmine.execute();
