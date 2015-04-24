var myApp = angular.module('hnpApp', ['ui.bootstrap', 'ngRoute', 'lbServices']);

myApp.config(['$httpProvider', function($httpProvider) {
        $httpProvider.defaults.useXDomain = true;
        delete $httpProvider.defaults.headers.common['X-Requested-With'];
    }
]);

myApp.config(['$locationProvider', function($locationProvider) {
       $locationProvider.html5Mode(true);
    }
]);

myApp.config(['LoopBackResourceProvider', function(LoopBackResourceProvider) {
 
    // Use a custom auth header instead of the default 'Authorization'
    //LoopBackResourceProvider.setAuthHeader('X-Access-Token');
 
    // Change the URL where to access the LoopBack REST API server
    LoopBackResourceProvider.setUrlBase('http://localhost:3000/api');
  }
]);