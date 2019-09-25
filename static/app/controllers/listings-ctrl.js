define(['./module'], function (controllers) {
    'use strict';
    controllers.controller('listingsCtrl', ['$scope', 'apiResources', '$rootScope', '$q', 'sharedVars', '$state',
        'Upload', 'flash',
        function( $scope, apiResources, $rootScope, $q, sharedVars, $state, Upload, flash) {
            $scope.listings = []

            apiResources.boats.get().$promise.then(function(boats_results){

                $scope.boats = {}
                angular.forEach(boats_results.response, function(boat){
                    $scope.boats[boat._source.boat] = boat._source.keywords.map(function(w){
                        return w.word
                    })
                })

                apiResources.listings.get().$promise.then(function(results){
                    $scope.listings = results.response.map(function(d){
                        d._source.source = d._source.source.replace('\n','</br>')
                        d._source.source = d._source.source.split(' ').map(function(w){
                            console.log(w, $scope.boats[d._source.boat])
                            if(angular.isDefined($scope.boats[d._source.boat]) && $scope.boats[d._source.boat].indexOf(w.toLowerCase()) > -1 ){
                                return `<span style="background-color:yellow">${w}</span>`
                            } else {
                                return w
                            }
                        }).join(' ')
                        return d
                    })
                })
            })
        }
    ])
})