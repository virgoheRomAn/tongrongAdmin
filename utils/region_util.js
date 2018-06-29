var request = require('request');
var config = require('config');


var getCityById = function(region, citiId) {
    var citys = region.city;
    for(var i=0; i<citys.length; i++){
        if(citys[i].cityId == citiId){
            return citys[i];
        }
    }
    return null;
};

exports.getCityById = getCityById;




