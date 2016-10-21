var snapshotModel = require('../../models/mongodb/snapshot');
var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  updateRollUpData = function(req, res) {
    snapshotModel.updateRollUpData()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  getRollUpDataByTeam = function(req, res) {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId != undefined)) {
      snapshotModel.getRollUpDataByTeamId(req.params.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    } else {
      var msg = {
        'error': 'team id is not right'
      };
      res.status(400).send(msg);
    }
  },

  completeIterations = function(req, res) {
    snapshotModel.completeIterations()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  updateUsersLocation = function(req, res) {
    snapshotModel.updateUsersLocation()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  updateAssessmentRollUpData = function(req, res) {
    snapshotModel.updateAssessmentRollUpData()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  },

  getAssessmentRollUpByTeam = function(req, res) {
    if (!_.isEmpty(req.params.teamId) && (req.params.teamId != undefined)) {
      snapshotModel.getAssessmentRollUpByTeam(req.params.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    } else {
      var msg = {
        'error': 'Missing team id.'
      };
      res.status(400).send(msg);
    }
  };

  app.get('/api/snapshot/completeiterations', [includes.middleware.auth.requireLogin], completeIterations);
  app.get('/api/snapshot/get/:teamId', [includes.middleware.auth.requireLogin], getRollUpDataByTeam);
  app.get('/api/snapshot/updaterollupdata/', [includes.middleware.auth.requireLogin], updateRollUpData);
  app.get('/api/snapshot/updateuserslocation', [includes.middleware.auth.requireLogin], updateUsersLocation);
  app.get('/api/snapshot/updateAssessmentRollUpData', [includes.middleware.auth.requireLogin], updateAssessmentRollUpData);
  app.get('/api/snapshot/rollupassessmentbyteam/:teamId', [includes.middleware.auth.requireLogin], getAssessmentRollUpByTeam);
};
