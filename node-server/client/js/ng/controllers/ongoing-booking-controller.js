angular.module('hnpApp').controller('ongoingBookingController',
  ['$scope', '$http', '$modal', '$location', 'bookingService', 'utilityService', 'driverService', 'carService', function ($scope, $http, $modal, $location, bookingService, utilityService, driverService, carService) {
    'use strict';
    var allBookings = [];
    var userId = 12;
    var today = new Date();
    var currentDate = utilityService.formatDate(today);
    
    var drivers = {};
    var cars = {};
    var bookings = {};
    var eventList = [];
     
    var convertTime = function(input){
      var nullTime = '--:--';
      if(input == nullTime || input.length > 5 || input.length < 3 || input.match(/:/g) == ''){
        return 0;
      }
      input = input.replace(/:/g, "");
      return parseInt(input); 
    };    
    
    
    $scope.currentDate = currentDate;
    $scope.bookings = allBookings;
    $scope.drivers = drivers;
    $scope.cars = cars;
    

    
    bookingService.retrieveAllBooking(userId).
      success(function(data){
        $('#calendar').fullCalendar('removeEventSource', eventList);
        var todayInt = parseInt(currentDate.replace(/-/g,'')); 
        for(var i=0; i<data.length; i++){
        
            if(data[i].lastKnownLocation != 'null'){
               //data[i].estimatedTime = calculateEstimatedTime(data[i].lastKnownLocation, data[i].destination, data[i].id);
               if ( data[i].dropOffTime != 0){
                data[i].status = 'Complete';
               } else if(data[i].destination1Time != 0 || data[i].destination2Time != 0){
                  data[i].status = 'Returning';
               } else if (data[i].eventTime != 0) {
                  data[i].status = 'Onwards';
               } else {
                  data[i].status = 'Scheduled';
               }
               
            } else {
              data[i].lastKnownLocation = "Unknown";
              data[i].estimatedTime = "Cannot Calculate";
              data[i].status = "Scheduled";
            } 
            
            var remain = utilityService.daysRemaining(data[i].eventDate);
            if( remain >= 0){
              data[i].daysRemaining = remain + ' Days';
            } else {
              data[i].daysRemaining = 'Expired';
            }
             
            data[i].eventTime = utilityService.formatTime(data[i].eventTime);
            data[i].destination1Time = utilityService.formatTime(data[i].destination1Time);
            data[i].destination2Time = utilityService.formatTime(data[i].destination2Time);
            data[i].dropOffTime = utilityService.formatTime(data[i].dropOffTime);     
            
            if(data[i].eventTime != '--:--'){
              data[i].elapsedTime = utilityService.getElapsedTime(data[i].eventDate, data[i].eventTime); 
            }
            
            
            
            bookings[data[i].id] = data[i]; 
            
            //Populate Event
            eventList[i] = {};
            eventList[i].id = data[i].id;
            eventList[i].title = data[i].destination;
            eventList[i].allDay = true;
            eventList[i].start = utilityService.formatDateString(data[i].eventDate);
            eventList[i].end = utilityService.formatDateStringEnd(data[i].dropOffDate);
            eventList[i].editable = true;
            if(data[i].customerFirstName == null){
              eventList[i].description = data[i].pickupAddress + ' to ' + data[i].destination;            
            } else {
              eventList[i].description = data[i].pickupAddress + ' to ' + data[i].destination + '<br />' + data[i].customerFirstName;
            }
            
            
            var endInt = parseInt((data[i].dropOffDate + '').replace(/-/g,''));
            if(endInt < todayInt){
              eventList[i].className = ['btn-skin', 'btn-default', 'inactive', 'event-item-expired'];
            }
            else{
              eventList[i].className = ['btn-skin', 'btn-default', 'btn-lg', 'event-item'];
            }
            //eventList[i].line2 = cars[data[i].carId].registrationNumber;
            //eventList[i].id = data[i].id;
            //eventList[i].id = data[i].id;
            //eventList[i].id = data[i].id;
            //eventList[i].id = data[i].id;
        }
        $scope.bookings = bookings;
         driverService.retrieveAllDrivers(userId).
          success(function(driverData){
            for(var i=0; i<driverData.length; i++){
               drivers[driverData[i].id] = driverData[i];
            }
            
        });
        
        carService.retrieveAllCars(userId).
          success(function(carData){
            for(var i=0; i<carData.length; i++){
               cars[carData[i].id] = carData[i];
            }
          console.log(cars);       
        });
        
        
        
        
        $('#calendar').fullCalendar('addEventSource', eventList);
        
      });
     
    $scope.pickedUp = function(id){
        console.log('Picked Up customer for event ' + id);
        var currTime = new Date();
        var hrs = currTime.getHours();
        var mins = currTime.getMinutes();
        if(hrs < 10){hrs = '0' + hrs;}
        hrs = hrs + '';
        if(mins < 10){mins = '0' + mins;}
        mins = mins + '';

        bookings[id].eventTime = hrs + ':' + mins;
        var ub = bookings[id];
        ub.eventTime = convertTime(ub.eventTime);
        ub.destination1Time = convertTime(ub.destination1Time);
        ub.destination2Time = convertTime(ub.destination2Time);
        ub.dropOffTime = convertTime(ub.dropOffTime);
        if ( ub.dropOffTime != 0){
          ub.status = 'Complete';
         } else if(ub.destination1Time != 0 || ub.destination2Time != 0){
            ub.status = 'Returning';
         } else if (ub.eventTime != 0) {
            ub.status = 'Onwards';
         } else {
            ub.status = 'Scheduled';
         }
        bookingService.updateBooking(ub).success(function(updatedData){
          $scope.bookings[id].eventTime = hrs + ':' + mins;
          $scope.bookings[id].status = ub.status;
        });
    };
    
    $scope.atDestination = function(id){
        console.log('Customer at destination for event ' + id);
        var currTime = new Date();
        var hrs = currTime.getHours();
        var mins = currTime.getMinutes();
        if(hrs < 10){hrs = '0' + hrs;}
        hrs = hrs + '';
        if(mins < 10){mins = '0' + mins;}
        mins = mins + '';
        
        bookings[id].destination1Time = hrs + ':' + mins;
        var ub = bookings[id];
        ub.eventTime = convertTime(ub.eventTime);
        ub.destination1Time = convertTime(ub.destination1Time);
        ub.destination2Time = convertTime(ub.destination2Time);
        ub.dropOffTime = convertTime(ub.dropOffTime);
        if ( ub.dropOffTime != 0){
          ub.status = 'Complete';
         } else if(ub.destination1Time != 0 || ub.destination2Time != 0){
            ub.status = 'Returning';
         } else if (ub.eventTime != 0) {
            ub.status = 'Onwards';
         } else {
            ub.status = 'Scheduled';
         }
        bookingService.updateBooking(ub).success(function(updatedData){
          $scope.bookings[id].destination1Time = hrs + ':' + mins;
          $scope.bookings[id].status = ub.status;
        });
    };
    
    $scope.droppedOff = function(id){
        console.log('Dropped Off customer for event ' + id);
        var currTime = new Date();
        var hrs = currTime.getHours();
        var mins = currTime.getMinutes();
        if(hrs < 10){hrs = '0' + hrs;}
        hrs = hrs + '';
        if(mins < 10){mins = '0' + mins;}
        mins = mins + '';
        
        bookings[id].dropOffTime = hrs + ':' + mins;
        var ub = bookings[id];
        ub.eventTime = convertTime(ub.eventTime);
        ub.destination1Time = convertTime(ub.destination1Time);
        ub.destination2Time = convertTime(ub.destination2Time);
        ub.dropOffTime = convertTime(ub.dropOffTime);

        if ( ub.dropOffTime != 0){
          ub.status = 'Complete';
         } else if(ub.destination1Time != 0 || ub.destination2Time != 0){
            ub.status = 'Returning';
         } else if (ub.eventTime != 0) {
            ub.status = 'Onwards';
         } else {
            ub.status = 'Scheduled';
         }
        bookingService.updateBooking(ub).success(function(updatedData){
          $scope.bookings[id].dropOffTime = hrs + ':' + mins;
          $scope.bookings[id].status = ub.status;
        });
    };
    
    $scope.ddClick = function(index){
      $('#ongng-dropdown' + index).toggle();
      var res;
      if(bookings[index].lastKnownLocation != 'Unknown'){
        res = bookings[index].lastKnownLocation.split(',');
      }
      else{
        res = [];
        res[0] = '42.986058';
        res[1] = '-81.242596';
      } 
      var latlng = new google.maps.LatLng(res[0], res[1]);
      
      // prepare the map properties
      var options = {
            zoom: 15,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            mapTypeControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true
      };

      // initialize the map object
      var map = new google.maps.Map(document.getElementById('google_map' + index), options);
      var directionsDisplay = new google.maps.DirectionsRenderer();
      directionsDisplay.setMap(map);
      
      // add Marker
      var marker1 = new google.maps.Marker({
        position: latlng, map: map
      });
      // add listener for a click on the pin
      google.maps.event.addListener(marker1, 'click', function() {
        infowindow.open(map, marker1);
      });
      // add information window
      var infowindow = new google.maps.InfoWindow({
        content:  '<div class="info"><strong>' + cars[bookings[index].carId].registrationNumber + '</strong><br><br>Last known location at<br></div>'
      });
      
      var currEstimated = $('#ongng-trckr-estimated' + index).text(); 
      //if(currEstimated == 'Cannot Calculate.' || currEstimated == ' Estimated.'){
          calculateEstimatedTime(bookings[index].lastKnownLocation, bookings[index].destination, index, directionsDisplay);
      //}
      
      findLocationName(bookings[index].lastKnownLocation, index);
      
    };
    
    var calculateEstimatedTime = function (latlong, destination, bookingId, dirDisp){
        var res = latlong.split(',');
        var origin = new google.maps.LatLng(res[0], res[1]);
        destination = destination;
        
        var service = new google.maps.DistanceMatrixService();
        var directionsService = new google.maps.DirectionsService();
        var request = {
            origins: [origin],
            destinations: [destination],
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
          };
        service.getDistanceMatrix(request, callback);
        
        directionsService.route({
            origin: origin,
            destination: destination,
            travelMode: google.maps.TravelMode.DRIVING,
            unitSystem: google.maps.UnitSystem.METRIC,
            avoidHighways: false,
            avoidTolls: false
          }, function(result, status) {
          if (status == google.maps.DirectionsStatus.OK) {
            dirDisp.setDirections(result);
          }
        });
        
        function callback(response, status) {
            if (status == google.maps.DistanceMatrixStatus.OK) {
              var results = response.rows[0].elements[0];
              //bookings[bookingId].estimatedTime = results.duration.text;
              $scope.bookings[bookingId].estimatedTime = results.duration.text;
              $('#ongng-trckr-estimated' + bookingId).text(results.duration.text + ' Estimated.');
            }
            else {
              $('#ongng-trckr-estimated' + bookingId).text(results.duration.text + 'Cannot Calculate.');
            }
        }
        
        
    };
    
    var findLocationName = function (latlong, index){
        var geocoder = new google.maps.Geocoder();
         
        geocoder.geocode({'address': latlong}, function(results, status) {
          if (status == google.maps.GeocoderStatus.OK) {
            $('#ongng-car-loc' + index).text(results[0].formatted_address);
          } 
        });
    
    };
    
    
    //Upcoming Bookings Section
    
    
    $('#calendar').fullCalendar({
        dayClick: function() {
          
        },
        eventClick: function(event, element) {
            $scope.showEditModal(event.id, event);
        },
        eventRender: function(event, element) { 
            element.find('.fc-title').append("<br/><div class='event-desc value'>" + event.description + "</div>"); 
        } 
    });
    
    $scope.showEditModal = function(eventId, event){
        $scope.opts = {
            backdrop: true,                         
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : '/editBookingContent.html',
            controller : 'EditBookingController',
            size: 'lg',
            resolve: {} // empty storage
        };

        $scope.opts.resolve.bookings = function() {
            return angular.copy({
              booking: $scope.bookings[eventId]
            }); // pass name to Dialog
        };
        
        $scope.opts.resolve.cars = function() {
            return angular.copy({
              cars: $scope.cars
            }); // pass name to Dialog
        };    
        
        $scope.opts.resolve.drivers = function() {
            return angular.copy({
              drivers: $scope.drivers
            }); // pass name to Dialog
        };
        
        var modalInstance = $modal.open($scope.opts);
        
        modalInstance.result.then(function(result){
            if(result != null){
                bookings[result.id] = result;
                event.title = bookings[event.id].destination;
                event.start = utilityService.formatDateString(bookings[event.id].eventDate);
                event.end = utilityService.formatDateStringEnd(bookings[event.id].dropOffDate);
                $('#calendar').fullCalendar('updateEvent', event);
            } else {
                delete bookings[event.id];
                for(var i=0; i < eventList.length ; i++){
                  if (eventList[i].id == event.id) {
                    eventList.splice(i,1);
                    break;
                  }
                }
                $('#calendar').fullCalendar('removeEvents');
                $('#calendar').fullCalendar('addEventSource', eventList);
                $('#calendar').fullCalendar('rerenderEvents');
            }
            
            //on ok button press
             
        });
        
    };
    
    
    $scope.showNewModal = function(){
        $scope.opts = {
            backdrop: true,
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : '/newBookingContent.html',
            controller : 'NewBookingController',
            size: 'lg',
            resolve: {} // empty storage
        };

        $scope.opts.resolve.cars = function() {
            return angular.copy({
              cars: $scope.cars
            }); // pass name to Dialog
        };    
        
        $scope.opts.resolve.drivers = function() {
            return angular.copy({
              drivers: $scope.drivers
            }); // pass name to Dialog
        };
        
        var modalInstance = $modal.open($scope.opts);
        
        modalInstance.result.then(function(result){
            bookings[result.id] = result;
            var newEvent = {};
            newEvent.id = result.id;
            newEvent.title = result.destination;
            newEvent.allDay = true;
            newEvent.start = utilityService.formatDateString(result.eventDate);
            newEvent.end = utilityService.formatDateStringEnd(result.dropOffDate);
            newEvent.editable = true;
            newEvent.description = result.pickupAddress + ' to ' + result.destination;
            newEvent.className = ['btn-skin', 'btn-default', 'btn-lg', 'event-item'];
            
            eventList.push(newEvent);
            
            $('#calendar').fullCalendar('removeEvents');
            $('#calendar').fullCalendar('addEventSource', eventList);
            $('#calendar').fullCalendar('rerenderEvents');
             
        });
        
    };
    
  }]
);

