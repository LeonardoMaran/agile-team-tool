var _          = require('underscore');
var moment     = require('moment');
var moment = require('moment-timezone');



module.exports = {
   stringToUtcDate: function(string){
    if(_.isEmpty(string)||!moment(string).isValid()){
      //console.log("invalid string " + string);
      return undefined;
    }
    else if(string.indexOf('UTC') > 0)
      return new Date(moment.utc(string).format());
    else if(string.indexOf('EST') > 0 || string.indexOf('EDT') > 0)
      return new Date(moment(string).utc().format());
    else if(string.indexOf('SGT') > 0){
      return new Date(moment.tz(string, "Asia/Singapore").utc().format());
      //console.log(string + " -------- " + new Date(newString))
    }
    else if(string.indexOf('adm') > 0) //convert to utc for this case
      return new Date(moment(string).utc().format());
    else if(string.indexOf('UTC') < 0 && string.indexOf('EST') < 0 && string.indexOf('EDT') < 0){ //homer said assume UTC
      //console.log("warning: not UTC, ETC/EDT, SGT, adm: " + string +". will try to set to: " + new Date(moment.utc(string).format()));
      return moment.utc(string).format() === 'Invalid date' ? undefined : new Date(moment.utc(string).format());
    }
  }
};