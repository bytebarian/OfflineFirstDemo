(function() {

	angular
		.module('app', ['pouchdb'])
		.config(['$mdThemingProvider', '$httpProvider', configure]);
    angular.service('service', function(pouchDB) {
      var db = pouchDB('name');
    });

	function configure($mdThemingProvider, $httpProvider) {
	    // Configure a dark theme with primary foreground yellow
	    $mdThemingProvider
	    	.theme('docs-dark', 'default')
	    	.primaryPalette('yellow')
	    	.dark()
    		.foregroundPalette['3'] = 'yellow';

        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
	}

})();
