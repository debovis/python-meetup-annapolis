// TODO: we don't use angularjs-dropdown-multiselect anymore.
define([
    'angular',
    'ngResource',
    'uiRouter',
    './services/index',
    './controllers/index',
    './directives/index',
    './filters/index',
    'ngFileUpload',
    'uiGrid',
    'uiBootstrapTpls',
    'ngPromiseExtras',
    'templatesCache'
], function (ng) {
    'use strict';

    return ng.module('app', [
        'app.services',
        'app.controllers',
        'app.filters',
        'app.directives',
        'ui.router',
        'ngResource',
        "ngFileUpload",
        'ui.grid',
        'ui.grid.resizeColumns',
        'ui.grid.edit',
        'ui.grid.exporter',
        'ui.grid.cellNav',
        'ui.grid.moveColumns',
        'ui.grid.grouping',
        'ui.grid.pinning',
        'ui.bootstrap',
        'ngPromiseExtras',
        'templatesCache'
    ])
    /**
     * Define Partials base URL
     */
    .constant('partialsPath', '/app/partials/')
    .constant('http_defaults', {
        timeout: 150
    })
    .config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
        // $locationProvider.html5Mode(true);

    }])

    .factory('sharedVars', function(){
        return config
    })
    .run(function($rootScope, $q, apiResources, $state, partialsPath, $timeout, $window, $stateParams, $injector, sharedVars, $http){
        $rootScope.$on('$stateChangeSuccess', function(event, toState, toParams, fromState, fromParams) {
            if (fromState === toState) {
                event.preventDefault();
            }
            var tabs = [
                    {
                        "displayName": "Listings",
                        "route": "listings"
                    }
                ]
                
            $rootScope.tabs = tabs.map( function(tab, index){
                tab.index = index
                return tab
            })
        });

    })
});





