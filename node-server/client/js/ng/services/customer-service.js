angular.module('hnpApp').service('customerService', function($http, $q) {
  'use strict';

  //Define
  var apiURL = 'http://49.40.32.176:9086/wsw/hnp/resources/';
  var resourceURL = apiURL + 'customer/';
  
  
  this.getCustomerFromID = function(customerId){
       var actualURL = resourceURL + customerId;
       return $http.get(actualURL);
  };
  
});