angular.module('hnpApp').controller('newBookingController',
  ['$scope', '$http', 'User', 'utilityService', 'Event' , function ($scope, $http, myUser, utilityService, myEvent) {
    'use strict';
    
    //Initialize the Screen
    var userId = ''; 
    var today = new Date();
    var newBooking = {};
    newBooking.pickupAddress = '';
    newBooking.pickupDate = today;
    newBooking.destination = '';
    newBooking.dropingOffDate = today;
    newBooking.carId = 1;
    $scope.newBooking = newBooking;
    
    var pickupAuto = new google.maps.places.Autocomplete(
        (document.getElementById('inp-pickup-address')),
        { types: ['geocode'] }
    );
    var destinationAuto = new google.maps.places.Autocomplete(
        (document.getElementById('inp-destination')),
        { types: ['geocode'] }
    );
    google.maps.event.addListener(pickupAuto, 'place_changed', function() {
        $scope.newBooking.pickupAddress = pickupAuto.getPlace().formatted_address;
        $scope.newBooking.lastKnownLocation = pickupAuto.getPlace().geometry.location.lat() + ',' + pickupAuto.getPlace().geometry.location.lng();
    });
    google.maps.event.addListener(destinationAuto, 'place_changed', function() {
        $scope.newBooking.destination = destinationAuto.getPlace().formatted_address;
    });
    
    $scope.geolocate = function() {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(function(position) {
          var geolocation = new google.maps.LatLng(
              position.coords.latitude, position.coords.longitude);
          var circle = new google.maps.Circle({
            center: geolocation,
            radius: position.coords.accuracy
          });
          autocomplete.setBounds(circle.getBounds());
        });
      }
    };
    
    //Functions
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
          console.log($scope.newBooking);
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
              console.log($scope.newBooking);
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