angular.module('hnpApp').controller('EditBookingController',
  ['$scope', '$modalInstance', '$modal', 'bookings', 'cars', 'drivers', 'bookingService', 'utilityService', 'customerService', function ($scope, $modalInstance, $modal, bookings, cars, drivers, bookingService, utilityService, customerService) {
    
    //Functions
    var convertTimeToString = function(input){
      var input = input + '';
      var nullTime = '--:--';
      
      
      if(input == 0 || input.length > 5 || input.length < 3){
      
        return nullTime;
      }
      if(input.length < 4) {
        input = input[0] + ':' + input.substring(input.length-2, input.length);
      }else{
        input = input[0] + input[1] + ':' + input.substring(input.length-2, input.length);
      }
      return input; 
    };
     
    var findLocationName = function (latlong, index){
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': latlong}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          $scope.locationName = results[0].formatted_address;
        } 
      });
    };
    var convertTime = function(input){
      var nullTime = '--:--';
      if(input == nullTime || input.length > 5 || input.length < 3 || input.match(/:/g) == ''){
        return 0;
      }
      input = input.replace(/:/g, "");
      return parseInt(input); 
    };
    
    $scope.changeKms = function(){
        var startKm = 0;
        var endKm = 0;
        
        startKm = $scope.booking.startOdometer;
        endKm = $scope.booking.endOdometer;
        
        if(startKm <= endKm){
          $scope.booking.kilometers = (endKm - startKm);
        }
        
    };
  
    //Variables
    var res;
    var alertDuplicate = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Car already booked between these dates. Please select new dates.</div>';
    var alertDelete = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Cannot Delete the Event.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Event is edited successfully</div>';
    
    //Initialize
    $scope.booking = bookings.booking;
    $scope.booking.refPickupDate = utilityService.getDate(bookings.booking.eventDate);
    //$scope.dropOffDate = utilityService.formatDateString(bookings.booking.dropOffDate);
    $scope.booking.repDropOffDate = utilityService.getDate(bookings.booking.dropOffDate);
    $scope.cars = cars.cars;
    $scope.drivers = drivers.drivers;
    $scope.booking.eventTime = convertTimeToString($scope.booking.eventTime);
    $scope.booking.destination1Time = convertTimeToString($scope.booking.destination1Time);
    $scope.booking.destination2Time = convertTimeToString($scope.booking.destination2Time);
    $scope.booking.dropOffTime = convertTimeToString($scope.booking.dropOffTime);
    $scope.message = '';
    
    //Google Maps Stuff
    if($scope.booking.lastKnownLocation != '' && $scope.booking.lastKnownLocation != 'Unknown' && $scope.booking.lastKnownLocation !== null){
      findLocationName($scope.booking.lastKnownLocation);
      res = $scope.booking.lastKnownLocation.split(',');
    }else{
      res = [];
      res[0] = '42.986058';
      res[1] = '-81.242596';
    }
    var latlng = new google.maps.LatLng(res[0], res[1]);
    // prepare the map properties
    var options = {
            zoom: 15,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            mapTypeControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true
    };
    // initialize the map object
    /*var map = new google.maps.Map(document.getElementById("google_map_modal"), options);
    // add Marker
    var marker1 = new google.maps.Marker({
        position: latlng, map: map
    });
    // add listener for a click on the pin
    google.maps.event.addListener(marker1, 'click', function() {
      infowindow.open(map, marker1);
    });
    // add information window
    var infowindow = new google.maps.InfoWindow({
        content:  '<div class="info"><strong>' + cars[$scope.booking.carId].registrationNumber + '</strong><br><br>Last known location at<br></div>'
    });*/
    
    
    if(bookings.booking.customerId != 0){
         var name = bookings.booking.customerFirstName + ' ' + bookings.booking.customerLastName;
         var customer = {id: bookings.booking.customerId, name: name, mobile : bookings.booking.customerMobile, email : bookings.booking.customerEmail};
         $scope.customer = customer;
    }
    else{
      var customer = {id: 0, name: '', mobile: '', email: ''};
      $scope.customer = customer;
    }
    
    $scope.ok = function (result) {
        $scope.booking.eventTime = convertTime($scope.booking.eventTime);
        $scope.booking.destination1Time = convertTime($scope.booking.destination1Time);
        $scope.booking.destination2Time = convertTime($scope.booking.destination2Time);
        $scope.booking.dropOffTime = convertTime($scope.booking.dropOffTime);
        var dod = utilityService.formatDate($scope.booking.repDropOffDate);
        $scope.booking.dropOffDate = dod.replace(/-/g,'');
        dod = utilityService.formatDate($scope.booking.refPickupDate);
        $scope.booking.eventDate = dod.replace(/-/g,''); 
        if ( $scope.booking.dropOffTime != 0){
          $scope.booking.status = 'Complete';
         } else if($scope.booking.destination1Time != 0 || $scope.booking.destination2Time != 0){
            $scope.booking.status = 'Returning';
         } else if ($scope.booking.eventTime != 0) {
            $scope.booking.status = 'Onwards';
         } else {
            $scope.booking.status = 'Scheduled';
         }
         
         
          var promise = bookingService.getCustomerId($scope.booking, $scope.customer.mobile, $scope.customer.name, $scope.customer.email);
          promise.then(function(result){
              $scope.booking.customerId = result;
              bookingService.updateBooking($scope.booking).success(function(updatedData){
                  $('#em-show-alert').html(alertSuccess);
                  alert('Event updated successfully!');
                  $modalInstance.close($scope.booking);
                  
              }).error(function(data, status){
                  if(status = 406){
                    $('#em-show-alert').html(alertDuplicate);
                    $scope.booking.eventTime = convertTimeToString($scope.booking.eventTime);
                    $scope.booking.destination1Time = convertTimeToString($scope.booking.destination1Time);
                    $scope.booking.destination2Time = convertTimeToString($scope.booking.destination2Time);
                    $scope.booking.dropOffTime = convertTimeToString($scope.booking.dropOffTime);
                    $scope.booking.dropOffDate = $scope.booking.repDropOffDate;
                    $scope.booking.eventDate = $scope.booking.refPickupDate;
                  }
              });
          });
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    
    $scope.deleteEvent = function () {
        bookingService.deleteBooking($scope.booking.id).
          success(function(){
             alert('Event deleted successfully!');
             $modalInstance.close(null);
          }).error(function(data, status){
            $('#em-show-alert').html(alertDelete);
          });
        
    };
      
      
      
  }]
);



