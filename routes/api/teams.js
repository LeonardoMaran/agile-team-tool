var teamModel = require('../../models/teams');
var validate = require('validate.js');
var _ = require('underscore');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  createTeam = function(req, res){
    var teamDoc = req.body;
    teamModel.createTeam(teamDoc, req.session['user'])
      .then(function(result){
        res.status(201).send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      })
  };

  deleteTeam = function(req, res){
    if(!(_.isEmpty(req.body['doc_status'])) &&  req.body['doc_status'] === 'delete'){
      teamModel.updateOrDeleteTeam(req.body, req.session['user'], 'delete')
        .then(function(result){
          res.status(204).send(result);
        })
        .catch(function(err){
          res.status(400).send(err);
        })
    }else{
      res.status(400).send({ error : 'Invalid request' });
    }
  }

  updateTeam = function(req, res){
    teamModel.updateOrDeleteTeam(req.body, req.session['user'], 'update')
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  associateTeam = function(req, res){
    var action = req.body.action;
    var valid = teamModel.associateActions(action);
    if(typeof valid === 'object' || valid === false){
      res.status(400).send({ error : 'Invalid action' });
    }else{
      teamModel.associateTeams(req.body, action, req.session['email'])
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
    }
  };

  getTeamRole = function(req, res){
    teamModel.getRole()
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

getTeamName = function(req, res){
    var teamName = req.params.teamName;
    teamModel.getName(teamName)
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err){
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  getTeamByEmail = function(req,res){
    var email = req.params.email;
    teamModel.getTeamByEmail(email)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      })
  }

  getTeam = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getTeam(teamId)
      .then(function(result){
        res.send(result);
      })
      .catch(function(err){
        res.status(400).send(err);
      });
  };

  // delete team document
  app.delete('/api/teams/', [includes.middleware.auth.requireLogin], deleteTeam);

  // create new team document
  app.post('/api/teams/', [includes.middleware.auth.requireLogin], createTeam);

  // update existing team document
  app.put('/api/teams/', [includes.middleware.auth.requireLogin], updateTeam);

  // associate team document
  app.put('/api/teams/associates', [includes.middleware.auth.requireLogin], associateTeam);

  // get all applicable team roles
  app.get('/api/teams/roles', [includes.middleware.auth.requireLogin], getTeamRole);

  // get team document by name
  app.get('/api/teams/names/:teamName?', [includes.middleware.auth.requireLogin], getTeamName);

  // get all team by email
  app.get('/api/teams/members/:email', [includes.middleware.auth.requireLogin], getTeamByEmail);

  // get all team or team details if teamId exists
  app.get('/api/teams/:teamId?', [includes.middleware.auth.requireLogin], getTeam);
};
