angular.module('hnpApp').service('utilityService', function() {
  
  // Define and Initialize the Data Elements
    
  //Define
  this.formatDate = function(dateToFormat) {
    var stringFormatted = '';             
    
    var month = dateToFormat.getMonth() + 1;
    var monthStr = '';
    if (month < 10) {
      monthStr = '0' + month;
    } else {
      monthStr = '' + month;
    }
    
    var day = dateToFormat.getDate();
    var dayStr = '';
    if (day < 10) {
      dayStr = '0' + day;
    } else{
      dayStr = '' + day;
    }  
    
    stringFormatted = dateToFormat.getFullYear() + '-' + monthStr + '-' + dayStr;
    return stringFormatted;
  };
  
  this.convertDateToStore = function(dateToFormat) {
    var stringFormatted = '';             
    
    var month = dateToFormat.getMonth() + 1;
    var monthStr = '';
    if (month < 10) {
      monthStr = '0' + month;
    } else {
      monthStr = '' + month;
    }
    
    var day = dateToFormat.getDate();
    var dayStr = '';
    if (day < 10) {
      dayStr = '0' + day;
    } else{
      dayStr = '' + day;
    } 
    
    stringFormatted = dateToFormat.getFullYear() + '' + monthStr + '' + dayStr;
    
    return stringFormatted;
  };
  
  this.formatDateString = function(input) {
      input = input + '';
      var year = input.substring(0,4);
      var month = input.substring(4,6);
      var day = input.substring(6,8);
     
      return year + '-' + (month) + '-' + day;
  };
  
  this.formatDateStringEnd = function(input) {
      input = input + '';
      if(input != '0'){
         var year = input.substring(0,4);
         var month = input.substring(4,6);
         var day = input.substring(6,8);
         var newDate = new Date(year, parseInt(month)-1, day, 0, 0, 0, 0);
         newDate.setDate(newDate.getDate() + 1);
         return newDate.getFullYear() + '-' + (newDate.getMonth()+1) + '-' + newDate.getDate();
      }
      else{
        return input;
      }
  };
  
  this.getDate = function(input) {
      input = input + '';
      var year = input.substring(0,4);
      var month = input.substring(4,6);
      var day = input.substring(6,8);
     
      return new Date(year, parseInt(month)-1, day, 0, 0, 0, 0);
  };
  
  this.formatTime = function(timeToFormat) {
    var stringFormatted = '';
    
    if(timeToFormat > 0){
      var timeStr = '' + timeToFormat;
      var hrs = '';
      var mins = '';
      if(timeStr.length == 4){
          hrs = timeStr.substring(0,2);
          mins = timeStr.substring(2,4);
      } else if(timeStr.length < 4 && timeStr.length > 2){
          hrs = '0' + timeStr.substring(0,1);
          mins = timeStr.substring(1,3);
      } else if (timeStr.lenth < 3 && timeStr.length > 1){
          hrs = '00';
          mins = timeStr.substring(0,2);
      
      } else if (timeStr.lenth < 2 && timeStr.length > 0){
          hrs = '00';
          mins = '0' + timeStr.substring(0,2);
      }
      
      stringFormatted = hrs + ':' + mins;
      
    }
    else{
      stringFormatted = '--:--';
      
    }
    return stringFormatted;
  }
  
  this.getElapsedTime = function (eventDate, eventTime) {
    var stringFormatted = '';
    eventDate = '' + eventDate;
    eventTime = '' + eventTime;
    
    var today = new Date();
    var eventTS = new Date(eventDate.substring(0,4), (eventDate.substring(4,6)-1), eventDate.substring(6,8), eventTime.substring(0,2), eventTime.substring(3,5), 0,0);
    
    var diff = (today - eventTS);
        
    var diffhrs = Math.floor(diff/1000/60/60);
    var diffmins = Math.floor((diff/1000/60/60 - diffhrs) * 60);
    
    var stringFormatted = diffhrs + ' hours and ' + diffmins + ' minutes';
    
    return stringFormatted;
      
  }
  
  this.daysRemaining = function (eventDate) {
    eventDate = '' + eventDate;
    
    var today = new Date();
    var eventTS = new Date(eventDate.substring(0,4), (eventDate.substring(4,6)-1), eventDate.substring(6,8), 0, 0, 0,0);
    
    var diff = (eventTS - today);
    
    var diffDays = Math.floor(diff/1000/60/60/24);
    
    return diffDays;
    
  }
    
});