angular.module('hnpApp').service('carService', function($http) {
  'use strict';

  //Define
  //var apiURL = 'http://49.40.32.176:9086/wsw/hnp/resources/';
  var apiURL = 'http://49.40.32.176:3000/api/';
  var resourceURL = apiURL + 'car/';
  

  this.retrieveAllCars = function(userId){
     var actualURL = resourceURL + '?userId=' + userId;
     return $http.get(actualURL);
  };
  
});