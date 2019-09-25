
define(['./module'], function (filters) {
	'use strict';

	return filters.filter('capitalize', function() {
		return function(str, noParamsNeeded) {
			if (!str)
				return '';
			else
				return str.replace(/\w\S*/g, function(txt) {return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
		}
	});
});

