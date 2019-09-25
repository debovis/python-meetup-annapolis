// Require JS  Config File

require_config = {

    waitSeconds: 15,

    paths : {
        "angular" : "angular.min",
        "uiRouter" : "angular-ui-router.min",
        "domReady" : "domReady",
        "ngFileUpload": "ng-file-upload.min",
        "ngResource" : 'angular-resource',
        "uiGrid" : "ui-grid.min",
        "uiBootstrapTpls" : "ui-bootstrap-tpls.min",
        "ngPromiseExtras": "angular-promise-extras",

    },
	shim : {
        angular: {
            exports: "angular"
        }, uiRouter: {
            deps: ["angular"]
        }, "ngFileUpload": {
            deps: ["angular"]
        }, ngResource: {
            deps: ["angular"]
        }, uiGrid: {
            deps: ["angular"]
        }, uiBootstrapTpls: {
            deps: ["angular"]
        }, ngPromiseExtras: {
            deps: ["angular"]
        },templatesCache : {
            deps: ["angular"]
        }
    }, deps: [
        // kick start application... see bootstrap.js
        '../app/bootstrap'
    ], 
    baseUrl: '/lib/',
    // urlArgs: "bust=" + (new Date()).getTime()
};

if (typeof define !== 'function') {
  // to be able to require file from node
  // This allows us to use define('app/main.js') and return the config object
  console.log("Running from r.js and nodejs")
  module.exports = require_config;
} 



