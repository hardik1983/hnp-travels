angular.module('hnpApp').controller('driversController',
  ['$scope', 'driverService' , function ($scope, driverService) {
    'use strict';
    
    var userId=12;
    
    driverService.retrieveAllDrivers(userId).
          success(function(driverData){
            $scope.drivers = driverData;        
    });
    
    }]
);