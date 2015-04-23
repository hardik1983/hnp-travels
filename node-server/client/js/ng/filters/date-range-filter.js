angular.module('hnpApp').filter("dateRange", function() {
  return function(items, currentDate) {
        var intDate = currentDate.replace(/-/g,'');
        var result = [];
      
        var formatDate = function(input){
          input = input + '';
           var year = input.substring(0,4);
           var month = input.substring(4,6);
           var day = input.substring(6,8);
           
           return day + '-' + month + '-' + year;
        };

        for (var id in items){
            
            var tf = items[id].eventDate;
            var tt = items[id].dropOffDate;
            if (tf <= intDate && tt >= intDate)  {
                items[id].fEventDate = formatDate(tf);
                items[id].fDropOffDate = formatDate(tt);
                result.push(items[id]);
            }
        }     
        return result;
  };
});