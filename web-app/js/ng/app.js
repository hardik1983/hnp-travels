var myApp = angular.module('hnpApp', ['ui.bootstrap']);

myApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

myApp.config(['$locationProvider', function($locationProvider) {
       $locationProvider.html5Mode(true);
    }
]);