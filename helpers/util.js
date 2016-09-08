var common = require('../models/cloudant-driver');
var Promise = require('bluebird');
var settings = require('../settings');
var loggers = require('../middleware/logger');
var _ = require('underscore');
var users = require('../models/users');
var momenttz = require('moment-timezone');
var jstz = require('jstimezonedetect');
var request = require('request');
var msg;

var formatErrMsg = function(msg) {
  loggers.get('models').error('util helper Error: ' + msg);
  return {
    error: msg
  };
};

module.exports.trimData = function(postData) {
  var cleanData = {};
  var forceArray = ['members', 'child_team_id']; // somehow this array is being converted to object
  _.each(postData, function(element, index, list) {
    if (typeof element === 'string') {
      element = element.trim();
    } else if (typeof element === 'object' && forceArray.indexOf(index) === -1) {
      var tempObj = {};
      _.each(element, function(v, i, l) {
        tempObj[i] = typeof v === 'string' ? v.trim() : v;
      });
      element = tempObj;
    } else if (typeof element === 'array' || forceArray.indexOf(index) > -1) { // somehow, members array is being catch as OBJECT
      var tempArr = [];
      _.each(element, function(v, i, l) {
        tempArr.push(typeof v === 'string' ? v.trim() : v);
      });
      element = tempArr;
    }
    cleanData[index] = element;
  });
  return cleanData;
};

// Get system status
module.exports.getSystemStatus = function(accessId) {
  return new Promise(function(resolve, reject) {
    if (!(_.isEmpty(accessId))) {
      loggers.get('models').verbose('Getting system status');
      common.getRecord(accessId)
        .then(function(body) {
          loggers.get('models').verbose('Success: System status records obtained');
          resolve(body);
        })
        .catch(function(err) {
          msg = err.error;
          reject(formatErrMsg(msg));
        });
    } else {
      msg = 'system status access id is empty';
      reject(formatErrMsg(msg));
    }
  });
};

// Get server time (in million sec)
module.exports.getServerTime = function() {
  //use server time
  var timezone = jstz.determine().name();
  return momenttz.tz(timezone).format('YYYY-MM-DD HH:mm:ss z');
};


/**
 * Bulkdelete documents
 *
 * @param docIds Array of document Ids e.g. ['01a4073afd76c2cde8dcf42a56f25741', '10a4073afd76c2cde8dcf42a56f25741', ...]
 * @return JSONObject
 */
module.exports.BulkDelete = function(docIds) {
  return new Promise(function(resolve, reject) {
    var deletedIds = [];
    var failedIds = [];
    var _id;
    var _rev;
    _.each(docIds, function(docId) {
      common.getRecord(docId)
        .then(function(body) {
          if (!_.isEmpty(body)) {
            _id = body._id;
            _rev = body._rev;
            //console.log('Attempt to delete Document _id: ' + _id + ' _rev: ' + _rev);
            common.deleteRecord(_id, _rev)
              .then(function(body) {
                // loggers.get('models').verbose('[otherModel.BulkDelete] Successfully deleted docId id: '+ _id);
                deletedIds.push(_id);
                var result = {
                  'Failed to delete docIds': failedIds,
                  'Successfully deleted docIds': deletedIds
                };
                resolve(result);
              })
              .catch(function(err) {
                // loggers.get('models').error('[otherModel.BulkDelete] Failed to delete docId: '+ _id);
                failedIds.push(_id);
              });
          }
        })
        .catch(function(err) {
          // loggers.get('models').error('[otherModel.BulkDelete] Failed to delete docId: '+ docId);
          failedIds.push(docId);
        });
    });
  });
};

/**
 * Reformat document to update/delete document structure for BULK operation
 *
 * @param docs - array of documents
 * @param email - email address as last update user, ie logged in user
 * @param action - action to perfrom ie. update or delete
 * @returns - reformatted object that will be passed directly to updateBulk
 */

