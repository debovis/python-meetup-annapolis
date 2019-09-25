/** Defines the main routes in the application.
    The routes you see here will be anchors '#/' unless specifically configured otherwise.
*/

define(['./app'], function(app) {
    'use strict';
    return app.config(function($stateProvider, $urlRouterProvider, partialsPath) {

        $urlRouterProvider

        // The `when` method says if the url is ever the 1st param, then redirect to the 2nd param
        // Here we are just setting up some convenience urls.
        // .when('/c?id', '/contacts/:id')
        // .when('/user/:id', '/contacts/:id')

        // If the url is ever invalid, e.g. '/asdf', then redirect to '/' aka the home state
        .otherwise('/');

        // $urlRouterProvider.rule(function($injector, $location) {
        //     var path = $location.path()
        //         // Note: misnomer. This returns a query object, not a search string
        //         , search = $location.search()
        //         , params
        //     ;

        //     // check to see if the path already ends in '/'
        //     if (path[path.length - 1] === '/') {
        //         return;
        //     }

        //     // If there was no search string / query params, return with a `/`
        //     if (Object.keys(search).length === 0) {
        //         return path + '/';
        //     }

        //     // Otherwise build the search string and return a `/?` prefix
        //     params = [];
        //     angular.forEach(search, function(v, k) {
        //         params.push(k + '=' + v);
        //     });
        //     return path + '/?' + params.join('&');
        // });


        $stateProvider
            .state('home', {
                url: '/', 
                templateUrl: partialsPath+'listings.html',
                controller: 'listingsCtrl'
            })
    });

});
