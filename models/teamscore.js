var https = require('https');
var Promise = require('bluebird');
var settings = require('../settings');
var _ = require('underscore');
var validate = require('validate.js');
var request = require('request');
var msg = {
  'statusCode':0,
  'message':null
};
var teamDataConstrains = require('./validate_rules/teamscore.js').teamDataConstrains;
var timeZoneDiff = 25.0;
var timeZonePenalty = 0.75;
var locationPenalty = 0.5;

function getGpsCoordinate(location) {
  return new Promise(function(resolve, reject) {
    if (_.isEmpty(location)) {
      msg.statusCode = 401;
      msg.message = 'empty input';
      reject(msg);
    } else {
      var url = 'https://' + settings.googleHost + '/maps/api/geocode/json?address=' + location + '&key=' + settings.googleApiKey;
      var json;
      request.get(url, function(err, res, body){
        if (res.statusCode != 200) {
          msg.statusCode = res.statusCode;
          msg.message = 'can not get response';
          reject(msg);
        } else if (err) {
          if (err.statusCode) {
            msg.statusCode = err.statusCode;
          } else {
            msg.statusCode = 400;
          }
          msg.message = err;
          reject(msg);
        } else {
          try {
            json = JSON.parse(body);
          }
          catch (err) {
            if (err.statusCode) {
              msg.statusCode = err.statusCode;
            } else {
              msg.statusCode = 400;
            }
            msg.message = err;
            reject(msg);
          }
          if (json.status != 'OK') {
            msg.statusCode = 406;
            msg.message = 'cannot find matching gps coordinate';
            reject(msg);
          } else {
            resolve(json.results[0].geometry.location);
          }
        }
      });
    }
  });
};

function getTimeZ(coordinate) {
  return new Promise(function(resolve, reject){
    var timestamp = Math.floor(new Date().getTime()/1000);
    var url = 'https://' + settings.googleHost + '/maps/api/timezone/json?location=' + coordinate.lat + ',' + coordinate.lng + '&timestamp=' + timestamp + '&key=' + settings.googleApiKey;
    var json;
    request.get(url, function(err, res , body){
      if (res.statusCode != 200) {
        reject ('error: ' + res.statusCode);
      } else if (err) {
        reject (err);
      } else {
        try {
          json = JSON.parse(body);
        }
        catch (err) {
          reject (err);
        }
        //console.log(json);
        var time = json.rawOffset/3600+json.dstOffset/3600;
        var result = 'UTC'+time;
        resolve(result);
      }
    });
  });
};

function calculateScore(data) {
  return new Promise(function(resolve, reject){
    var validateResult = validate(data, teamDataConstrains);
    if (validateResult) {
      msg.statusCode = 406;
      msg.message = validateResult;
      reject (msg);
    } else {
      var sitesCount = {};
      var sitesTime = {};
      var mainSiteKey = Object.keys(data.mainSite)[0];
      var mainSiteValue = (data.mainSite[mainSiteKey]).substring(3,5);
      for (var i = 0; i < data.sites.length; i++) {
        var key = Object.keys(data.sites[i])[0];
        var value = (data.sites[i])[key];
        /* instabul ingore next */
        if (sitesCount[key]) {
          sitesCount[key] = sitesCount[key] + 1;
        } else {
          sitesCount[key] = 1;
        }
        if (!(sitesTime[key])) {
          sitesTime[key] = value.substring(3,5);
        }
      }
      var sitesKey = Object.keys(sitesCount);
      var calSum = 0.0;
      var totalSites = 0;
      for (var i = 0; i < sitesKey.length; i++) {
        totalSites = totalSites + sitesCount[sitesKey[i]];
        calSum = calSum + (1 - Math.abs(sitesTime[sitesKey[i]] - mainSiteValue) / timeZoneDiff * timeZonePenalty) * sitesCount[sitesKey[i]];
      }
      var calResult = (calSum - (sitesKey.length - 1) * locationPenalty)/ totalSites;
      var percentResult = Math.floor(calResult * 100);
      resolve (percentResult);
    }
  });
};


