define(['./module'], function (services) {
    'use strict';

    services.factory("flash", function($rootScope) {
        var queue = [], currentMessage = {};
        
        $rootScope.$on('$stateChangeSuccess', function() {
          if (queue.length > 0) 
            currentMessage = queue.shift();
          else
            currentMessage = {};
        });
        
        return {
          set: function(message) {
            var msg = message;
            queue.push(msg);
          },
          get: function() {
            return currentMessage;
          },
          pop: function(message) {
            switch(message.type) {
              case 'success':
                toastr.success(message.body, message.title);
                break;
              case 'info':
                toastr.info(message.body, message.title);
                break;
              case 'warning':
                toastr.warning(message.body, message.title);
                break;
              case 'error':
                toastr.error(message.body, message.title);
                break;
            }
          }
        };
      });
});