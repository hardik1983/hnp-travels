angular.module('hnpApp').service('driverService', function($http) {
  'use strict';
  
  //Define
  //var apiURL = 'http://49.40.32.176:9086/wsw/hnp/resources/';
  var apiURL = 'http://localhost:3000/api/';
  var resourceURL = apiURL + 'driver/';

  this.retrieveAllDrivers = function(userId){
     var actualURL = resourceURL + '?userId=' + userId;
     return $http.get(actualURL);
  };
});