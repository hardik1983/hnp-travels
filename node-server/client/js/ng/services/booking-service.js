angular.module('hnpApp').service('bookingService', function($http, $q) {
  'use strict';

  //Define
  //var apiURL = 'http://49.40.32.176:9086/wsw/hnp/resources/';
  var apiURL = 'http://localhost:3000/api/';
  var resourceURL = apiURL + 'event/';
  
  
  this.createNewBooking = function(userId, carId, pickup, destination, pickupDate, dropoffDate){
      var booking = { 
              'userId' : userId,
              'carId' : carId,
              'eventDate' : pickupDate,
              'dropOffDate' : dropoffDate,
              'pickupAddress' : pickup,
              'destination' : destination,
              'lastKnownAddress' : ''
            };
            
      return $http({
            method: 'POST',
            url: resourceURL,
            dataType: 'json',
            data: booking,
            headers: { 'Content-Type': 'application/json'
            }
      });
  };
  
  this.updateBooking = function(ub){
      var booking = { 
              'userId' : ub.userId,
              'carId' : ub.carId,
              'driverId' : ub.driverId,
              'customerId' : ub.customerId,
              'eventDate' : ub.eventDate,
              'eventTime' : ub.eventTime,
              'pickupAddress' : ub.pickupAddress,
              'destination' : ub.destination,
              'destination1Time' : ub.destination1Time,
              'destination2Time' : ub.destination2Time,
              'dropOffDate' : ub.dropOffDate,
              'dropOffTime' : ub.dropOffTime,
              'status' : ub.status,
              'kilometers' : ub.kilometers,
              'startOdometer' : ub.startOdometer,
              'endOdometer' : ub.endOdometer,
              'rate' : ub.rate,
              'lastKnownLocation' : ub.lastKnownLocation
            };
      var actualURL = resourceURL + ub.id;
      return $http({
            method: 'PUT',
            url: actualURL,
            dataType: 'json',
            data: booking,
            headers: { 'Content-Type': 'application/json'
            }
      });
  };
  
  var clone = function(obj){
    if (null == obj || "object" != typeof obj) return obj;
    var copy = obj.constructor();
    for (var attr in obj) {
        if (obj.hasOwnProperty(attr)){
          copy[attr] = obj[attr];
        } 
    }
    return copy;
  };
  
  var getCustomer = function(userId, mobile){
       var actualURL = apiURL + 'customer/?userId=' + userId + '&mobile=' + mobile;
       return $http.get(actualURL);
  };
  
  var createNewCustomer = function(cust){
       var actualURL = apiURL + 'customer/';
       
       return $http({
            method: 'POST',
            url: actualURL,
            dataType: 'json',
            data: cust,
            headers: { 'Content-Type': 'application/json'
            }
      });
  };

  this.addBooking = function(ne){
      var bk = clone(ne);
      delete bk.refPickupDate;
      delete bk.repDropOffDate;

      return $http({
            method: 'POST',
            url: resourceURL,
            dataType: 'json',
            data: bk,
            headers: { 'Content-Type': 'application/json'
            }
      });

  };
  
  this.getCustomerId = function(ne, mobile, name, email){
      
      return $q(function(resolve, reject) {
          if(mobile != ''){
                  getCustomer(ne.userId, mobile).success(function(data){
                      if(data.length > 0){
                          ne.customerId = data[0].id;
                          resolve(ne.customerId); 
                      } else {
                          if(name == null){
                            name = '';
                          }
                          if(email == null){
                            email = '';
                          }
                          var names = name.split(' ');
                          var fName = names[0];
                          var lName = '';
                          if(names.length > 0){
                             lName = names[1];
                          }
                          var customer = {
                            firstName : names [0],
                            lastName : names [1],
                            userId : ne.userId,
                            emailId : email,
                            cell : mobile
                          };
                          createNewCustomer(customer).success(function(data, status, headers){
                              var uri = headers('Location');
                              var uriParts = uri.split('/');
                              ne.customerId = uriParts[uriParts.length-1];
                              //return addBooking(ne);
                              resolve(ne.customerId);
                          }).error(function(){
                              ne.customerId = 0;
                              //return addBooking(ne);
                              resolve(ne.customerId);
                          });
                      }
                  }).error(function(){
                      ne.customerId = 0;
                      //return addBooking(ne);
                      resolve(ne.customerId);
                  });
            } else {
                ne.customerId = 0;
                //return addBooking(ne);
                resolve(ne.customerId);
            }
      }, 1000);
  };
  
  this.deleteBooking = function(eventId){
      var actualURL = resourceURL + eventId;
            
      return $http({
            method: 'DELETE',
            url: actualURL,
            dataType: 'json',
            headers: { 'Content-Type': 'application/json'
            }
      });
  }
  
  
  
  
  this.retrieveAllBooking = function(userId){
     var actualURL = resourceURL + '?userId=' + userId;
     return $http.get(actualURL);
  };
  
  
});