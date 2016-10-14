var Promise = require('bluebird');
var common = require('./cloudant-driver');
var _ = require('underscore');
var loggers = require('../middleware/logger');
var util = require('../helpers/util');
var iterationModel = require('./iteration');
var teamModel = require('./teams');
var assessmentModel = require('./assessment');
var moment = require('moment');
var validate = require('validate.js');

var iterationMonth = 5;
var prefix = 'ag_iter_data_';
var squad_prefix = 'ag_squad_data_';
var timestamp = Math.floor(Date.now() / 1000);
var iterationDocRules = require('./validate_rules/iteration.js');
var snapshotValidationRules = require('./validate_rules/snapshot.js');
var nonSquadTeamRule = snapshotValidationRules.nonSquadTeamRule;
var squadTeamRule = snapshotValidationRules.squadTeamRule;
var monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
var monthArray = [];
var ASSESSMENT_MAX_DAYS_SUBMISSION = 120;
var ASSESSMENT_PERIOD = 5;
var ASSESSMENT_ROLLUP_PREFIX = 'ag_mar_data_';
var assessmentMonths = [];

var formatErrMsg = /* istanbul ignore next */ function(msg) {
  loggers.get('models').error('Error: ', msg);
  return {
    error: msg
  };
};

var successLogs = /* istanbul ignore next */ function(msg) {
  loggers.get('models').verbose('Success: ' + msg);
  return;
};

var infoLogs = /* istanbul ignore next */ function(msg) {
  loggers.get('models').verbose(msg);
  return;
};

function resetData() {
  return [{
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false

  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }, {
    'totalPoints': 0,
    'totalCommPoints': 0,
    'totalStories': 0,
    'totalCommStories': 0,
    'totalCompleted': 0,
    'totalDefectsStartBal': 0,
    'totalDefects': 0,
    'totalDefectsClosed': 0,
    'totalDefectsEndBal': 0,
    'totalDplymts': 0,
    'totTeamStat': 0,
    'totClientStat': 0,
    'totTeamStatIter': 0,
    'totClientStatIter': 0,
    'totCycleTimeBacklog': 0,
    'totCycleTimeWIP': 0,
    'totCycleTimeBacklogIter': 0,
    'totCycleTimeWIPIter': 0,
    'teamsLt5': 0,
    'teams5to12': 0,
    'teamsGt12': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }];
};

/**
 * Get completed iteration docs from startTime to endTime,
 * and seperate them by team.
 * @param string startTime (03/18/2016)
 * @param string endTime (08/18/2016)
 * @return Object squadIterationDocs
 */
