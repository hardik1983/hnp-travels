angular.module('hnpApp').controller('newBookingController',
  ['$scope', '$http', 'bookingService', 'utilityService' , function ($scope, $http, bookingService, utilityService) {
    'use strict';
    
    //Initialize the Screen
    
    var userId = 12; 
   var today = new Date();
   $scope.popularDestination = [
      'Ahmedabad',
      'Surat',
      'Vadodara',
      'Rajkot',
      'Bhavnagar',
      'Jamnagar',
      'Junagadh',
      'Gandhinagar',
      'Mahesana',
      'Morbi',
      'Surendranagar',
      'Gandhidham',
      'Veraval',
      'Navsari',
      'Bharuch',
      'Anand',
      'Porbandar',
      'Godhra',
      'Botad',
      'Sidhpur'
    ];
    
    var newBooking = {};
    newBooking.pickupAddress = '';
    //newBooking.pickupDate = utilityService.formatDate(today);
    newBooking.pickupDate = today;
    newBooking.destination = '';
    //newBooking.dropOffDate = utilityService.formatDate(today);
    newBooking.dropOffDate = today;
    newBooking.carId = 1;
    $scope.newBooking = newBooking;
    
    
    
    //Functions
    
    $scope.suggestDestination = function(){
      $('#inp-destination').autocomplete({
        source: $scope.popularDestination
      });
    };
    
    
    $scope.book = function(){
      $scope.message = 'Please wait...';
      var dod = utilityService.formatDate($scope.newBooking.pickupDate);
      var pickupDateInt = dod.replace(/-/g, "");
      dod = utilityService.formatDate($scope.newBooking.dropOffDate);
      var dropoffDateInt = dod.replace(/-/g, "");
      
      bookingService.createNewBooking(userId, $scope.newBooking.carId, $scope.newBooking.pickupAddress, $scope.newBooking.destination, pickupDateInt, dropoffDateInt).
        success(function(response){
            $scope.message = 'New Booking Created Successfully';
            $scope.newBooking.pickupAddress = '';
            $scope.newBooking.destination = '';
            $scope.newBooking.pickupDate = utilityService.formatDate(today);
            $scope.newBooking.dropOffDate = utilityService.formatDate(today);
            
       }).
        error(function(data, status, headers, config){
            if(status == 406){
               $scope.message = 'Car already booked for these dates. Please select new date.';
            }
            else{
              $scope.message = 'Error Occurred while creating new booking';
            }
        });
    
    };
    
    
    }]
);