angular.module('hnpApp').controller('NewBookingController',
  ['$scope', '$modalInstance', '$modal', 'cars', 'drivers', 'bookingService', 'utilityService', function ($scope, $modalInstance, $modal, cars, drivers, bookingService, utilityService) {
    
    //Functions
    var convertTimeToString = function(input){
      var input = input + '';
      var nullTime = '--:--';
      
      
      if(input == 0 || input.length > 5 || input.length < 3){
      
        return nullTime;
      }
      if(input.length < 4) {
        input = input[0] + ':' + input.substring(input.length-2, input.length);
      }else{
        input = input[0] + input[1] + ':' + input.substring(input.length-2, input.length);
      }
      return input; 
    };
     
    var findLocationName = function (latlong, index){
      var geocoder = new google.maps.Geocoder();
      geocoder.geocode({'address': latlong}, function(results, status) {
        if (status == google.maps.GeocoderStatus.OK) {
          $scope.locationName = results[0].formatted_address;
        } 
      });
    };
    var convertTime = function(input){
      var nullTime = '--:--';
      if(input == nullTime || input.length > 5 || input.length < 3 || input.match(/:/g) == ''){
        return 0;
      }
      input = input.replace(/:/g, "");
      return parseInt(input); 
    };
    
    $scope.changeKms = function(){
        var startKm = 0;
        var endKm = 0;
        
        startKm = $scope.booking.startOdometer;
        endKm = $scope.booking.endOdometer;
        
        if(startKm <= endKm){
          $scope.booking.kilometers = (endKm - startKm);
        }
        
    };
  
    //Variables
    var res;
    var alertDuplicate = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Car already booked between these dates. Please select new dates.</div>';
    var alertIncomplete = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Pickup & Destination, Address and Date mandatory, along with a Car.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Event created successfully</div>';
       
    /*Initialize
    $scope.booking = bookings.booking;
    $scope.booking.refPickupDate = utilityService.formatDateString(bookings.booking.eventDate);
    //$scope.dropOffDate = utilityService.formatDateString(bookings.booking.dropOffDate);
    $scope.booking.repDropOffDate = utilityService.formatDateString(bookings.booking.dropOffDate);
    $scope.cars = cars.cars;
    $scope.drivers = drivers.drivers;
    $scope.booking.eventTime = convertTimeToString($scope.booking.eventTime);
    $scope.booking.destination1Time = convertTimeToString($scope.booking.destination1Time);
    $scope.booking.destination2Time = convertTimeToString($scope.booking.destination2Time);
    $scope.booking.dropOffTime = convertTimeToString($scope.booking.dropOffTime);
    $scope.message = '';
    */
    $scope.booking = {
        userId : 12,
        eventTime : 0,
        destination1Time : 0,
        destination2Time : 0,
        dropOffTime : 0,
        status : 'New',
        carId : 0,
        driverId : 0
    };
    
    $scope.customer = {
        name : '',
        mobile : '',
        email : ''
    };
    
    $scope.booking.eventTime = convertTimeToString($scope.booking.eventTime);
    $scope.booking.destination1Time = convertTimeToString($scope.booking.destination1Time);
    $scope.booking.destination2Time = convertTimeToString($scope.booking.destination2Time);
    $scope.booking.dropOffTime = convertTimeToString($scope.booking.dropOffTime);
    
    $scope.cars = cars.cars;
    $scope.drivers = drivers.drivers;
    
    /*Google Maps Stuff
    if($scope.booking.lastKnownLocation != '' && $scope.booking.lastKnownLocation != 'Unknown'){
      findLocationName($scope.booking.lastKnownLocation);
      res = $scope.booking.lastKnownLocation.split(',');
    }else{
      res = [];
      res[0] = '42.986058';
      res[1] = '-81.242596';
    }
    var latlng = new google.maps.LatLng(res[0], res[1]);
    // prepare the map properties
    var options = {
            zoom: 15,
            center: latlng,
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            mapTypeControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true
    };*/
    // initialize the map object
    /*var map = new google.maps.Map(document.getElementById("google_map_modal"), options);
    // add Marker
    var marker1 = new google.maps.Marker({
        position: latlng, map: map
    });
    // add listener for a click on the pin
    google.maps.event.addListener(marker1, 'click', function() {
      infowindow.open(map, marker1);
    });
    // add information window
    var infowindow = new google.maps.InfoWindow({
        content:  '<div class="info"><strong>' + cars[$scope.booking.carId].registrationNumber + '</strong><br><br>Last known location at<br></div>'
    });*/
    
    /*
    if(bookings.booking.customerId != 0){
    
    }
    else{
      var customer = {id: 0, name: '', mobile: '', email: ''};
      $scope.customer = customer;
    } */
    
    $scope.ok = function (result) {
    
        if($scope.booking.refPickupDate != '' && $scope.booking.repDropOffDate != '' 
            && $scope.booking.pikcupAddress != '' && $scope.booking.destination != '' 
            && $scope.booking.carId != '0'){
              
              $scope.booking.eventTime = convertTime($scope.booking.eventTime);
              $scope.booking.destination1Time = convertTime($scope.booking.destination1Time);
              $scope.booking.destination2Time = convertTime($scope.booking.destination2Time);
              $scope.booking.dropOffTime = convertTime($scope.booking.dropOffTime);
              
              var dod = utilityService.formatDate($scope.booking.repDropOffDate);
              $scope.booking.dropOffDate = dod.replace(/-/g,'');
              dod = utilityService.formatDate($scope.booking.refPickupDate); 
              $scope.booking.eventDate = dod.replace(/-/g,''); 
              if ( $scope.booking.dropOffTime != 0){
                $scope.booking.status = 'Complete';
               } else if($scope.booking.destination1Time != 0 || $scope.booking.destination2Time != 0){
                  $scope.booking.status = 'Returning';
               } else if ($scope.booking.eventTime != 0) {
                  $scope.booking.status = 'Onwards';
               } else {
                  $scope.booking.status = 'Scheduled';
               }
               $scope.booking.lastKnownLocation = '';
              
              var promise = bookingService.getCustomerId($scope.booking, $scope.customer.mobile, $scope.customer.name, $scope.customer.email);
              promise.then(function(result){
                  $scope.booking.customerId = result;
                  bookingService.addBooking($scope.booking).success(function(data, status, headers){
                      $('#em-show-alert').html(alertSuccess);
                      var uri = headers('Location');
                      var uriParts = uri.split('/');
                      $scope.booking.id = uriParts[uriParts.length-1];
                      $scope.booking.customerMobile = $scope.customer.mobile;
                      $scope.booking.customerEmail = $scope.customer.email;
                      var names = $scope.customer.name.split(' ');
                          $scope.booking.customerFirstName = names[0];
                          $scope.booking.customerLastName = '';
                          if(names.length > 0){
                             $scope.booking.customerLastName = names[1];
                          }
                      //return addBooking(ne);
                      alert('Event created successfully!');
                      $modalInstance.close($scope.booking);
                  }).error(function(data, status){
                      if(status = 406){
                        $('#em-show-alert').html(alertDuplicate);
                        $scope.booking.eventTime = convertTimeToString($scope.booking.eventTime);
                        $scope.booking.destination1Time = convertTimeToString($scope.booking.destination1Time);
                        $scope.booking.destination2Time = convertTimeToString($scope.booking.destination2Time);
                        $scope.booking.dropOffTime = convertTimeToString($scope.booking.dropOffTime);
                        $scope.booking.dropOffDate = $scope.booking.repDropOffDate;
                        $scope.booking.eventDate = $scope.booking.refPickupDate;
                      }
                  });
                  
              });
                            
        } else {
           $('#em-show-alert').html(alertIncomplete);
        }
            
        
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
      
      
      
  }]
);