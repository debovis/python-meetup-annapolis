define(['./module'], function (directives) {
    'use strict';
    directives.directive('validate-required-cell', ['uiGridEditConstants', function (uiGridEditConstants) {
        return {
            restrict: 'A',
            scope: false,
            require: 'ngModel',
            link: function (scope, element, attrs, ngModel) {
                element.bind('blur', function(evt) {
                  if (scope.inputForm && !scope.inputForm.$valid) {
                    // Stops the rest of the event handlers from being executed
                    evt.stopImmediatePropagation();
                  }
                })
            }
        }
    }]);
});