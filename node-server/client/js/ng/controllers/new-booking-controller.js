angular.module('hnpApp').controller('newBookingController',
  ['$scope', '$http', 'User', 'utilityService', 'Event' , function ($scope, $http, myUser, utilityService, myEvent) {
    'use strict';
    
    //Initialize the Screen
    
    var userId = ''; 
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
    newBooking.dropingOffDate = today;
    newBooking.carId = 1;
    $scope.newBooking = newBooking;
    
    //Functions
    
    $scope.suggestDestination = function(){
      $('#inp-destination').autocomplete({
        source: $scope.popularDestination
      });
    };
    
    var showError = function(error){
      if(error.data != null && error.data !== undefined 
          && error.data.error != null && error.data.error !== undefined
          && error.data.error.sqlState == '12000'){
      
          $scope.message = 'Car already booked for these dates. Please select new date.';
      } else {
          $scope.message = 'Internal Error Occurred while creating a booking.';
      }
    };
    
    
    $scope.book = function(){
      $scope.message = 'Please wait...';
      var dod = utilityService.formatDate($scope.newBooking.pickupDate);
      var pickupDateInt = dod.replace(/-/g, "");
      dod = utilityService.formatDate($scope.newBooking.dropingOffDate);
      var dropoffDateInt = dod.replace(/-/g, "");

      
      if(userId != ''){
          $scope.newBooking.userId = userId;
          $scope.newBooking.eventDate = pickupDateInt;
          $scope.newBooking.dropOffDate = dropoffDateInt;
          
          myEvent.create($scope.newBooking, function(createdEvent, status){
              $scope.message = 'New Booking Created Successfully';
              $scope.newBooking.pickupAddress = '';
              $scope.newBooking.destination = '';
          }, function (status){
              showError(status);
          });          
      } else {
          myUser.getCurrent(function(data, status){
              userId = data.id;
              $scope.newBooking.userId = data.id;
              $scope.newBooking.eventDate = pickupDateInt;
              $scope.newBooking.dropOffDate = dropoffDateInt;
              
              myEvent.create($scope.newBooking, function(createdEvent, status){
                  $scope.message = 'New Booking Created Successfully';
                  $scope.newBooking.pickupAddress = '';
                  $scope.newBooking.destination = '';
              }, function (status){
                  showError(status);
              });
          }, function (status){
              $scope.message = 'Error Occurred while creating new booking';
          });
      }
    };
    
    
    }]
);