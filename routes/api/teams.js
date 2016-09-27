var teamModel = require('../../models/mongodb/teams');
// var teamIndex = require('../../models/index/teamIndex');
// var validate = require('validate.js');
var _ = require('underscore');

module.exports = function(app, includes) {
  searchTeamWithName = function(req, res) {
    var keyword = req.params.name;
    if (keyword != '' && keyword != undefined) {
      teamModel.searchTeamWithName(keyword)
        .then(function(result){
          res.status(200).send(result);
        })
        .catch(function(err){
          res.status(404).send(err);
        });
    } else {
      var err = 'keyword is missing';
      res.status(400).send(err);
    }
  };

  createTeam = function(req, res) {
    var teamDoc = req.body;
    teamModel.createTeam(teamDoc, req.session['user'])
      .then(function(result) {
        teamModel.getUserTeams(req.session['email'])
          .then(function(body) {
            var addResult = new Object();
            addResult.team = result;
            addResult.userTeams = body;
            res.status(201).send(addResult);
          });
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  deleteTeam = function(req, res) {
    if (!(_.isEmpty(req.body['doc_status'])) && req.body['doc_status'] === 'delete') {
      teamModel.updateOrDeleteTeam(req.body, req.session['user'], 'delete')
        .then(function(result) {
          teamModel.getUserTeams(req.session['email'])
            .then(function(body) {
              res.status(200).send(body);
            });
        })
        .catch(function(err) {
          res.status(400).send(err);
        });
    } else {
      res.status(400).send({
        error: 'Invalid request'
      });
    }
  };

  updateTeam = function(req, res) {
    teamModel.updateOrDeleteTeam(req.body, req.session['user'], 'update')
      .then(function(result) {
        teamModel.getUserTeams(req.session['email'])
          .then(function(body) {
            var updateResult = new Object();
            updateResult.team = result;
            updateResult.userTeams = body;
            res.send(updateResult);
          });
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  associateTeam = function(req, res) {
    var action = req.body.action;
    var valid = teamModel.associateActions(action);
    if (typeof valid === 'object' || valid === false) {
      res.status(400).send({
        error: 'Invalid action'
      });
    } else {
      teamModel.associateTeams(req.body, action, req.session['user'])
        .then(function(result) {
          var associateResult = new Object();
          teamModel.getUserTeams(req.session['email'])
            .then(function(body) {
              associateResult.team = result;
              associateResult.userTeams = body;
              res.send(associateResult);
            });
        })
        .catch( /* istanbul ignore next */ function(err) {
          // cannot simulate this error during testing
          res.status(400).send(err);
        });
    }
  };

  modifyTeamMembers = function(req, res) {
    var members = req.body['members'];
    var userId = req.session['userId'];
    var userEmail = req.session['email'];
    var teamId = req.body['teamId'];

    //TODO add userId (cnum) to session obj
    if (_.isEmpty(userId))
      res.status(400).send('Could not get userId from session.');

    teamModel.modifyTeamMembers(teamId, userEmail, userId, members)
      .then(function(result){
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  getTeamRole = function(req, res) {
    teamModel.getRole()
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  getByTeamName = function(req, res) {
    var teamName = req.params.teamName;
    teamModel.getByName(teamName)
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        // cannot simulate this error during testing
        res.status(400).send(err);
      });
  };

  getTeamByEmail = function(req, res) {
    var email = req.params.email;
    teamModel.getTeamByEmail(email)
      .then(function(result) {
        res.send(result);
      })
      .catch(function(err) {
        res.status(400).send(err);
      });
  };

  getTeamsByUid = function(req, res) {
    var uid = req.params.uid;
    teamModel.getTeamsByUid(uid)
      .then(function(result) {
        res.send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getTeam = function(req, res) {
    /* use query to get top level, children or parent team */
    if (!_.isEmpty(req.query)) {
      teamModel.getRootTeams(req.query)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    }
    /* get team by ID */
    else {
      var teamId = req.params.teamId;
      teamModel.getTeam(teamId)
        .then(function(result) {
          res.send(result);
        })
        .catch(function(err) {
          res.status(400).send(err);
        });
    }
  };

  initLookupIndex = function(req, res) {
    var teamId = req.params.teamId;
    teamIndex.initIndex()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getSelectableParents = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getSelectableParents(teamId)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getSelectableChildren = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getSelectableChildren(teamId)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  getLookupIndex = function(req, res) {
    if (!_.isEmpty(req.query)) {
      var id = req.query.id || '';
      var squadteam = req.query.squadteam || 'no';
      squadteam = squadteam.toUpperCase() == 'YES' ? true : false;
      teamModel.getLookupTeamByType(id, squadteam)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });

    } else {
      var teamId = req.params.teamId;
      teamModel.getLookupIndex(teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    }
  };

  getSquadsOfParent = function(req, res) {
    var teamId = req.params.teamId;
    teamModel.getSquadsOfParent(teamId)
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };
  // search team with name
  app.get('/api/teams/search/:name', [includes.middleware.auth.requireLogin], searchTeamWithName);

  // delete team document
  app.delete('/api/teams/', [includes.middleware.auth.requireLogin], deleteTeam);

  // create new team document
  app.post('/api/teams/', [includes.middleware.auth.requireLogin], createTeam);

  // update existing team document
  app.put('/api/teams/', [includes.middleware.auth.requireLogin], updateTeam);

  // associate team document
  app.put('/api/teams/associates', [includes.middleware.auth.requireLogin], associateTeam);

  // modify  team members
  app.put('/api/teams/members', [includes.middleware.auth.requireLogin], modifyTeamMembers);

  // get all applicable team roles
  app.get('/api/teams/roles', [includes.middleware.auth.requireLogin], getTeamRole);

  // get team doc by team name
  app.get('/api/teams/names/:teamName?', [includes.middleware.auth.requireLogin], getByTeamName);

  // get all teams by email
  app.get('/api/teams/members/:email', [includes.middleware.auth.requireLogin], getTeamByEmail);

  // get all teams by userId
  app.get('/api/teams/membersUid/:uid', [includes.middleware.auth.requireLogin], getTeamsByUid);

  // get all team or team details if teamId exists
  app.get('/api/teams/:teamId?', [includes.middleware.auth.requireLogin], getTeam);

  // list of parent and child team ids associated with the team
  app.get('/api/teams/lookup/initialize', [includes.middleware.auth.requireLogin], initLookupIndex);

  // selectable parent teams of a team
  app.get('/api/teams/lookup/parents/:teamId?', [includes.middleware.auth.requireLogin], getSelectableParents);

  // selectable child teams of a team
  app.get('/api/teams/lookup/children/:teamId?', [includes.middleware.auth.requireLogin], getSelectableChildren);

  // list of squad teams associated with the team
  app.get('/api/teams/lookup/squads/:teamId?', [includes.middleware.auth.requireLogin], getSquadsOfParent);

  // list of parent and child team ids associated with the team
  app.get('/api/teams/lookup/team/:teamId?', [includes.middleware.auth.requireLogin], getLookupIndex);

};
