angular.module('hnpApp').service('userService', function($http) {
  
  // Define and Initialize the Data Elements
    
    //Define
    //var apiURL = 'http://localhost:9086/wsw/hnp/resources/';
    var apiURL = 'http://localhost:3000/api/';
    var resourceURL = apiURL + 'user/';
    
    // Get User Details
    this.getUserDetails = function(userId){
      var userInfo = '';
      return $http.get(resourceURL + userId).
            success(function(data){
               userInfo=data;
            });
    };
    
    
});