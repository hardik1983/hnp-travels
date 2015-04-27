angular.module('hnpApp').controller('loginController',
  ['$scope', '$http', 'User', '$window' , function ($scope, $http, myUser, $window) {
    'use strict';
  
  $scope.username = 'hardik1983@hnp.com';
  
  $scope.login = function(){
    console.log('Email ID: ' + $scope.username);
    console.log('Password: ' + $scope.password);
    
    myUser.login({username: $scope.username, password: $scope.password },function(token){
       console.log(token);
       if(token.user.type == 'owner'){
        $window.location.href="/index.html?tkn=" + token.id;
       }
    }, function(err){
      console.log(err);
      $scope.message = "Invalid Email or Password. Please try again!"
    }); 
    
  };

  $scope.register = function(){
    var userDetail = {
      username: $scope.user.emailId,
      password: $scope.user.password,
      firstName: $scope.user.firstName,
      lastName: $scope.user.lastName,
      mobile: $scope.user.cell,
      email: $scope.user.emailId,
      type: 'owner'
    }
    myUser.create(userDetail, function(data, status){
       $scope.registerMsg = 'Successfully registered!';
       alert('Successfully Registered, Please sign in.');
       $scope.username = data.username;
    }, function(data, status){
       $scope.registerMsg = 'Cannot Sign-up, please check the username!';
    });    
    console.log($scope.user);
  };  
    
  }]
);