function myUser($scope, $http){
          $scope.id=1;
          $http.get('http://localhost:9086/wsw/hnp/resources/user/12').
            success(function(data){
               $scope.user = data;
            });
            
}

function myCars($scope, $http){
          $http.get('http://localhost:9086/wsw/hnp/resources/car/?userId=12').
            success(function(data){
               $scope.cars = data;
            });
            
}

function myDrivers($scope, $http){
          $http.get('http://localhost:9086/wsw/hnp/resources/driver/?userId=12').
            success(function(data){
               $scope.drivers = data;
            });
            
}

function myEvents($scope, $http){
          $http.get('http://localhost:9086/wsw/hnp/resources/event/?userId=12').
            success(function(data){
               $scope.bookings = data;
            });
            
}

function newBooking($scope, $http){
    
    $http.defaults.useXDomain = true;
    
    $scope.message = '';
    $scope.newBooking = '';
    
    $http.post('http://localhost:9086/wsw/hnp/resources/event', {userId:12,carId:5,eventDate: $scope.newBooking.pickupDate , dropOffDate:$scope.newBooking.dropOffDate,pickupAddress:$scope.newBooking.pickupAddress,destination:$scope.newBooking.destination}).
    success(function(data, status, headers, config) {
    $scope.message = 'Booking Created Successfully! Your booking id is ' & headers.get('Location');
  }).
  error(function(data, status, headers, config) {
    $scope.message = 'Error Occurred while booking';
  });
    
}