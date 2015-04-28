angular.module('hnpApp').controller('carsController',
  ['$scope', 'carService', 'User' , function ($scope, carService, myUser) {
    'use strict';
     myUser.getCurrent(function(data, status){
        myUser.cars({ id: data.id}, function(carData, status){
            $scope.cars = carData;   
        });
          
    });
  }]
);