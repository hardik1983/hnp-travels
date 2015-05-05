angular.module('hnpApp').controller('ongoingBookingController',
  ['$scope', '$http', '$modal', 'utilityService', 'Event', 'User', 'LoopBackAuth', function ($scope, $http, $modal, utilityService, myEvent, myUser, LoopBackAuth) {
    'use strict';
    var allBookings = [];
    var userId = LoopBackAuth.currentUserId;
    var today = new Date();
    var currentDate = utilityService.formatDate(today);
    
    var drivers = {};
    var cars = {};
    $scope.carLength = 0;
    var bookings = {};
    //var customers = {};
    var eventList = [];
        
    var maps = {};
    var latlng = {};
    var dirDisplays = {};
    var trackingCars = {};
     
    var convertTime = function(input){
      var nullTime = '--:--';
      if(input == nullTime || input.length > 5 || input.length < 3 || input.match(/:/g) == ''){
        return 0;
      }
      input = input.replace(/:/g, "");
      return parseInt(input); 
    };  
    var populateCalendar = function(booking){
        var todayInt = parseInt(currentDate.replace(/-/g,'')); 
        var eventItem = {};
        eventItem.id = booking.id;
        eventItem.title = booking.destination;
        eventItem.allDay = true;
        eventItem.start = utilityService.formatDateString(booking.eventDate);
        eventItem.end = utilityService.formatDateStringEnd(booking.dropOffDate);
        eventItem.editable = true;
        if(booking.customer !== undefined){
          eventItem.description = booking.pickupAddress + ' to ' + booking.destination + '<br />' + booking.customer.firstName;
        } else {
          eventItem.description = booking.pickupAddress + ' to ' + booking.destination + '<br />';
        }
        
        
        var endInt = parseInt((booking.dropOffDate + '').replace(/-/g,''));
        if(endInt < todayInt){
          eventItem.className = ['btn-skin', 'btn-default', 'inactive', 'event-item-expired'];
        }
        else{
          eventItem.className = ['btn-skin', 'btn-default', 'btn-lg', 'event-item'];
        }
        
        return eventItem;
    };
    
    var determineStatus = function(booking){
       if ( booking.dropOffTime != 0 && booking.dropOffTime != '--:--' ){
          return 'Complete';
       } else if ((booking.destination1Time != 0 && booking.destination1Time != '--:--')|| (booking.destination2Time != 0 && booking.destination2Time != '--:--')){
          return 'Returning';
       } else if (booking.eventTime != 0 && booking.eventTime != '--:--') {
          return 'Onwards';
       } else {
          return 'Scheduled';
       }
    };

    var prepareMap = function(index){
       if(maps[index] !== null && maps[index] !== undefined){
        
       } else {
          var res;          
          if(bookings[index].lastKnownLocation != 'Unknown'){
            res = bookings[index].lastKnownLocation.split(',');
          } else{
            res = [];
            res[0] = '42.986058';
            res[1] = '-81.242596';
            //latlng = bookings[index].pickupAddress;
          } 
          latlng[index] = new google.maps.LatLng(res[0], res[1]);
          var options = {
            zoom: 15,
            center: latlng[index],
            mapTypeId: google.maps.MapTypeId.ROADMAP,
            navigationControl: true,
            mapTypeControl: false,
            scrollwheel: false,
            disableDoubleClickZoom: true
          };
          maps[index] = new google.maps.Map(document.getElementById('google_map' + index), options);
          dirDisplays[index] = new google.maps.DirectionsRenderer();
          dirDisplays[index].setMap(maps[index]);
          trackingCars[bookings[index].carId] = index;
          // add Marker
          var marker1 = new google.maps.Marker({ position: latlng[index], map: maps[index] });
          // add listener for a click on the pin
          google.maps.event.addListener(marker1, 'click', function() { 
            infowindow.open(maps[index], marker1);
          });
          // add information window
          var infowindow = new google.maps.InfoWindow({
            content:  '<div class="info"><strong>' + bookings[index].carId.registrationNumber + '</strong><br><br>Last known location at<br></div>'
          });
          
       }
    };  
    
    var updateTracker = function(cordinates){
      console.log('Received Pulse: ' + cordinates);
      //Check is update is for this user
      if(userId == cordinates.userId){
         //Check if this car is being tracked
         var bkgId = trackingCars[cordinates.carId];
         if(bkgId != null && bkgId > 0){
            var res = cordinates.lastKnownLocation.split(',');
            latlng[bkgId] = new google.maps.LatLng(res[0], res[1]);
            var trckMarker = new google.maps.Marker({ position: latlng[bkgId], map: maps[bkgId] });
         } 
      }
    };
    
    //Activate the Car Tracking/Monitoring System
    var source = new EventSource('/track/cars');
    source.addEventListener('message', updateTracker, false);
    
    
    $scope.currentDate = currentDate;
    $scope.bookings = bookings;
    $scope.cars = cars;
    $scope.drivers = drivers;
    
    // Get Current User
    myUser.getCurrent(function(data, status){
        $scope.myUser = data;
        //Populate all the cars of this user
        myUser.cars({ id: data.id }, function(carData, status){
            $scope.carLength = carData.length;
            for(var i=0; i < carData.length; i++){
              cars[carData[i].id] = carData[i];
            }
            
        });
        
        //Populate all the drivers of this user
        myUser.drivers({ id: data.id}, function(driverData, status){
            for(var i=0; i < driverData.length; i++){
              drivers[driverData[i].id] = driverData[i];
            }
        });
        
        //Get all the Events
        myUser.events({ id: data.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
            $('#calendar').fullCalendar('removeEventSource', eventList);
            userId = data.id;
            for(var i=0; i<eventData.length; i++){
              //Populate FullCalendar.io
              eventList[i] = populateCalendar(eventData[i]);
              
              //Determine Status based on times
              eventData[i].status = determineStatus(eventData[i]);
              if(eventData[i].lastKnownLocation == 'null' || eventData[i].lastKnownLocation == ''){
                  eventData[i].lastKnownLocation = "Unknown";
                  eventData[i].estimatedTime = "Cannot Calculate";
              }
              
              //Convert Time into XX:XX format
              eventData[i].eventTime = utilityService.formatTime(eventData[i].eventTime);
              eventData[i].destination1Time = utilityService.formatTime(eventData[i].destination1Time);
              eventData[i].destination2Time = utilityService.formatTime(eventData[i].destination2Time);
              eventData[i].dropOffTime = utilityService.formatTime(eventData[i].dropOffTime);     
              
              //Calculate elapsed time since pickup
              if(eventData[i].eventTime != '--:--'){
                eventData[i].elapsedTime = utilityService.getElapsedTime(eventData[i].eventDate, eventData[i].eventTime); 
              }
              
              //Populate Hash Map with key = booking.id
              bookings[eventData[i].id] = eventData[i];
              
              //Push the Event into Car for History
              if(cars[eventData[i].carId].events === undefined){
                cars[eventData[i].carId].events = [];
              }
              cars[eventData[i].carId].events.push(eventData[i]);
              
              //Push the Event into Driver for History
              if(eventData[i].driverId != null && eventData[i].driverId != 0){
                  if(drivers[eventData[i].driverId].events === undefined){
                    drivers[eventData[i].driverId].events = [];
                  }
                  drivers[eventData[i].driverId].events.push(eventData[i]);
              }
            }
            
            $('#calendar').fullCalendar('addEventSource', eventList);
        });
        
        
          
    });
    
    
     
    $scope.pickedUp = function(id){
        //Calculate Current Time
        var currTime = new Date();
        var hrs = currTime.getHours();
        var mins = currTime.getMinutes();
        if(hrs < 10){hrs = '0' + hrs;}
        hrs = hrs + '';
        if(mins < 10){mins = '0' + mins;}
        mins = mins + '';

        
        //Determine Status & Time
        var timeUpdated = hrs + '' + mins;
        var status = determineStatus(bookings[id]);
        
        //Update attributes
        myEvent.prototype$updateAttributes({id: id, eventTime: timeUpdated, status: status }, function(updatedData, status){
          //Set formated time in memory
          $scope.bookings[id].eventTime = hrs + ':' + mins;
          $scope.bookings[id].status = status;         
        });
        
    };
    
    $scope.atDestination = function(id){
        //Calculate Current Time
        var currTime = new Date();
        var hrs = currTime.getHours();
        var mins = currTime.getMinutes();
        if(hrs < 10){hrs = '0' + hrs;}
        hrs = hrs + '';
        if(mins < 10){mins = '0' + mins;}
        mins = mins + '';

        
        //Determine Status & Time
        var timeUpdated = hrs + '' + mins;
        var status = determineStatus(bookings[id]);
        
        //Update attributes
        myEvent.prototype$updateAttributes({id: id, destination1Time: timeUpdated, status: status }, function(updatedData, status){
          //Set formated time in memory
          $scope.bookings[id].eventTime = hrs + ':' + mins;
          $scope.bookings[id].status = status;         
        });
    };
    
    $scope.droppedOff = function(id){
        //Calculate Current Time
        var currTime = new Date();
        var hrs = currTime.getHours();
        var mins = currTime.getMinutes();
        if(hrs < 10){hrs = '0' + hrs;}
        hrs = hrs + '';
        if(mins < 10){mins = '0' + mins;}
        mins = mins + '';

        
        //Determine Status & Time
        var timeUpdated = hrs + '' + mins;
        var status = determineStatus(bookings[id]);
        
        //Update attributes
        myEvent.prototype$updateAttributes({id: id, dropOffTime: timeUpdated, status: status }, function(updatedData, status){
          //Set formated time in memory
          $scope.bookings[id].eventTime = hrs + ':' + mins;
          $scope.bookings[id].status = status;         
        });
    };
    
    $scope.ddClick = function(index){
      $('#ongng-dropdown' + index).toggle();
      prepareMap(index);
      var currEstimated = $('#ongng-trckr-estimated' + index).text(); 
      calculateEstimatedTime(bookings[index].lastKnownLocation, bookings[index].destination, index, dirDisplays[index]);
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
              if(results.duration !== null && results.duration !== undefined ){
                  $scope.bookings[bookingId].estimatedTime = results.duration.text;
                  $('#ongng-trckr-estimated' + bookingId).text(results.duration.text + ' Estimated.');
              }
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
        //dayClick: function() {
        //},
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
        
        var updateCarAndDriver = function(bkg){
          if(bkg.carId != bkg.oldCarId){
            //Add Event into new Car
            if(drivers[bkg.driverId].events !== undefined){
              cars[bkg.carId].events.push(bkg);
            } else {
              var events = [];
              events.push(bkg);
              cars[bkg.carId].events = events;
            }
          
            //Remove Event from the old Car
            var carEvents =  cars[bkg.oldCarId].events
            for(var i=0; i < carEvents.length; i++){
              if(carEvents[i].id == bkg.id){
                  carEvents.splice(i, 1);
                  break;
              }
            }
            //Update Bookings with new Car
            bkg.car = cars[bkg.carId];
          }
          
          //Driver - check if changed
          if(bkg.driverId != bkg.oldDriverId){
              //Add Event into new Driver
              if(drivers[bkg.driverId].events !== undefined){
                drivers[bkg.driverId].events.push(bkg);
              } else {
                var events = [];
                events.push(bkg);
                drivers[bkg.driverId].events = events;
              }
              
              //Remove Event from old Drvier
              if(bkg.oldDriverId != null && bkg.oldDriverId != ''){
                var driverEvents = drivers[bkg.oldDriverId].events;
                for(var i=0; i < driverEvents.length; i++){
                  if(driverEvents[i].id == bkg.id){
                      driverEvents.splice(i, 1);
                      break;
                  }
                }
              }
              //Update Bookings with new Driver
              bkg.driver = drivers[bkg.driverId];
              
          }
        };
        
        var removeBookingFromCarDriver = function(id){
            var carId = bookings[id].carId;
            var carEvents =  cars[carId].events
            for(var i=0; i < carEvents.length; i++){
              if(carEvents[i].id == id){
                  carEvents.splice(i, 1);
                  break;
              }
            }
            
            var driverId = bookings[id].driverId;
            if(driverId != null && driverId != ''){
              var driverEvents =  drivers[driverId].events
              for(var i=0; i < driverEvents.length; i++){
                if(driverEvents[i].id == id){
                    driverEvents.splice(i, 1);
                    break;
                }
              }
            }
        }
        
        modalInstance.result.then(function(result){
            if(result != null){
                updateCarAndDriver(result);
                bookings[result.id] = result;
                event.title = bookings[result.id].destination;
                event.start = utilityService.formatDateString(bookings[event.id].eventDate);
                event.end = utilityService.formatDateStringEnd(bookings[event.id].dropOffDate);
                $('#calendar').fullCalendar('updateEvent', event);
            } else {
                removeBookingFromCarDriver(event.id);
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
        
        modalInstance.result.then(function(eventData){
            //bookings[result.id] = result;
            // Refresh event
            //myEvent.find({ id: result.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
              bookings[eventData.id] = eventData; 
              //Add events to Driver Logic
              if(eventData.driverId != 0 && eventData.driverId != null){
                  var drvEvnts = drivers[eventData.driverId].events;
                  var found = false;
                  for(var i=0; i < drvEvnts.length; i++){
                    if(drvEvnts[i].id == eventData.id){
                      found = true;
                    }
                  }
                  
                  if(!found){
                    drivers[eventData.driverId].events.add(eventData);
                    $scope.drivers = drivers;
                  }
              }
              
              
              $scope.bookings = bookings;
              var newEvent = {};
              newEvent.id = eventData.id;
              newEvent.title = eventData.destination;
              newEvent.allDay = true;
              newEvent.start = utilityService.formatDateString(eventData.eventDate);
              newEvent.end = utilityService.formatDateStringEnd(eventData.dropOffDate);
              newEvent.editable = true;
              newEvent.description = eventData.pickupAddress + ' to ' + eventData.destination;
              newEvent.className = ['btn-skin', 'btn-default', 'btn-lg', 'event-item'];
              
              eventList.push(newEvent);
              $('#calendar').fullCalendar('removeEvents');
              $('#calendar').fullCalendar('addEventSource', eventList);
              $('#calendar').fullCalendar('rerenderEvents');
            //});
            
             
        });
        
    };
    
    /* Car Section */
    $scope.showCarEditModal = function(carId){
        $scope.opts = {
            backdrop: true,                         
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : '/editCarContent.html',
            controller : 'EditCarController',
            size: 'lg',
            resolve: {} // empty storage
        };

        $scope.opts.resolve.cars = function() {
            return angular.copy({
              car: $scope.cars[carId]
            }); // pass name to Dialog
        };    
        
        var modalInstance = $modal.open($scope.opts);
        
        modalInstance.result.then(function(result){
            if(result != null){
                cars[result.id] = result;
                $scope.cars = cars;
            } else {
                delete cars[carId];
                $scope.cars = cars;
                
            }
        });
        
    };
    
    $scope.showCarNewModal = function(){
        $scope.opts = {
            backdrop: true,                         
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : '/newCarContent.html',
            controller : 'NewCarController',
            size: 'lg',
            resolve: {} // empty storage
        };
        
        $scope.opts.resolve.user = function() {
            return angular.copy({
              id: userId
            }); // pass name to Dialog
        }; 

        var modalInstance = $modal.open($scope.opts);
        
        modalInstance.result.then(function(result){
            if(result != null){
                cars[result.id] = result;
                $scope.cars = cars;
            }
        });
    };
    
    //Driver Section
    $scope.showDriverEditModal = function(driverId){
        $scope.opts = {
            backdrop: true,                         
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : '/editDriverContent.html',
            controller : 'EditDriverController',
            size: 'lg',
            resolve: {} // empty storage
        };

        $scope.opts.resolve.drivers = function() {
            return angular.copy({
              driver: $scope.drivers[driverId]
            }); // pass name to Dialog
        };    
        
        var modalInstance = $modal.open($scope.opts);
        
        modalInstance.result.then(function(result){
            if(result != null){
                drivers[result.id] = result;
                $scope.drivers = drivers;
            } else {
                delete drivers[driverId];
                $scope.drivers = drivers;
                
            }
        });
        
    };
    
    $scope.showDriverNewModal = function(){
    
        $scope.opts = {
            backdrop: true,                         
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : '/newDriverContent.html',
            controller : 'NewDriverController',
            size: 'lg',
            resolve: {} // empty storage
        };

        $scope.opts.resolve.user = function() {
            return angular.copy({
              id: userId
            }); // pass name to Dialog
        }; 
        
        var modalInstance = $modal.open($scope.opts);
        
        modalInstance.result.then(function(result){
            if(result != null){
                drivers[result.id] = result;
                $scope.drivers = drivers;
            }
        });
    };
    
  }]
);


/*-----------------------------Booking Section--------------------------------*/
angular.module('hnpApp').controller('EditBookingController',
  ['$scope', '$modalInstance', '$modal', 'bookings', 'cars', 'drivers', 'utilityService', 'Event', 'Customer', function ($scope, $modalInstance, $modal, bookings, cars, drivers, utilityService, myEvent, myCust) {
     
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
    var timeToString = function(){
        $scope.booking.eventTime = convertTimeToString($scope.booking.eventTime);
        $scope.booking.destination1Time = convertTimeToString($scope.booking.destination1Time);
        $scope.booking.destination2Time = convertTimeToString($scope.booking.destination2Time);
        $scope.booking.dropOffTime = convertTimeToString($scope.booking.dropOffTime);
    };
    var showError = function(error){
      if(error.data != null && error.data !== undefined 
          && error.data.error != null && error.data.error !== undefined
          && error.data.error.sqlState == '12000'){
      
          $('#em-show-alert').html(alertDuplicate);
      } else {
          $('#em-show-alert').html(alertError);
      }
      timeToString();
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
    var alertError = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Internal Error while proceesing the booking.</div>';
    var alertDelete = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Cannot Delete the Event.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Event is edited successfully</div>';
    
    //Initialize
    $scope.booking = bookings.booking;
    $scope.booking.refPickupDate = utilityService.getDate(bookings.booking.eventDate);
    $scope.booking.repDropOffDate = utilityService.getDate(bookings.booking.dropOffDate);
    $scope.cars = cars.cars;
    $scope.drivers = drivers.drivers;
    
    if($scope.booking.customer != null){
        $scope.customer = $scope.booking.customer;
        $scope.customer.name = $scope.customer.firstName + ' ' + $scope.customer.lastName;
    } else{
        $scope.customer = {};
    }
    
    $scope.booking.eventTime = convertTimeToString($scope.booking.eventTime);
    $scope.booking.destination1Time = convertTimeToString($scope.booking.destination1Time);
    $scope.booking.destination2Time = convertTimeToString($scope.booking.destination2Time);
    $scope.booking.dropOffTime = convertTimeToString($scope.booking.dropOffTime);
    $scope.message = '';
    var oldMobile = '';
    $scope.booking.oldCarId = $scope.booking.carId;
    $scope.booking.oldDriverId = $scope.booking.driverId;
    
    
    if($scope.customer != null && $scope.customer != undefined){
      oldMobile = $scope.customer.cell;
    }
    
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
    
    $scope.ok = function (result) {        
        $scope.booking.eventTime = convertTime($scope.booking.eventTime);
        $scope.booking.destination1Time = convertTime($scope.booking.destination1Time);
        $scope.booking.destination2Time = convertTime($scope.booking.destination2Time);
        $scope.booking.dropOffTime = convertTime($scope.booking.dropOffTime);
        var dod = utilityService.convertDateToStore($scope.booking.repDropOffDate);
        $scope.booking.dropOffDate = dod;
        dod = utilityService.convertDateToStore($scope.booking.refPickupDate);
        $scope.booking.eventDate = dod; 

        if ( $scope.booking.dropOffTime != 0){
          $scope.booking.status = 'Complete';
        } else if($scope.booking.destination1Time != 0 || $scope.booking.destination2Time != 0){
          $scope.booking.status = 'Returning';
        } else if ($scope.booking.eventTime != 0) {
          $scope.booking.status = 'Onwards';
        } else {
          $scope.booking.status = 'Scheduled';
        }
        
        
        
        //Check if mobile # changed
        if(oldMobile != $scope.customer.cell){
            // Check if mobile was removed or empty
            if( $scope.customer.cell == null || $scope.customer.cell == '' ){
                // set customerId = null & Call Update
                $scope.booking.customer = null;
                $scope.booking.customerId = null;
                myEvent.prototype$updateAttributes($scope.booking, function(updatedData, status){
                  $('#em-show-alert').html(alertSuccess);
                  alert('Event updated successfully!');
                  $modalInstance.close($scope.booking);
                }, function (error) {
                  showError(error);
                });
            } else { // Else
                // Find new customer Id
                 myCust.findOne({filter: {where : {cell: $scope.customer.cell}}}, function(cust, status){
                    //CustomerId found
                    //set customerId & Call Update
                    $scope.booking.customer = cust;
                    $scope.booking.customerId = cust.id;
                    myEvent.prototype$updateAttributes($scope.booking, function(updatedData, status){
                      $('#em-show-alert').html(alertSuccess);
                      alert('Event updated successfully!');
                      $modalInstance.close($scope.booking);
                    }, function (error) {
                      showError(error);
                    });
                    
                 }, function(error) {
                    // Customer Id Not found
                    //Create new Customer
                    var newCust = {};
                    var names = $scope.customer.name.split(' ');
                    newCust.firstName = names[0];
                    newCust.lastName = '';
                    if(names.length > 0){
                       newCust.lastName = names[1];
                    }
                    newCust.cell = $scope.customer.cell;
                    newCust.email = $scope.customer.email;
                    //Create New Customer
                    myCust.create(newCust, function(newCustomer, status){
                        //set new custoemrId & Call Update
                        $scope.booking.customer = newCustomer;
                        $scope.booking.customerId = newCustomer.id;
                        myEvent.prototype$updateAttributes($scope.booking, function(updatedData, status){
                          $('#em-show-alert').html(alertSuccess);
                          alert('Event updated successfully!');
                          $modalInstance.close($scope.booking);
                        }, function (error) {
                          showError(error);
                        });
                    }, function (error) {
                        //Error - set customerId = null and Call Update
                        $scope.booking.customer = null;
                        $scope.booking.customerId = null;
                        myEvent.prototype$updateAttributes($scope.booking, function(updatedData, status){
                          $('#em-show-alert').html(alertSuccess);
                          alert('Event updated successfully!');
                          $modalInstance.close($scope.booking);
                        }, function (error) {
                          showError(error);
                        });
                    });
                 });
            }
        } else {
            // Dont touch CustomerId field & Update
            myEvent.prototype$updateAttributes($scope.booking, function(updatedData, status){
              $('#em-show-alert').html(alertSuccess);
              alert('Event updated successfully!');
              $modalInstance.close($scope.booking);
            }, function (error) {
              showError(error);
            });
        }    
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.deleteEvent = function () {
        myEvent.deleteById({id: $scope.booking.id}, function(){
           alert('Event deleted successfully!');
           $modalInstance.close(null);
        }, function(data, status){
          $('#em-show-alert').html(alertDelete);
        });
    };
  }]
);



angular.module('hnpApp').controller('NewBookingController',
  ['$scope', '$modalInstance', '$modal', 'cars', 'drivers', 'utilityService', 'Event', 'User', 'Customer', function ($scope, $modalInstance, $modal, cars, drivers, utilityService, myEvent, myUser, myCust) {
    
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
    var showError = function(error){
      if(error.data != null && error.data !== undefined 
          && error.data.error != null && error.data.error !== undefined
          && error.data.error.sqlState == '12000'){
      
          $('#em-show-alert').html(alertDuplicate);
      } else {
          $('#em-show-alert').html(alertError);
      }
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
    var alertError = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Internal Error while proceesing the booking.</div>';
    var alertIncomplete = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Pickup & Destination, Address and Date mandatory, along with a Car.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Event created successfully</div>';
       
    $scope.booking = {
        userId : 0,
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
    
    $scope.ok = function (result) {
    
        //All Mandatory Fields Populated??
        if($scope.booking.refPickupDate != '' && $scope.booking.repDropOffDate != '' 
            && $scope.booking.pikcupAddress != '' && $scope.booking.destination != '' 
            && $scope.booking.carId != '0'){
              
              $scope.booking.eventTime = convertTime($scope.booking.eventTime);
              $scope.booking.destination1Time = convertTime($scope.booking.destination1Time);
              $scope.booking.destination2Time = convertTime($scope.booking.destination2Time);
              $scope.booking.dropOffTime = convertTime($scope.booking.dropOffTime);
              
              var dod = utilityService.convertDateToStore($scope.booking.repDropOffDate);
              $scope.booking.dropOffDate = dod;
              dod = utilityService.convertDateToStore($scope.booking.refPickupDate); 
              $scope.booking.eventDate = dod; 
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
              // 0. Check if Customer is present
              if($scope.customer.mobile != null && $scope.customer.mobile != ''){
                  myCust.findOne({filter: {where : {cell: $scope.customer.mobile}}}, function(cust, status){
                    //Customer Found, attach that customer;
                    myUser.getCurrent(function(data, status){
                      $scope.booking.userId = data.id;
                      $scope.booking.customerId = cust.id
                      myEvent.create($scope.booking, function(createdEvent, status){
                           $('#em-show-alert').html(alertSuccess);
                           $scope.booking.id = createdEvent.id;
                            alert('Event created successfully!');
                            
                            //Retrieve event with all dependent details
                            myEvent.findById({ id: createdEvent.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                              $modalInstance.close(eventData);
                            }, function(error){
                              $modalInstance.close($scope.booking);
                            });                          
                            
                      }, function(status){
                        showError(status);            
                      });
                    }); 
                  }, function (status){
                    //Customer Not Found, create One.
                    var newCust = {};
                    var names = $scope.customer.name.split(' ');
                    newCust.firstName = names[0];
                    newCust.lastName = '';
                    if(names.length > 0){
                       newCust.lastName = names[1];
                    }
                    newCust.cell = $scope.customer.mobile;
                    newCust.emailId = $scope.customer.email;
                    //Create New Customer
                    myCust.create(newCust, function(newCustomer, status){
                      myUser.getCurrent(function(data, status){
                        $scope.booking.userId = data.id;
                        //Assign New Customer
                        $scope.booking.customerId = newCustomer.id
                        myEvent.create($scope.booking, function(createdEvent, status){
                             $('#em-show-alert').html(alertSuccess);
                             $scope.booking.id = createdEvent.id;
                              alert('Event created successfully!');
                              
                              //Retrieve event with all dependent details
                              myEvent.findById({ id: createdEvent.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                                $modalInstance.close(eventData);
                              }, function(error){
                                $modalInstance.close($scope.booking);
                              }); 
                              
                        }, function(status){
                          showError(status);            
                        });
                      }); 
                    }, function(status){
                        //If create new customer fails, proceed with event creation atleast.
                       myUser.getCurrent(function(data, status){
                        $scope.booking.userId = data.id;
                        myEvent.create($scope.booking, function(createdEvent, status){
                             $('#em-show-alert').html(alertSuccess);
                             $scope.booking.id = createdEvent.id;
                              alert('Event created successfully!');
                              
                              //Retrieve event with all dependent details
                              myEvent.findById({ id: createdEvent.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                                $modalInstance.close(eventData);
                              }, function(error){
                                $modalInstance.close($scope.booking);
                              }); 
                        }, function(status){
                          showError(status);         
                        });
                      }); 
                    });
                  });
              } else {
                  // 1. Create Event
                  myUser.getCurrent(function(data, status){
                    $scope.booking.userId = data.id;
                    myEvent.create($scope.booking, function(createdEvent, status){
                         $('#em-show-alert').html(alertSuccess);
                         $scope.booking.id = createdEvent.id;
                         alert('Event created successfully!');
                         //Retrieve event with all dependent details
                          myEvent.findById({ id: createdEvent.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                            $modalInstance.close(eventData);
                          }, function(error){
                            $modalInstance.close($scope.booking);
                          }); 
                    }, function(status){
                      showError(status);            
                    }); 
                  });
              }
        } else {
           $('#em-show-alert').html(alertIncomplete);
        }
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
  }]
);


/*-----------------------------Car Section------------------------------------*/
angular.module('hnpApp').controller('EditCarController',
  ['$scope', '$modalInstance', '$modal', 'cars', 'utilityService', 'Car', function ($scope, $modalInstance, $modal, cars, utilityService, myCar) {
    
    $scope.car = cars.car;
    $scope.car.flastServiceDate = utilityService.getDate($scope.car.lastServiceDate);
    $scope.car.fnextServiceDate = utilityService.getDate($scope.car.nextServiceDate);
    $scope.makes = [ 'Chevrolet', 'Tata', 'Toyota', 'Renault'];
    $scope.models = [ 'Tavera', 'Indica', 'Indigo', 'Innova', 'Logan'];
    
    var statuses = [
      {status: 'Gaurage'},
      {status: 'On Road'},
      {status: 'Service'}
    ];  
    $scope.statuses = statuses;
    
    //Variables
    var alertDuplicate = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Car already booked between these dates. Please select new dates.</div>';
    var alertError = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Internal Error while proceesing the booking.</div>';
    var alertDelete = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Cannot Delete the Car.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Car is edited successfully</div>';
    
     
    //Event Functions
    $scope.ok = function (result) {
        var dod = utilityService.formatDate($scope.car.flastServiceDate);
        $scope.car.lastServiceDate = dod.replace(/-/g,'');
        dod = utilityService.formatDate($scope.car.fnextServiceDate); 
        $scope.car.nextServiceDate = dod.replace(/-/g,''); 
       myCar.upsert($scope.car, function(data, status){
          $('#em-show-alert').html(alertSuccess);
          alert('Car edited successfully!');
          $modalInstance.close($scope.car);
       }, function (error){
          $('#em-show-alert').html(alertError);
       }); 
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.deleteEvent = function () {
        myCar.deleteById({id: $scope.car.id}, function(){
           alert('Car deleted successfully!');
           $modalInstance.close(null);
        }, function(data, status){
          $('#em-show-alert').html(alertDelete);
        });
    
    };
  }]
);

angular.module('hnpApp').controller('NewCarController',
  ['$scope', '$modalInstance', '$modal', 'user', 'utilityService', 'Car', function ($scope, $modalInstance, $modal, user, utilityService, myCar) {
    
    var car = {
      make: '',
      model: '',
      version: '',
      registrationNumber: '',
      currentOdometer: 0,
      lastServiceDate: 0,
      nextServiceDate: 0,
      status: 'On Road',
      ownerName: '',
      ownerAddress: '',
      userId: user.id
    };
    
    $scope.car = car;
    $scope.car.flastServiceDate = new Date();
    $scope.car.fnextServiceDate = new Date();
    $scope.makes = [ 'Chevrolet', 'Tata', 'Toyota', 'Renault'];
    $scope.models = [ 'Tavera', 'Indica', 'Indigo', 'Innova', 'Logan'];
    
    var statuses = [
      'Gaurage',
      'On Road',
      'Service'
    ];  
    $scope.statuses = statuses;
    
    //Variables
    var alertError = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Internal Error while proceesing the booking.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Car is edited successfully</div>';
    
     
    //Event Functions
    $scope.ok = function (result) {
        var dod = utilityService.formatDate($scope.car.flastServiceDate);
        $scope.car.lastServiceDate = dod.replace(/-/g,'');
        dod = utilityService.formatDate($scope.car.fnextServiceDate); 
        $scope.car.nextServiceDate = dod.replace(/-/g,''); 
       myCar.upsert($scope.car, function(data, status){
          $('#em-show-alert').html(alertSuccess);
          alert('Car created successfully!');
          $scope.car.id = data.id;
          $modalInstance.close($scope.car);
       }, function (error){
          $('#em-show-alert').html(alertError);
       }); 
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

  }]
);

/*-----------------------------Driver Section------------------------------------*/
angular.module('hnpApp').controller('EditDriverController',
  ['$scope', '$modalInstance', '$modal', 'drivers', 'utilityService', 'Driver', function ($scope, $modalInstance, $modal, drivers, utilityService, myDriver) {
    
    $scope.driver = drivers.driver;
    $scope.driver.fexpiryDate = utilityService.getDate($scope.driver.expiryDate);
    
    //Variables
    var alertError = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Internal Error while proceesing the driver.</div>';
    var alertDelete = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Cannot Delete the Driver.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Driver is edited successfully</div>';
    
     
    //Event Functions
    $scope.ok = function (result) {
        var dod = utilityService.formatDate($scope.driver.fexpiryDate);
        $scope.driver.expiryDate = dod.replace(/-/g,'');
         
       myDriver.upsert($scope.driver, function(data, status){
          $('#em-show-alert').html(alertSuccess);
          alert('Driver edited successfully!');
          $modalInstance.close($scope.driver);
       }, function (error){
          $('#em-show-alert').html(alertError);
       }); 
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };
    $scope.deleteEvent = function () {
        myDriver.deleteById({id: $scope.driver.id}, function(){
           alert('Driver deleted successfully!');
           $modalInstance.close(null);
        }, function(data, status){
          $('#em-show-alert').html(alertDelete);
        });
    
    };
  }]
);

angular.module('hnpApp').controller('NewDriverController',
  ['$scope', '$modalInstance', '$modal', 'user', 'utilityService', 'Driver', 'Upload', function ($scope, $modalInstance, $modal, user, utilityService, myDriver, Upload) {
    
    var driver = {
      firstName: '',
      lastName: '',
      cell: '',
      emailId: '',
      address: '',
      licenseNumber: '',
      userId: user.id
    };
    
    //File Upload Function
    $scope.uploadProfile = function (files) {
      
      if($scope.driver.firstName == ''){
           $('#em-show-alert').html(alertFileUpload);
      } else {
        if (files && files.length) {
            var file = files[0];
            Upload.upload({
                url: 'img/drivers/',
                fields: {
                    'driverName': $scope.driver.firstName
                },
                file: file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                if(progressPercentage == 100){
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                            evt.config.file.name + '\n' + $scope.log;
                    $('#dr-img').attr('src', '/img/drivers/' + $scope.driver.firstName + '.jpg?' + (new Date()));
                }
                
            }).success(function (data, status, headers, config) {
                $scope.log = 'file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                $scope.$apply();
            });
        } 
      }
    };
    
    $scope.uploadDl = function (files) {
      
      if($scope.driver.firstName == ''){
           $('#em-show-alert').html(alertFileUpload);
      } else {
        if (files && files.length) {
            var file = files[0];
            Upload.upload({
                url: 'img/drivers/dl/',
                fields: {
                    'driverName': $scope.driver.firstName
                },
                file: file
            }).progress(function (evt) {
                var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                if(progressPercentage == 100){
                    $scope.log = 'progress: ' + progressPercentage + '% ' +
                            evt.config.file.name + '\n' + $scope.log;
                    
                    $('#dr-dl').attr('src', '/img/drivers/' + $scope.driver.firstName + '-dl.jpg?' + (new Date()));
                }
                
            }).success(function (data, status, headers, config) {
                $scope.log = 'file ' + config.file.name + 'uploaded. Response: ' + JSON.stringify(data) + '\n' + $scope.log;
                $scope.$apply();
            });
        } 
      }
    };
    
    
    $scope.driver = driver;
    $scope.driver.fexpiryDate = new Date();
    
    //Variables
    var alertError = '<div class="alert alert-danger alert-error"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Error!</strong>Internal Error while proceesing the driver.</div>';
    var alertSuccess = '<div class="alert alert-success"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Success!</strong> Driver is edited successfully</div>';
    var alertFileUpload = '<div class="alert alert-warning"><a href="#" class="close" data-dismiss="alert">&times;</a><strong>Warning!</strong> Enter Driver name before uploading photo.</div>';
    
     
    //Event Functions
    $scope.ok = function (result) {
        var dod = utilityService.formatDate($scope.driver.fexpiryDate);
        $scope.driver.expiryDate = dod.replace(/-/g,'');
         
       myDriver.upsert($scope.driver, function(data, status){
          $('#em-show-alert').html(alertSuccess);
          alert('Driver created successfully!');
          $scope.driver.id = data.id;
          $modalInstance.close($scope.driver);
       }, function (error){
          $('#em-show-alert').html(alertError);
       }); 
    };
    $scope.cancel = function () {
        $modalInstance.dismiss('cancel');
    };

  }]
);