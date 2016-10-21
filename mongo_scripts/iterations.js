'use strict';
var _          = require('underscore');
var cloudantDb = require('./data');
var MongoClient = require('mongodb').MongoClient;
var assert     = require('assert');
process.env.NODE_TLS_REJECT_UNAUTHORIZED = 0;

var cloudantIterations = _.filter(cloudantDb.rows, function(row){ return row.doc.type === 'iterationinfo'; });
var cloudantIterations = _.pluck(cloudantIterations, 'doc');

var util = require('./util.js');
var userMap = util.getUserMap();


var mongoIterations = [];
_.each(cloudantIterations, function(doc) {
  if (doc.doc_status==='delete')
    return;
  //set empty string values to be undefined
  doc = _.mapObject(doc, function(val){ return _.isEmpty(val) ? undefined : val; });
  var mongoDoc = {
    'cloudantId' : doc._id,
    'createDate': util.stringToUtcDate(doc.created_dt),
    'createdByUserId' : util.getUserId(userMap, doc.created_user),
    'createdBy'   : util.lowerCase(doc.created_user),
    'updateDate'  : util.stringToUtcDate(doc.last_updt_dt),
    'updatedByUserId' : util.getUserId(userMap, doc.last_updt_user),
    'updatedBy'       : util.lowerCase(doc.last_updt_user),
    'startDate': util.stringToUtcDate(doc.iteration_start_dt),
    'endDate'  : util.stringToUtcDate(doc.iteration_end_dt),
    'name'     : doc.iteration_name,
    'teamId' : doc.team_id,
    'docStatus' : doc.doc_status,
    'status' : doc.iterationinfo_status,
    'memberCount' : (_.isEmpty(doc.team_mbr_cnt))? undefined: parseInt(doc.team_mbr_cnt),
    'committedStories': (_.isEmpty(doc.nbr_committed_stories))? undefined:parseInt(doc.nbr_committed_stories),
    'deliveredStories': (_.isEmpty(doc.nbr_stories_dlvrd))? undefined:parseInt(doc.nbr_stories_dlvrd),
    'commitedStoryPoints': (_.isEmpty(doc.teamnbr_committed_story_pts_mbr_cnt))? undefined:parseInt(doc.nbr_committed_story_pts),
    'storyPointsDelivered': (_.isEmpty(doc.nbr_story_pts_dlvrd))? undefined:parseInt(doc.nbr_story_pts_dlvrd),
    'locationScore':  (_.isEmpty(doc.fte_cnt))? undefined: parseFloat(doc.fte_cnt),
    'deployments': (_.isEmpty(doc.nbr_dplymnts))? undefined: parseInt(doc.nbr_dplymnts),
    'defects': (_.isEmpty(doc.nbr_defects))? undefined: parseInt(doc.nbr_defects),
    'clientSatisfaction': (_.isEmpty(doc.client_sat))? undefined : parseFloat(doc.client_sat),
    'teamSatisfaction': (_.isEmpty(doc.team_sat))? undefined : parseFloat(doc.team_sat),
    'comment': doc.iteration_comments,
    'memberChanged': (doc.team_mbr_change==='No')? false : true,
    'defectsStartBal': parseInt(doc.nbr_defects_start_bal),
    'defectsEndBal': parseInt(doc.nbr_defects_end_bal),
    'defectsClosed': parseInt(doc.nbr_defects_closed),
    'cycleTimeWIP': parseFloat(doc.nbr_cycletime_WIP),
    'cycleTimeInBacklog': parseFloat(doc.nbr_cycletime_in_backlog)
  };
  mongoIterations.push(mongoDoc);
});


var creds = require('./creds');
// Use connect method to connect to the server
MongoClient.connect(creds.url, function(err, db) {
  assert.equal(null, err);
  console.log('Connected successfully to server');
  db.collection('iterations')
    .drop()
    .then(function(){
      db.collection('iterations').insertMany(mongoIterations, function(err, r) {
        assert.equal(null, err);
        console.log('Done!  ' + JSON.stringify(r.result));
        db.close();
        process.exit();
      });
    });
});
