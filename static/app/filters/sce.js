define(['./module'], function (filters) {
	'use strict';

	return filters.filter('sce', function($sce) {
		return $sce.trustAsHtml;
	});
});