module.exports.formatForBulkTransaction = function(docs, email, action) {
  //can use lodash cloneDeep
  loggers.get('models').verbose('Start bulk documents formatting for ' + action + ' transaction');
  var reformatDocu = [];
  _.each(docs, function(v, i, l) {
    var doc2 = v;
    if (action === 'delete') {
      doc2['last_updt_user'] = email;
      doc2['last_updt_dt'] = module.exports.getServerTime();
      doc2['doc_status'] = 'delete';
    } else {
      doc2['last_updt_user'] = email;
      doc2['last_updt_dt'] = module.exports.getServerTime();
      doc2['doc_status'] = '';
    }
    reformatDocu.push(doc2);
  });
  loggers.get('models').verbose('Bulk documents reformatted for ' + action + ' transaction');
  return {
    docs: reformatDocu
  };
};

/**
 * This will check if team/parent team is included in user teams
 *
 * @param teamId - team id to search on
 * @param checkParent - checking of parent is necessary
 * @param allTeams - list of all teams
 * @param userTeams - list of user teams
 * @returns - true if team or team's parent is found in user teams
 */

function isTeamMember(userId, teamId) {
  var teamModel = require('../models/teams');
  return new Promise(function(resolve, reject) {
    teamModel.getUserTeams(userId)
      .then(function(body) {
        var hasAccess = false;
        if (_.contains(body, teamId))
          hasAccess = true;
        resolve(hasAccess);
      })
      .catch(function(err) {
        reject(formatErrMsg(err.error));
      });
  });
}

/**
 * This will validate user access for create/update/delete operations
 *
 * @param userId - user login id (email id)
 * @param teamId - team id to search on
 * @param checkParent - checking of parent is necessary
 * @param allTeams - list of all teams
 * @param userTeams - list of user teams
 * @returns - true if access allowed otherwise throws an error with unauthorized user message
 */

module.exports.isUserAllowed = function(userId, teamId) {
  return new Promise(function(resolve, reject) {
    loggers.get('models').verbose('validating user ' + userId + ' for team ' + teamId);
    users.getAdmins()
      .then(function(body) {
        return _.contains(body.ACL_Full_Admin, userId);
      })
      .then(function(isAdmin) {

        if (!isAdmin) {
          return isTeamMember(userId, teamId);
        } else {
          return isAdmin;
        }
      })
      .then(function(allowedUser) {
        if (!allowedUser) {
          reject(formatErrMsg('Unauthorized user.'));
        } else {
          return resolve(allowedUser);
        }
      })
      .catch(function(err) {
        reject(formatErrMsg(err.error));
      });
  });
};

module.exports.returnObject = function(data) {
  // pre process returned rows so we deal directly with the document objects
  // doc attribute of data are valid for compacted views that requested for "include_doc=true"
  // field attribute of data are valid for index queries that exposes fields as part of query result
  var returnData = new Object();
  if (_.has(data, 'rows')) {
    if (!_.isEmpty(data.rows)) {
      if (_.has(data.rows[0], 'doc'))
        returnData = _.pluck(data.rows, 'doc');
      else if (_.has(data.rows[0], 'value'))
        returnData = _.pluck(data.rows, 'value');
      else if (_.has(data.rows[0], 'fields')) {
        returnData = _.map(data.rows, function(val, key) {
          //add document id property into each fields result
          var merged = _.extend(val.fields, {
            '_id': val.id
          });
          return merged;
        });
      }
    } else
      returnData = data.rows;
  } else if (data instanceof Array) {
    if (!_.isEmpty(data)) {
      if (_.has(data[0], 'doc') && !_.isEmpty(data[0].doc))
        returnData = _.pluck(data, 'doc');
      else if (_.has(data[0], 'value') && !_.isEmpty(data[0].value))
        returnData = _.pluck(data, 'value');
      else if (_.has(data[0], 'fields') && !_.isEmpty(data[0].fields)) {
        returnData = _.map(data.rows, function(val, key) {
          //add document id property into each fields result
          var merged = _.extend(val.fields, {
            '_id': val.id
          });
          return merged;
        });
      } else
        returnData = data;
    } else
      returnData = data;
  } else
    returnData = data;

  return returnData;
};

module.exports.queryLDAP = function(id) {
  return new Promise(function(resolve, reject) {
    var opts = {
      url: settings['ldapAuthURL'] + '/id/' + id + '/email'
    };

    request.get(opts, function(err, res, body) {
      if (err) {
        reject(body);
      } else {
        resolve(body);
      }
    });
  });
};

module.exports.specialCharsHandler = function(id) {
  return id.replace( /(:|\.|\[|\]|,|\/| )/g, '\\$1' );
};