function analysePiechart(data) {
  //console.log(data);
  return new Promise(function(resolve, reject){
    var validateResult = validate(data, teamDataConstrains);
    if (validateResult) {
      msg.statusCode = 406;
      msg.message = validateResult;
      reject (msg);
    } else {
      var sitesCount = [];
      var sitesTime = [];
      for (var i = 0; i < data.sites.length; i++) {
        var key = Object.keys(data.sites[i])[0];
        var value = (data.sites[i])[key];
        sitesCount.push(key);
        sitesTime.push(value);
      }
      var sites = {};
      var timezone = {};
      for (var i = 0; i < sitesCount.length; i++) {
        /* instabul ingore next */
        if (sites[sitesCount[i]]) {
          sites[sitesCount[i]] = sites[sitesCount[i]] + 1;
        } else {
          sites[sitesCount[i]] = 1;
        }
        if (timezone[sitesTime[i]]) {
          timezone[sitesTime[i]] = timezone[sitesTime[i]] + 1;
        } else {
          timezone[sitesTime[i]] = 1;
        }
      }
      var result = {
        sites: sites,
        timezone: timezone
      };
      resolve (result);
    }
  });
};

function analyzeMapChart(data) {
  return new Promise(function(resolve, reject){
    var validateResult = validate(data, teamDataConstrains);
    if (validateResult) {
      msg.statusCode = 406;
      msg.message = validateResult;
      reject (msg);
    } else {
      var sitesCount = [];
      //var sitesTime = [];
      for (var i = 0; i < data.sites.length; i++) {
        var key = Object.keys(data.sites[i])[0];
        var value = (data.sites[i])[key];
        sitesCount.push(key);
        //sitesTime.push(value);
      }
      var sites = {};
      //var timezone = {};
      for (var i = 0; i < sitesCount.length; i++) {
        /* instabul ingore next */
        if (sites[sitesCount[i]]) {
          sites[sitesCount[i]] = sites[sitesCount[i]] + 1;
        } else {
          sites[sitesCount[i]] = 1;
        }
      }
      var result = {
        sites: sites
      };
      resolve (result);
    }
  });
};

var teamscore = {

  // transfer gps coordinate to time zone
  getTimezone: function(location) {
    return new Promise(function(resolve, reject) {
      var promiseArray = [];
      _.each(location, function(loc) {
        promiseArray.push(getGpsCoordinate(loc));
      });

      Promise.all(promiseArray)
        .then(function(coordinates){
          var promiseArray2 = [];
          _.each(coordinates, function(coordinate){
            promiseArray2.push(getTimeZ(coordinate));
          });
          Promise.all(promiseArray2)
            .then(function(timezones){
              resolve(timezones);
            })
            .catch(function(err){
              reject(err);
            });
        })
        .catch(function(err){
          reject(err);
        });
    });
  },

  calculateScoreByTimezone: function(location) {
    return new Promise(function(resolve, reject){
      teamscore.getTimezone(location)
        .then(function(timezones){
          var calData = {
            'mainSite' : {},
            'sites' : []
          };
          for (var i = 0; i < timezones.length; i++) {
            var site = {};
            site[location[i]] = timezones[i];
            /* instabul ingore next */
            if (i == 0) {
              if (calData['mainSite'] == 'UTCNaN') {
                calData['mainSite'] = 'UTC-4';
              } else {
                calData['mainSite'] = site;
              }
            } else {
              if (calData['sites'] != 'UTCNaN') {
                calData['sites'].push(site);
              }
            }
          }
          var promiseArray = [];
          promiseArray.push(calculateScore(calData));
          promiseArray.push(analysePiechart(calData));
          //promiseArray.push(analyzeMapChart(calData));
          Promise.all(promiseArray)
            .then(function(results){
              var returnObj = {
                'score': 0,
                'analyze': null
              };
              returnObj.score = results[0];
              returnObj.analyze = results[1];
              resolve(returnObj);
            })
            .catch(function(err){
              reject(err);
            });
          // calculateScore(calData)
          //   .then(function(results){
          //     resolve(results);
          //   })
          //   .catch(function(err){
          //     reject(err);
          //   });
        })
        .catch(function(err){
          reject(err);
        });
    });
  }
};

module.exports = teamscore;
