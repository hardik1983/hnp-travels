angular.module('hnpApp').controller('carsController',
  ['$scope', 'carService' , function ($scope, carService) {
    'use strict';
     var userId = 12;
    
    
    carService.retrieveAllCars(userId).
          success(function(carData){
            $scope.cars = carData;
    });
    
    }]
);