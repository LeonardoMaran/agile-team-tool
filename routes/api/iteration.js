"use strict";

var iterationModel = require('../../models/iteration');
var loggers = require('../../middleware/logger');
var validate = require('validate.js');
var _ = require('underscore');

var formatErrMsg = function(msg){
  loggers.get('api').info('Error: ' + msg);
  return { error : msg };
};

var successLogs = function(msg){
  loggers.get('api').info('Success: ' + msg);
  return;
};

module.exports = function(app, includes) {
  var middleware  = includes.middleware;

  /**
   * Get iteration docs by keys(team_id) or get all iteration info docs
   * Cloudant view1: _design/teams/_view/iterinfo?keys=["ag_team_sample_team1_1469007856095"]
   * Cloudant view2: _design/teams/_view/iterinfo
   * @param {String}   team_id(optional)
   */
  var getIterinfo = function(req, res, next) {
    var teamId = req.params.teamId || undefined;
    loggers.get('api').info('[getIterinfo] teamId:%s', teamId);
    iterationModel.getByIterInfo(teamId)
    .then(function(result) {
      res.send(result);
    })
    .catch(function(err) {
      formatErrMsg('[getIterinfo]:' + err);
      return res.status(400).send({ error: err });
    });
  };

  /**
   * Get single iteration doc by docId
   * @param {String}  docId
   */
  var getIterationDoc = function(req, res, next) {
    var docId = req.params.id || undefined;
    loggers.get('api').info('[getIterationDoc] docId:%s', docId);
    iterationModel.get(docId)
    .then(function(result) {
      res.send(result);
    })
    .catch(function(err) {
      formatErrMsg('[getIterationDoc]:' + err);
      return res.status(400).send({ error: err });
    });
  };

  /**
   * Get completed iterations by keys(startkey/endkey)
   * @param {String}  startkey
   * @param {String}  endkey
   */
  var getCompletedIterations = function(req, res, next) {
    var startkey = req.query.startkey || undefined;
    var endkey = req.query.endkey || undefined;
    loggers.get('api').info('[getCompletedIterations] startkey:%s endkey:%s', startkey, endkey);
    iterationModel.getCompletedIterationsByKey(startkey, endkey)
    .then(function(result) {
      res.send(result);
    })
    .catch(function(err) {
      formatErrMsg('[getCompletedIterations]:' + err);
      return res.status(400).send({ error: err });
    });
  };

  /**
   * Add iteration doc
   * @param {String}  request_body
   */
  var createIteration = function(req, res, next) {
    var data = req.body;
    if (_.isEmpty(data)) {
      return res.status(400).send({ error: 'Iteration data is missing' });
    }
    loggers.get('api').info('[createIteration] POST data:', data);
    data['last_updt_user'] = req.session['user'].shortEmail;
    data['created_user'] = req.session['user'].shortEmail;
    data['type'] = 'iterationinfo';
    iterationModel.add(data)
    .then(function(result) {
      res.send(result);
    })
    .catch(function(err) {
      loggers.get('api').error('[createIteration]:', err);
      res.status(400).send({ error: err });
    });
  };

  /**
   * Update iteration doc
   * @param {String}  iteration docId
   * @param {String}  request_body
   */
  var updateIteration = function(req, res, next) {
    var curIterationId = req.params.iterationId;
    var data = req.body;
    if (_.isEmpty(curIterationId)) {
      return res.status(400).send({ error: 'iterationId is missing' });
    }
    if (_.isEmpty(data)) {
      return res.status(400).send({ error: 'Iteration data is missing' });
    }
    loggers.get('api').info('[updateIteration] POST data:', JSON.stringify(data, null, 4));
    data['last_updt_user'] = req.session['user'].shortEmail;
    data['type'] = 'iterationinfo';
    iterationModel.edit(curIterationId, data)
    .then(function(result) {
      res.send(result);
    })
    .catch(function(err) {
      loggers.get('api').error('[updateIteration]:', err);
      res.status(400).send({ error: err });
    });
  };

  app.get('/api/iteration/completed', [includes.middleware.auth.requireLogin], getCompletedIterations);
  app.get('/api/iteration/:teamId?', [includes.middleware.auth.requireLogin], getIterinfo);
  app.get('/api/iteration/current/:id', [includes.middleware.auth.requireLogin], getIterationDoc);

  app.post('/api/iteration', [includes.middleware.auth.requireLogin], createIteration);
  app.put('/api/iteration/:iterationId?', [includes.middleware.auth.requireLogin], updateIteration);
};