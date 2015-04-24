angular.module('hnpApp').controller('userController',
  ['$scope', '$http', 'userService', 'MyUser' , function ($scope, $http, userService, myUser) {
    'use strict';
    
    // Call Service to retrieve User details for userId = 12
    userService.getUserDetails(12).success(function(userInfo){
        $scope.user = userInfo;
    });
     
  }]
);