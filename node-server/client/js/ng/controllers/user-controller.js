angular.module('hnpApp').controller('userController',
  ['$scope', '$http', 'userService', 'User', '$location', '$window', '$modal', 'LoopBackAuth' , function ($scope, $http, userService, myUser, $location, $window, $modal, LoopBackAuth) {
    'use strict';
    
    
    var session = false;
    //var tokenId = $location.search().tkn;

    var userId = LoopBackAuth.currentUserId;
    if(userId != null){
      var currentUser = myUser.getCurrent();
      $scope.user = currentUser;
      session = true;
    }
    
    if(!session){
        $scope.opts = {
            backdrop: true,                         
            backdropClick: true,
            dialogFade: false,
            keyboard: true,
            templateUrl : '/invalidSession.html',
            //controller : 'sessionInvalidController',
            size: 'sm',
            resolve: {} // empty storage
        };

        var modalInstance = $modal.open($scope.opts);
        
        modalInstance.result.then(function(result){
            $window.location.href="/main.html";
        });
    
    }
    
    $scope.logout = function(){
        myUser.logout();
        $window.location.href="/main.html";
    }; 
  }]
);