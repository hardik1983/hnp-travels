angular.module('hnpApp').controller('ongoingBookingController',
  ['$scope', '$http', '$modal', 'utilityService', 'Event', 'User', function ($scope, $http, $modal, utilityService, myEvent, myUser) {
    'use strict';
    var allBookings = [];
    var userId = 12;
    var today = new Date();
    var currentDate = utilityService.formatDate(today);
    
    var drivers = {};
    var cars = {};
    var bookings = {};
    //var customers = {};
    var eventList = [];
     
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
        eventItem.description = booking.pickupAddress + ' to ' + booking.destination + '<br />' + booking.customer.firstName;
        
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
    }  
    
    
    $scope.currentDate = currentDate;
    $scope.bookings = bookings;
    $scope.cars = cars;
    $scope.drivers = drivers;
    
    myUser.getCurrent(function(data, status){
        //Populate all the cars of this user
        myUser.cars({ id: data.id}, function(carData, status){
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
            }
            
            $('#calendar').fullCalendar('addEventSource', eventList);
        });
          
    });
    
    
     
    $scope.pickedUp = function(id){
        console.log('Picked Up customer for event ' + id);
        
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
        console.log('Customer at destination for event ' + id);
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
        console.log('Dropped Off customer for event ' + id);
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
      var res;
      var latlng;
      if(bookings[index].lastKnownLocation != 'Unknown'){
        res = bookings[index].lastKnownLocation.split(',');
        
      }
      else{
        res = [];
        res[0] = '42.986058';
        res[1] = '-81.242596';
        //latlng = bookings[index].pickupAddress;
      } 
      latlng = new google.maps.LatLng(res[0], res[1]);
      
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
        content:  '<div class="info"><strong>' + bookings[index].carId.registrationNumber + '</strong><br><br>Last known location at<br></div>'
      });
      
      var currEstimated = $('#ongng-trckr-estimated' + index).text(); 
      calculateEstimatedTime(bookings[index].lastKnownLocation, bookings[index].destination, index, directionsDisplay);
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
            //bookings[result.id] = result;
            // Refresh event
            myEvent.find({ id: result.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
              bookings[eventData.id] = eventData; 
            });
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
        
        //Check if mobile # changed
        if(oldMobile != $scope.customer.cell){
            // Check if mobile was removed or empty
            if( $scope.customer.cell == null || $scope.customer.cell == '' ){
                // set customerId = null & Call Update
                $scope.booking.customer = null;
                $scope.booking.customerId = null;
                myEvent.upsert($scope.booking, function(updatedData, status){
                  $('#em-show-alert').html(alertSuccess);
                  alert('Event updated successfully!');
                  $modalInstance.close($scope.booking);
                }, function (error) {
                  $('#em-show-alert').html(alertError);
                });
            } else { // Else
                // Find new customer Id
                 myCust.findOne({filter: {where : {cell: $scope.customer.cell}}}, function(cust, status){
                    //CustomerId found
                    //set customerId & Call Update
                    $scope.booking.customer = cust;
                    $scope.booking.customerId = cust.id;
                    myEvent.upsert($scope.booking, function(updatedData, status){
                      $('#em-show-alert').html(alertSuccess);
                      alert('Event updated successfully!');
                      $modalInstance.close($scope.booking);
                    }, function (error) {
                      $('#em-show-alert').html(alertError);
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
                        myEvent.upsert($scope.booking, function(updatedData, status){
                          $('#em-show-alert').html(alertSuccess);
                          alert('Event updated successfully!');
                          $modalInstance.close($scope.booking);
                        }, function (error) {
                          $('#em-show-alert').html(alertError);
                        });
                    }, function (error) {
                        //Error - set customerId = null and Call Update
                        $scope.booking.customer = null;
                        $scope.booking.customerId = null;
                        myEvent.upsert($scope.booking, function(updatedData, status){
                          $('#em-show-alert').html(alertSuccess);
                          alert('Event updated successfully!');
                          $modalInstance.close($scope.booking);
                        }, function (error) {
                          $('#em-show-alert').html(alertError);
                        });
                    });
                 });
            }
        } else {
            // Dont touch CustomerId field & Update
            myEvent.upsert($scope.booking, function(updatedData, status){
              $('#em-show-alert').html(alertSuccess);
              alert('Event updated successfully!');
              $modalInstance.close($scope.booking);
            }, function (error) {
              $('#em-show-alert').html(alertError);
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
  ['$scope', '$modalInstance', '$modal', 'cars', 'drivers', 'Event', 'User', 'Customer', function ($scope, $modalInstance, $modal, cars, drivers, myEvent, myUser, myCust) {
    
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
              // 0. Check if Customer is present
              if($scope.customer.mobile != null && $scope.customer.mobile != ''){
                  console.log('finding ' + $scope.customer.mobile);
                  myCust.findOne({filter: {where : {cell: $scope.customer.mobile}}}, function(cust, status){
                    //Customer Found, attach that customer;
                    myUser.getCurrent(function(data, status){
                      $scope.booking.userId = data.id;
                      $scope.booking.customerId = cust.id
                      myEvent.create($scope.booking, function(createdEvent, status){
                           $('#em-show-alert').html(alertSuccess);
                           $scope.booking.id = data.id;
                            alert('Event created successfully!');
                            
                            //Retrieve event with all dependent details
                            myEvent.find({ id: data.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                              $modalInstance.close(eventData);
                            }, function(error){
                              $modalInstance.close($scope.booking);
                            });                          
                            
                      }, function(status){
                        $('#em-show-alert').html(alertError);               
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
                             $scope.booking.id = data.id;
                              alert('Event created successfully!');
                              
                              //Retrieve event with all dependent details
                              myEvent.find({ id: data.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                                $modalInstance.close(eventData);
                              }, function(error){
                                $modalInstance.close($scope.booking);
                              }); 
                              
                        }, function(status){
                          $('#em-show-alert').html(alertError);               
                        });
                      }); 
                    }, function(status){
                        //If create new customer fails, proceed with event creation atleast.
                       myUser.getCurrent(function(data, status){
                        $scope.booking.userId = data.id;
                        myEvent.create($scope.booking, function(createdEvent, status){
                             $('#em-show-alert').html(alertSuccess);
                             $scope.booking.id = data.id;
                              alert('Event created successfully!');
                              
                              //Retrieve event with all dependent details
                              myEvent.find({ id: data.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                                $modalInstance.close(eventData);
                              }, function(error){
                                $modalInstance.close($scope.booking);
                              }); 
                        }, function(status){
                          $('#em-show-alert').html(alertError);              
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
                         $scope.booking.id = data.id;
                         alert('Event created successfully!');
                         //Retrieve event with all dependent details
                          myEvent.find({ id: data.id, filter: {include: ['customer', 'car', 'driver'] }}, function(eventData, status){
                            $modalInstance.close(eventData);
                          }, function(error){
                            $modalInstance.close($scope.booking);
                          }); 
                    }, function(status){
                      $('#em-show-alert').html(alertError);              
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