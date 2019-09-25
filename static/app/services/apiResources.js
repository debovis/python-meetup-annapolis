
define(['./module'], function (services) {
    'use strict';

    services.factory('apiResources', [ '$resource', '$log', '$http', '$rootScope', 'sharedVars', 
        function($resource, $log, $http, $rootScope, sharedVars) {

        var transformResponse = function(data, headers) {
            // console.log('In transformResponse(), data =', data);
            // console.log('In transformResponse(), headers =', headers);

            var ret = angular.fromJson(data)


            // dates are in appTables.dateFields


            // Successfully caught error on server
            // We want to make sure all of our responses have a status indicator ???
            if ( !ret  ||  !angular.isObject(ret) ) {
                flash.pop({
                    type:'error',
                    body: 'Something went wrong. You should reload your browser.'
                });
            }
            return ret
        }

        var headers = {
                "Content-Type" :   "application/json"
            },
            httpTypes = {
                'get'       : { method : 'GET',    headers : headers, transformResponse: transformResponse },
                'put'       : { method : 'PUT',    headers : headers },
                'post'      : { method : 'POST',   headers : headers },
                'delete'    : { method : 'DELETE', headers : headers },
            } ;

        return {
            listings:                       $resource('/listings',{},httpTypes),
            boats:                       $resource('/boats',{},httpTypes),
        }
    }])

});
