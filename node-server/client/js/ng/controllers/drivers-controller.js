angular.module('hnpApp').controller('driversController',
  ['$scope', 'driverService', 'User' , function ($scope, driverService, myUser) {
    'use strict';
    myUser.getCurrent(function(data, status){
       myUser.drivers({ id: data.id}, function(driverData, status){
            $scope.drivers = driverData;
        });
    });  
  }]
);