function getIterationDocs(startTime, endTime) {
  var squadIterationDocs = {};
  return new Promise(function(resolve, reject) {
    iterationModel.getCompletedIterationsByKey(startTime, endTime)
      .then(function(completedIterations) {
        _.each(completedIterations.rows, function(doc) {
          // var validationErrors = validate(doc.value, iterationDocRules);
          // if (!validationErrors) {
          if (doc.value.team_id != '') {
            var teamId = doc.value.team_id;
            if (_.isEmpty(squadIterationDocs[teamId])) {
              squadIterationDocs[teamId] = [];
            }
            squadIterationDocs[teamId].push(doc.value);
          }
          // }
        });
        return resolve(squadIterationDocs);
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

/**
 * Get all squads teams and return an Object [{parantId, [squads]},...]
 * @return Array squadTeams
 */
function getAllSquads() {
  return new Promise(function(resolve, reject) {
    var promiseArray = [];
    promiseArray.push(teamModel.getNonSquadTeams());
    promiseArray.push(teamModel.getSquadTeams());
    Promise.all(promiseArray)
      .then(function(results){
        var squadsByParent = {};
        var nonSquadTeams = results[0];
        var squadTeams = results[1];
        _.each(nonSquadTeams.rows, function(nonSquadTeam) {
          if (!(_.isUndefined(nonSquadTeam.value._id)) && !(_.isEmpty(nonSquadTeam.value._id))) {
            var id = nonSquadTeam.value._id;
            squadsByParent[id] = [];
          }
        });
        _.each(squadTeams.rows, function(squadTeam) {
          if (squadTeam.value.squadteam == 'Yes') {
            _.each(squadTeam.value.parents, function(parent) {
              if (!_.isUndefined(squadsByParent[parent])) {
                squadsByParent[parent].push(squadTeam.value._id);
              }
            });
          }
        });
        resolve(squadsByParent);
      })
      .catch( /* istanbul ignore next */ function(err){
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

function getIntegerValue(fieldValue) {
  var value = 0;
  if (!_.isUndefined(fieldValue) && !isNaN(parseInt(fieldValue)))
    value = parseInt(fieldValue);
  return value;
}

function getFloatValue(fieldValue) {
  var value = 0;
  if (!_.isUndefined(fieldValue) && !isNaN(parseFloat(fieldValue)))
    value = parseFloat(fieldValue);
  return value;
}


/**
 * Roll up iteration docs data in the same squad
 * @param Array iterationDocs
 * @param string teamId (nonsquad team id)
 * @return Object rollUpIterationsData
 */
function rollUpIterationsBySquad(iterationDocs, teamId) {
  return new Promise(function(resolve, reject) {
    var currData = resetData();
    var rollUpIterationsData = {};
    rollUpIterationsData[teamId] = currData;
    var currDate = new Date();
    _.each(iterationDocs, function(iterationDoc) {
      var iterationDocDate = new Date(iterationDoc['iteration_end_dt']);
      var iterationDocIndex = 5 - monthDiff(iterationDocDate, currDate);
      if (iterationDocIndex < 0 || iterationDocIndex > iterationMonth) {
        var msg = 'iteationDoc: ' + iterationDoc._id + ' end date is not correct';
        console.log(msg);
        //reject(formatErrMsg(msg));
      } else {
        if (!isNaN(iterationDocIndex)) {
          var pts = getIntegerValue(iterationDoc['nbr_story_pts_dlvrd']);
          var commPts = getIntegerValue(iterationDoc['nbr_committed_story_pts']);
          var stories = getIntegerValue(iterationDoc['nbr_stories_dlvrd']);
          var commStories = getIntegerValue(iterationDoc['nbr_committed_stories']);
          var teamCnt = getIntegerValue(iterationDoc['team_mbr_cnt']);
          var defectsStartBal = getIntegerValue(iterationDoc['nbr_defects_start_bal']);
          var defects = getIntegerValue(iterationDoc['nbr_defects']);
          var defectsClosed = getIntegerValue(iterationDoc['nbr_defects_closed']);
          var defectsEndBal = getIntegerValue(iterationDoc['nbr_defects_end_bal']);
          var dplymnts = getIntegerValue(iterationDoc['nbr_dplymnts']);
          var teamStat = getFloatValue(iterationDoc['team_sat']);
          var clientStat = getFloatValue(iterationDoc['client_sat']);
          var cycleTimeBacklog = getFloatValue(iterationDoc['nbr_cycletime_in_backlog']);
          var cycleTimeWIP = getFloatValue(iterationDoc['nbr_cycletime_WIP']);

          currData[iterationDocIndex].totalPoints = currData[iterationDocIndex].totalPoints + pts;
          currData[iterationDocIndex].totalCommPoints = currData[iterationDocIndex].totalCommPoints + commPts;
          currData[iterationDocIndex].totalStories = currData[iterationDocIndex].totalStories + stories;
          currData[iterationDocIndex].totalCommStories = currData[iterationDocIndex].totalCommStories + commStories;
          currData[iterationDocIndex].totalDefectsStartBal = currData[iterationDocIndex].totalDefectsStartBal + defectsStartBal;
          currData[iterationDocIndex].totalDefects = currData[iterationDocIndex].totalDefects + defects;
          currData[iterationDocIndex].totalDefectsClosed = currData[iterationDocIndex].totalDefectsClosed + defectsClosed;
          currData[iterationDocIndex].totalDefectsEndBal = currData[iterationDocIndex].totalDefectsEndBal + defectsEndBal;
          currData[iterationDocIndex].totalDplymts = currData[iterationDocIndex].totalDplymts + dplymnts;

          if (teamStat > 0) {
            currData[iterationDocIndex].totTeamStat = currData[iterationDocIndex].totTeamStat + teamStat;
            currData[iterationDocIndex].totTeamStatIter = currData[iterationDocIndex].totTeamStatIter + 1;
          }
          if (clientStat > 0) {
            currData[iterationDocIndex].totClientStat = currData[iterationDocIndex].totClientStat + clientStat;
            currData[iterationDocIndex].totClientStatIter = currData[iterationDocIndex].totClientStatIter + 1;
          }
          if (cycleTimeBacklog > 0) {
            currData[iterationDocIndex].totCycleTimeBacklog = currData[iterationDocIndex].totCycleTimeBacklog + cycleTimeBacklog;
            currData[iterationDocIndex].totCycleTimeBacklogIter = currData[iterationDocIndex].totCycleTimeBacklogIter + 1;
          }
          if (cycleTimeWIP > 0) {
            currData[iterationDocIndex].totCycleTimeWIP = currData[iterationDocIndex].totCycleTimeWIP + cycleTimeWIP;
            currData[iterationDocIndex].totCycleTimeWIPIter = currData[iterationDocIndex].totCycleTimeWIPIter + 1;
          }

          if (teamCnt > 0) {
            if (teamCnt < 5) {
              currData[iterationDocIndex].teamsLt5 = currData[iterationDocIndex].teamsLt5 + 1;
            } else if (teamCnt > 12) {
              currData[iterationDocIndex].teamsGt12 = currData[iterationDocIndex].teamsGt12 + 1;
            } else {
              currData[iterationDocIndex].teams5to12 = currData[iterationDocIndex].teams5to12 + 1;
            }
          }
          currData[iterationDocIndex].totalCompleted = currData[iterationDocIndex].totalCompleted + 1;
        }
      }
    });
    resolve(rollUpIterationsData);
  });
};

/**
 * Roll up squads data together by non-squad team
 * @param Object squads
 * @param string teamId (non-squad team id)
 * @param Object squadsCalResults
 * @return nonSquadCalResult
 */
function rollUpIterationsByNonSquad(squads, nonSquadTeamId, squadsCalResults, isUpdate, oldRollUpDataRev) {
  return new Promise(function(resolve, reject) {
    var squadDoc = squads;
    var currData = resetData();
    var nonSquadCalResult = {
      '_id': prefix + nonSquadTeamId,
      'value': currData,
      'team_id': nonSquadTeamId,
      'timestamp': timestamp,
      'type': 'roll_up_data'
    };
    var teams = [];
    for (var i = 0; i <= iterationMonth; i++) {
      teams.push(0);
    }
    for (var i = 0; i < squadDoc.length; i++) {
      for (var j = 0; j <= iterationMonth; j++) {
        if (!(_.isEmpty(squadsCalResults[squadDoc[i]])) && !(_.isUndefined(squadsCalResults[squadDoc[i]]))) {
          var squadIterationResult = squadsCalResults[squadDoc[i]];
          currData[j].totalPoints = currData[j].totalPoints + squadIterationResult[j].totalPoints;
          currData[j].totalCommPoints = currData[j].totalPoints + squadIterationResult[j].totalCommPoints;
          currData[j].totalStories = currData[j].totalStories + squadIterationResult[j].totalStories;
          currData[j].totalCommStories = currData[j].totalStories + squadIterationResult[j].totalCommStories;
          currData[j].totalDefectsStartBal = currData[j].totalDefectsStartBal + squadIterationResult[j].totalDefectsStartBal;
          currData[j].totalDefects = currData[j].totalDefects + squadIterationResult[j].totalDefects;
          currData[j].totalDefectsClosed = currData[j].totalDefectsClosed + squadIterationResult[j].totalDefectsClosed;
          currData[j].totalDefectsEndBal = currData[j].totalDefectsEndBal + squadIterationResult[j].totalDefectsEndBal;
          currData[j].totalDplymts = currData[j].totalDplymts + squadIterationResult[j].totalDplymts;
          currData[j].totTeamStat = currData[j].totTeamStat + squadIterationResult[j].totTeamStat;
          currData[j].totTeamStatIter = currData[j].totTeamStatIter + squadIterationResult[j].totTeamStatIter;
          currData[j].totClientStat = currData[j].totClientStat + squadIterationResult[j].totClientStat;
          currData[j].totClientStatIter = currData[j].totClientStatIter + squadIterationResult[j].totClientStatIter;
          currData[j].totCycleTimeBacklog = currData[j].totCycleTimeBacklog + squadIterationResult[j].totCycleTimeBacklog;
          currData[j].totCycleTimeBacklogIter = currData[j].totCycleTimeBacklogIter + squadIterationResult[j].totCycleTimeBacklogIter;
          currData[j].totCycleTimeWIP = currData[j].totCycleTimeWIP + squadIterationResult[j].totCycleTimeWIP;
          currData[j].totCycleTimeWIPIter = currData[j].totCycleTimeWIPIter + squadIterationResult[j].totCycleTimeWIPIter;
          currData[j].teamsLt5 = currData[j].teamsLt5 + squadIterationResult[j].teamsLt5;
          currData[j].teamsGt12 = currData[j].teamsGt12 + squadIterationResult[j].teamsGt12;
          currData[j].teams5to12 = currData[j].teams5to12 + squadIterationResult[j].teams5to12;
          currData[j].totalCompleted = currData[j].totalCompleted + squadIterationResult[j].totalCompleted;
          if (squadIterationResult[j].totalCompleted > 0) {
            teams[j] = teams[j] + 1;
          }
        }
      }
    }
    var newDate = new Date();
    var days = daysInMonth(newDate.getMonth() + 1, newDate.getFullYear());
    if (newDate.getDate() < days) {
      currData[iterationMonth].partialMonth = true;
    }
    for (var i = 0; i <= iterationMonth; i++) {
      currData[i].totalSquad = teams[i];
      currData[i].month = monthArray[i];
      if (currData[i].totTeamStatIter > 0) {
        currData[i].totTeamStat = currData[i].totTeamStat / currData[i].totTeamStatIter;
      }
      if (currData[i].totClientStatIter > 0) {
        currData[i].totClientStat = currData[i].totClientStat / currData[i].totClientStatIter;
      }
      if (currData[i].totCycleTimeBacklogIter > 0) {
        currData[i].totCycleTimeBacklog = currData[i].totCycleTimeBacklog / currData[i].totCycleTimeBacklogIter;
      }
      if (currData[i].totCycleTimeWIPIter > 0) {
        currData[i].totCycleTimeWIP = currData[i].totCycleTimeWIP / currData[i].totCycleTimeWIPIter;
      }
    }

    if (isUpdate) {
      if (!(_.isEmpty(oldRollUpDataRev)) && !(_.isUndefined(oldRollUpDataRev))) {
        nonSquadCalResult._rev = oldRollUpDataRev;
      }
    }
    resolve(nonSquadCalResult);
  });
};

/**
 * Get _rev for roll up data
 * @return Object {teamid:_rev}
 */
function getRollUpDataHistory() {
  return new Promise(function(resolve, reject) {
    common.getByView('iterations', 'rollUpData')
      .then(function(oldRollUpData) {
        var rollUpDataRevs = {};
        _.each(oldRollUpData.rows, function(data) {
          rollUpDataRevs[data.value._id] = data.value._rev;
        });
        resolve(rollUpDataRevs);
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
}
/**
 * Calculate month different
 * @param date d1 (start time)
 * @param date d2 (end time)
 * @return int months
 */
function monthDiff(d1, d2) {
  var months;
  months = (d2.getFullYear() - d1.getFullYear()) * 12;
  months -= d1.getMonth();
  months += d2.getMonth();
  return months;
};

/**
 * Get a dateobject (Six months previous) from another date object
 * @param date date
 * @param int months
 * @return date newDate
 */
function addMonths(date, months) {
  var newDate = new Date();
  newDate.setDate(1);
  newDate.setMonth(date.getMonth() + months);
  return new Date(newDate);
};

/**
 * Get how many days in the month
 * @param int month
 * @param int year
 * @return int days
 */
function daysInMonth(month, year) {
  return new Date(year, month, 0).getDate();
}

/**
 * Get _rev for roll up squads
 * @return Object {teamid:_rev}
 */
function getRollUpSquadsHistory() {
  return new Promise(function(resolve, reject) {
    common.getByView('iterations', 'rollUpSquads')
      .then(function(oldRollUpData) {
        var rollUpDataRevs = new Object();
        _.each(oldRollUpData.rows, function(data) {
          rollUpDataRevs[data.value._id] = data.value._rev;
        });
        resolve(rollUpDataRevs);
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

/**
 * Get suqad team data
 * @return Object squadTeams
 */
function getSquadsData() {
  var squadTeams = new Object();
  return new Promise(function(resolve, reject) {
    teamModel.getTeam()
      .then(function(teams) {
        if (teams.length <= 0) {
          var msg;
          msg = 'No team found';
          reject(formatErrMsg(msg));
        } else {
          _.each(teams, function(team) {
            if ((team.value.squadteam != undefined) && ((team.value.squadteam).toLowerCase() == 'yes')) {
              squadTeams[team.value._id] = team.value;
            }
          });
          resolve(squadTeams);
        }
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

/**
 * Roll up total_members and total_allocation data
 * @param Array squadsList
 * @param Object squadTeams
 * @return Object entry
 */
function rollUpSquadsData(squadsList, squadTeams) {
  var entry = new Object();
  var teamsLt5 = 0;
  var teams5to12 = 0;
  var teamsGt12 = 0;
  var tcLt5 = 0;
  var tc5to12 = 0;
  var tcGt12 = 0;
  var fteLt5 = 0;
  var fte5to12 = 0;
  var fteGt12 = 0;

  _.each(squadsList, function(squadId) {
    squad = squadTeams[squadId];
    // var teamCnt = squad['total_members'] != null ? squad['total_members'] : 0;
    // var teamFTE = squad['total_allocation'] != null ? squad['total_allocation'] : 0;
    var teamCnt = getIntegerValue(squad['total_members']);
    var teamFTE = getFloatValue(squad['total_allocation']);

    if (teamCnt < 5) {
      teamsLt5 = teamsLt5 + 1;
      fteLt5 = fteLt5 + teamFTE;
      tcLt5 = tcLt5 + teamCnt;
    } else if (teamCnt > 12) {
      teamsGt12 = teamsGt12 + 1;
      fteGt12 = fteGt12 + teamFTE;
      tcGt12 = tcGt12 + teamCnt;

    } else {
      teams5to12 = teams5to12 + 1;
      fte5to12 = fte5to12 + teamFTE;
      tc5to12 = tc5to12 + teamCnt;
    }
  });

  entry.teamsLt5 = teamsLt5;
  entry.tcLt5 = tcLt5;
  entry.fteLt5 = fteLt5;

  entry.teams5to12 = teams5to12;
  entry.tc5to12 = tc5to12;
  entry.fte5to12 = fte5to12;

  entry.teamsGt12 = teamsGt12;
  entry.tcGt12 = tcGt12;
  entry.fteGt12 = fteGt12;

  return entry;
};

function getSubmittedAssessments() {
  var squadAssessments = {};
  return new Promise(function(resolve, reject) {
    assessmentModel.getSubmittedAssessments()
      .then(function(assessments) {
        _.each(assessments.rows, function(doc) {
          var teamId =  doc.value.team_id;
          if ( teamId != '') {
            if (_.isEmpty(squadAssessments[teamId])) {
              squadAssessments[teamId] = [];
            }
            squadAssessments[teamId].push(doc.value);
          }
        });
        return resolve(squadAssessments);
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

function getAssessmentRollUpDataHistory() {
  return new Promise(function(resolve, reject) {
    common.getByView('assessments', 'rollUpData')
      .then(function(oldRollUpData) {
        var rollUpDataRevs = {};
        _.each(oldRollUpData.rows, function(data) {
          rollUpDataRevs[data.value._id] = data.value._rev;
        });
        resolve(rollUpDataRevs);
      })
      .catch( /* istanbul ignore next */ function(err) {
        var msg;
        if (err.error) {
          msg = err.error;
        } else {
          msg = err;
        }
        reject(formatErrMsg(msg));
      });
  });
};

function rollUpAssessmentsBySquad(assessments, teamId) {
  return new Promise(function(resolve, reject) {
    var currData = resetAssessmentData();
    var rollUpAssessmentData = {};
    rollUpAssessmentData[teamId] = currData;

    _.each(assessments, function(assessment ) {
      var assessmentDate = new Date(assessment['self-assessmt_dt']);
      for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
        var period = assessmentMonths[i];
        var month = monthNames.indexOf(period.substring(0, period.indexOf(' ')));

        var year = period.substring(period.indexOf(' '), period.length);
        var date;
        var nowTime = new Date();
        if (month == nowTime.getMonth()){
          date = nowTime.getDate();
        }
        else {
          date = daysInMonth(month + 1, year);
        }

        var targetDate = new Date(year, month, date);
        if ((assessmentDate.getFullYear() == year && assessmentDate.getMonth() <= month) ||
          assessmentDate.getFullYear() < year){
          var days = daysDiff(targetDate, assessmentDate);
          if (days <= ASSESSMENT_MAX_DAYS_SUBMISSION){
            currData[i].less_120_days += 1;
          }
          else {
            currData[i].gt_120_days += 1;
          }
        }
        else {
          continue;
        }
      }
    });

    _.each(currData, function(period, index) {
      if (period.less_120_days >= 1){
        period.less_120_days = 1;
        period.gt_120_days = 0;
        period.no_submission = 0;
      }
      else if (period.gt_120_days >= 1 &&
        currData[index].less_120_days == 0){
        period.gt_120_days = 1;
        period.no_submission = 0;
      }
      else {
        period.no_submission = 1;
      }
    });
    resolve(rollUpAssessmentData);
  });
};

function rollUpAssessmentsByNonSquad(squads, nonSquadTeamId, squadsCalResults, isUpdate, oldRollUpDataRev) {
  return new Promise(function(resolve, reject) {
    var squadDoc = squads;
    var currData = resetAssessmentData();
    var nonSquadCalResult = {
      '_id': ASSESSMENT_ROLLUP_PREFIX + nonSquadTeamId,
      'value': currData,
      'team_id': nonSquadTeamId,
      'timestamp': timestamp,
      'type': 'assessment_roll_up_data'
    };

    for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
      currData[i].totalSquad = squadDoc.length;
      currData[i].month = assessmentMonths[i];
    }

    for (var i = 0; i < squadDoc.length; i++) {
      for (var j = 0; j <= ASSESSMENT_PERIOD; j++) {
        var squadAssessmentResult = squadsCalResults[squadDoc[i]];
        if (!(_.isEmpty(squadAssessmentResult)) && !(_.isUndefined(squadAssessmentResult))) {
          currData[j].less_120_days += squadAssessmentResult[j].less_120_days;
          currData[j].gt_120_days += squadAssessmentResult[j].gt_120_days;
          currData[j].no_submission += squadAssessmentResult[j].no_submission;
        }
        else {
          currData[j].no_submission += 1;
        }
      }
    }
    var newDate = new Date();
    var days = daysInMonth(newDate.getMonth() + 1, newDate.getFullYear());
    if (newDate.getDate() < days) {
      currData[ASSESSMENT_PERIOD].partialMonth = true;
    }

    if (isUpdate) {
      if (!(_.isEmpty(oldRollUpDataRev)) && !(_.isUndefined(oldRollUpDataRev))) {
        nonSquadCalResult._rev = oldRollUpDataRev;
      }
    }
    resolve(nonSquadCalResult);
  });
};

function daysDiff(date1, date2) {
  var dateFormat = 'YYYY-MM-DD';
  var d1 = moment(date1, dateFormat);
  var d2 = moment(date2, dateFormat);
  var days = moment(d1).diff(d2, 'days');
  return days;
};

function resetAssessmentData() {
  return [{
    'less_120_days': 0,
    'gt_120_days': 0,
    'no_submission': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }, {
    'less_120_days': 0,
    'gt_120_days': 0,
    'no_submission': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }, {
    'less_120_days': 0,
    'gt_120_days': 0,
    'no_submission': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }, {
    'less_120_days': 0,
    'gt_120_days': 0,
    'no_submission': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }, {
    'less_120_days': 0,
    'gt_120_days': 0,
    'no_submission': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }, {
    'less_120_days': 0,
    'gt_120_days': 0,
    'no_submission': 0,
    'totalSquad': 0,
    'month': '',
    'partialMonth': false
  }];
};

var snapshot = {

  /**
   * Getting the top level teams for the user,
   * this is used in 'my teams tab'.
   * @param String email
   * @return Array rootTeams
   */
  getTopLevelTeams: function(email) {
    return new Promise(function(resolve, reject) {
      var newTeams = [];
      teamModel.getTeamByEmail(email)
        .then(function(teams){
          var requestKeys = [];
          _.each(teams, function(team){
            newTeams.push(team.value);
            requestKeys.push(team.id);
            //promiseArray.push(common.getByViewKey('teams', 'lookup', team.id));
          });
          return common.getByViewKeys('teams', 'lookup', requestKeys);
        })
        .then(function(docs){
          var strTeams = [];
          _.each(docs.rows, function(doc){
            strTeams.push(doc.value);
          });
          var childrenList = _.flatten(_.pluck(strTeams, 'children'));
          var rootTeams = [];
          _.each(newTeams, function(team) {
            if (childrenList.indexOf(team._id) == -1) {
              team.parents = [];
              if (team.parent_team_id != '') {
                team.parents.push(team.parent_team_id);
              }
              team.children = team.child_team_id;
              rootTeams.push(team);
            }
          });
          rootTeams = _.uniq(rootTeams);
          resolve(rootTeams);
        })
        .catch( /* istanbul ignore next */ function(err){
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  /**
   * Roll up the number of the team members and FTE to the non-squad teams.
   * @return Array _revs (return rev if successfully update)
   */
  updateRollUpSquads: function() {
    return new Promise(function(resolve, reject) {
      timestamp = Math.floor(Date.now() / 1000);
      var squadTeams = new Object();
      var oldRollUpDataRevs = new Object();
      var promiseArray = [];
      var nonsquadsScore = [];
      promiseArray.push(getSquadsData());
      promiseArray.push(getRollUpSquadsHistory());
      Promise.all(promiseArray)
        .then(function(results) {
          squadTeams = results[0];
          oldRollUpDataRevs = results[1];
          return getAllSquads();
        })
        .then(function(squadsByParent){
          _.each(Object.keys(squadsByParent), function(nonsquadId) {
            var score = rollUpSquadsData(squadsByParent[nonsquadId], squadTeams);
            var entry = new Object();
            if (!_.isEmpty(oldRollUpDataRevs[squad_prefix + nonsquadId])) {
              entry['_rev'] = oldRollUpDataRevs[squad_prefix + nonsquadId];
            }
            entry['_id'] = squad_prefix + nonsquadId;
            entry['team_id'] = nonsquadId;
            entry['type'] = 'roll_up_squads';
            entry['timestamp'] = timestamp;
            entry['value'] = score;
            nonsquadsScore.push(entry);
          });
          var updateRequest = {
            'docs': nonsquadsScore
          };
          return common.bulkUpdate(updateRequest);
        })
        .then(function(results){
          resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  /**
   * Get non-squad's the number of team members and FTE using team id.
   * @param String teamId
   * @param Object rollUpData
   */
  getRollUpSquadsByTeam: function(teamId) {
    return new Promise(function(resolve, reject) {
      rollUpDataId = 'ag_squad_data_' + teamId;
      common.getByViewKey('iterations', 'rollUpSquads', rollUpDataId)
        .then(function(rollUpData) {
          resolve(rollUpData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  /**
   * Roll up data to the non-squads.
   * @return Array _revs (return rev if successfully update)
   */
  updateRollUpData: function() {
    return new Promise(function(resolve, reject) {
      timestamp = Math.floor(Date.now() / 1000);
      iterationMonth = 5;
      monthArray = [];
      var options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };
      var nowTime = new Date();
      var endTime = nowTime.toLocaleDateString('en-US', options);
      var startTime = new Date();
      startTime = new Date(startTime.setDate(1));
      startTime = new Date(startTime.setMonth(nowTime.getMonth() - iterationMonth));
      startTime = startTime.toLocaleDateString('en-US', options);

      // var nowTime = new Date();
      // var startTime = addMonths(nowTime, -iterationMonth);
      // var endTime = nowTime.toLocaleDateString('en-US',options);
      // startTime = startTime.toLocaleDateString('en-US',options);

      for (var i = 0; i <= iterationMonth; i++) {
        var time = (addMonths(nowTime, -(iterationMonth - i))).toLocaleDateString('en-US', options);
        var month = monthNames[parseInt(time.substring(0, 2)) - 1];
        var year = time.substring(time.length - 4, time.length);
        monthArray[i] = month + '-' + year;
      }
      var promiseArray = [];
      var squadIterationDocs = {};
      var oldRollUpDataRevs = {};
      var squadsByParent = {};
      promiseArray.push(getIterationDocs(startTime, endTime));
      promiseArray.push(getAllSquads());
      promiseArray.push(getRollUpDataHistory());
      Promise.all(promiseArray)
        .then(function(promiseResults) {
          squadIterationDocs = promiseResults[0];
          squadsByParent = promiseResults[1];
          oldRollUpDataRevs = promiseResults[2];
          var promiseArray2 = [];
          _.each(Object.keys(squadIterationDocs), function(squadTeamId) {
            promiseArray2.push(rollUpIterationsBySquad(squadIterationDocs[squadTeamId], squadTeamId));
          });
          return Promise.all(promiseArray2);
        })
        .then(function(squadsCalResultsArray){
          var squadsCalResults = {};
          _.each(squadsCalResultsArray, function(squadsCalResult) {
            squadsCalResults[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
          });
          var promiseArray3 = [];
          _.each(Object.keys(squadsByParent), function(nonSquadTeamId) {
            promiseArray3.push(rollUpIterationsByNonSquad(squadsByParent[nonSquadTeamId], nonSquadTeamId, squadsCalResults, true, oldRollUpDataRevs[prefix + nonSquadTeamId]));
          });
          return Promise.all(promiseArray3);
        })
        .then(function(nonSquadCalResults){
          var updateRequest = {
            'docs': nonSquadCalResults
          };
          return common.bulkUpdate(updateRequest);
        })
        .then(function(results){
          resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  /**
   * Get non-squad's roll up data using team id.
   * @param String teamId
   * @param Object rollUpData
   */
  getRollUpDataByTeam: function(teamId) {
    return new Promise(function(resolve, reject) {
      rollUpDataId = 'ag_iter_data_' + teamId;
      common.getByViewKey('iterations', 'rollUpData', rollUpDataId)
        .then(function(rollUpData) {
          resolve(rollUpData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  completeIterations: function() {
    return new Promise(function(resolve, reject) {
      common.getByView('iterations', 'notCompleted')
        .then(function(data) {
          var iterations = util.returnObject(data);
          var completedIterations = [];
          /* istanbul ignore if */
          if (!_.isEmpty(iterations)) {
            _.each(iterations, function(iteration){
              var status = iterationModel.calculateStatus(iteration);
              if (!_.isEqual(iteration['iterationinfo_status'], status)) {
                iteration['iterationinfo_status'] = status;
                completedIterations.push(iteration);
              }
            });
            completedIterations = util.formatForBulkTransaction(completedIterations, 'batch', 'update');
          }
          return completedIterations;
        })
        .then(function(data) {
          /* istanbul ignore if */
          if (!_.isEmpty(data))
            data = common.bulkUpdate(data);

          return (data);
        })
        .then(function(data) {
          resolve(data);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  updateAssessmentRollUpData: function() {
    return new Promise(function(resolve, reject) {
      var nowTime = new Date();
      var options = {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
      };

      for (var i = 0; i <= ASSESSMENT_PERIOD; i++) {
        var time = (addMonths(nowTime, -(ASSESSMENT_PERIOD - i))).toLocaleDateString('en-US', options);
        var month = monthNames[parseInt(time.substring(0, 2)) - 1];
        var year = time.substring(time.length - 4, time.length);
        assessmentMonths[i] = month + ' ' + year;
      }

      var promiseArray = [];
      var squadAssessments = {};
      var oldRollUpDataRevs = {};
      var squadsByParent = {};
      promiseArray.push(getSubmittedAssessments());
      promiseArray.push(getAllSquads());
      promiseArray.push(getAssessmentRollUpDataHistory());
      Promise.all(promiseArray)
        .then(function(promiseResults) {
          squadAssessments = promiseResults[0];
          squadsByParent = promiseResults[1];
          oldRollUpDataRevs = promiseResults[2];
          var promiseArray2 = [];
          _.each(Object.keys(squadAssessments), function(squadTeamId) {
            promiseArray2.push(rollUpAssessmentsBySquad(squadAssessments[squadTeamId], squadTeamId));
          });
          return Promise.all(promiseArray2);
        })
        .then(function(squadsCalResultsArray){
          var squadsCalResults = {};
          _.each(squadsCalResultsArray, function(squadsCalResult) {
            squadsCalResults[Object.keys(squadsCalResult)[0]] = squadsCalResult[Object.keys(squadsCalResult)[0]];
          });
          var promiseArray3 = [];
          _.each(Object.keys(squadsByParent), function(nonSquadTeamId) {
            promiseArray3.push(rollUpAssessmentsByNonSquad(squadsByParent[nonSquadTeamId], nonSquadTeamId, squadsCalResults, true, oldRollUpDataRevs[ASSESSMENT_ROLLUP_PREFIX + nonSquadTeamId]));
          });
          return Promise.all(promiseArray3);
        })
        .then(function(nonSquadCalResults){
          var updateRequest = {
            'docs': nonSquadCalResults
          };
          return common.bulkUpdate(updateRequest);
        })
        .then(function(results){
          resolve(results);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  getAssessmentRollUpByTeam: function(teamId) {
    return new Promise(function(resolve, reject) {
      var rollUpDataId = ASSESSMENT_ROLLUP_PREFIX + teamId;
      common.getByViewKey('assessments', 'rollUpData', rollUpDataId)
        .then(function(rollUpData) {
          resolve(rollUpData);
        })
        .catch( /* istanbul ignore next */ function(err) {
          var msg;
          if (err.error) {
            msg = err.error;
          } else {
            msg = err;
          }
          reject(formatErrMsg(msg));
        });
    });
  },

  cleanUpDb: function(teamId) {
    return new Promise(function(resolve, reject) {
      var deleteItems = [];
      var currentTeam = new Object();
      common.getByViewKey('utility','cleanupteam',teamId, true)
      .then(function(team){
        if (!_.isEmpty(team.rows)) {
          currentTeam = team.rows[0].value;
          var deleteTeam = team.rows[0].value;
          deleteTeam.doc_status = 'delete';
          deleteItems.push(deleteTeam);
          if (!_.isEmpty(currentTeam.child_team_id)) {
            return common.getByViewKeys('utility','cleanupteam',currentTeam.child_team_id, true);
          } else {
            return {'rows' : []};
          }
        } else {
          return Promise.reject({'error': 'cannot find team: ' + teamId});
        }
      })
      .then(function(childTeams){
        if (!_.isEmpty(childTeams.rows)) {
          _.each(childTeams.rows, function(childTeam){
            var updateChild = childTeam.value;
            if (updateChild.parent_team_id == currentTeam._id) {
              updateChild.parent_team_id = '';
              deleteItems.push(updateChild);
            }
          });
        }
        if (currentTeam.parent_team_id == '' || currentTeam.parent_team_id == undefined) {
          return {'rows': []};
        } else {
          return common.getByViewKey('utility','cleanupteam',currentTeam.parent_team_id, true);
        }
      })
      .then(function(parentTeam){
        if (!_.isEmpty(parentTeam.rows)) {
          var updateParent = parentTeam.rows[0].value;
          updateParent.child_team_id.splice(_.indexOf(updateParent.child_team_id, currentTeam._id), 1);
          deleteItems.push(updateParent);
        }
        return common.getByViewKey('utility', 'cleanupassessment', currentTeam._id);
      })
      .then(function(assessments){
        if (!_.isEmpty(assessments.rows)) {
          _.each(assessments.rows, function(assessment){
            var updateAssessment = assessment.value;
            updateAssessment.doc_status = 'delete';
            deleteItems.push(updateAssessment);
          });
        }
        return common.getByViewKey('utility', 'cleanupiteration', currentTeam._id);
      })
      .then(function(iterations){
        if (!_.isEmpty(iterations.rows)) {
          _.each(iterations.rows, function(iteration){
            var updateIteration = iteration.value;
            updateIteration.doc_status = 'delete';
            deleteItems.push(updateIteration);
          });
        }
        var request = {'docs' : deleteItems};
        return common.bulkUpdate(request);
      })
      .then(function(results){
        resolve(results);
      })
      .catch(function(err){
        reject(err);
      });
    });
  },

  batchCleanUpDb: function(teamIds) {
    return new Promise(function(resolve, reject) {
      var results = [];
      Promise.mapSeries(teamIds, function(id, index, length) {
        return new Promise(function(resolve, reject){
          loggers.get('model-sanpshot').verbose('deleting team: ' + id);
          snapshot.cleanUpDb(id)
          .then(function(result){
            var obj = {
              'teamId': id,
              'result': result
            };
            results.push(obj);
            loggers.get('model-sanpshot').verbose('successfully delete team: ' + id);
            return resolve(obj);
          })
          .catch(function(err){
            var obj = {
              'teamId': id,
              'result': err
            };
            results.push(obj);
            return resolve(obj);
          });
        });
      })
      .then(function(){
        resolve(results);
      })
      .catch(function(err){
        reject(err);
      });
    });
  }
};

module.exports = snapshot;
