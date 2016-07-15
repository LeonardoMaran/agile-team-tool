// team modules
var common = require('./common-cloudant');
var _ = require('underscore');

var team = {
  getTeam : function(teamId, callback){
    if(_.isEmpty(teamId)){
      common.getByView('teams', 'teams', function(err, body){
        callback(err, body);
      });
    }else{
      common.getRecord(teamId, function(err, body){
        callback(err, body);
      });
    }
  },
  getRole : function(callback){
    common.getByView('agile', 'roles', function(err, body){
      callback(err, body);
    });
  },
  getName : function(callback){
    common.getByView('teams', 'getTeamNames', function(err, body){
      callback(err, body);
    });
  }
};

module.exports = team;