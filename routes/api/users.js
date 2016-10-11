var users = require('../../models/mongodb/users');
// Get admins and supports api call
var _ = require('underscore');
module.exports = function(app, includes) {
  var middleware = includes.middleware;

  getAdmins = function(req, res) {
    users.getAdmins()
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch( /* istanbul ignore next */ function(err) {
        res.status(400).send(err);
      });
  };

  isUserAllowed = function(req, res) {
    if (_.isUndefined(req.query.email) || _.isEmpty(req.query.email)) {
      res.status(400).send({'error': 'userId is empty'});
    }
    else if (_.isUndefined(req.query.teamId) || _.isEmpty(req.query.teamId)) {
      res.status(400).send({'error': 'teamId is empty'});
    } else {
      users.isUserAllowed(req.query.userId, req.query.teamId)
        .then(function(result) {
          res.status(200).send(result);
        })
        .catch( /* istanbul ignore next */ function(err) {
          res.status(400).send(err);
        });
    }
  };

  getApiKey = function(req, res) {
    users.createApikey(req.session['user'])
      .then(function(result) {
        res.status(200).send({
          'key': result.key,
          'userId': result.userId,
          'shortEmail': result.email
        });
      })
      .catch(function(err){
        res.status(404).send(err);
      });
  };

  deleteApiKey = function(req, res) {
    users.deleteApikey(req.session['user'])
      .then(function(result) {
        res.status(200).send(result);
      })
      .catch(function(err){
        res.status(404).send(err);
      });
  };

  getActiveUser = function(req, res) {
    // return active user session
    res.send(req.session['user']);
  };


  //TODO: Refactor this and store in the database
  getRoles = function(req, res) {
    var roles = [
      { name: 'Analyst' },
      { name: 'Architect' },
      { name: 'Consultant' },
      { name: 'DBA' },
      { name: 'Designer' },
      { name: 'Developer' },
      { name: 'Infrastructure' },
      { name: 'Iteration Manager' },
      { name: 'Manager' },
      { name: 'Operations and Support' },
      { name: 'Product Owner' },
      { name: 'Program & Project Mgmt' },
      { name: 'Tester' }
    ];
    res.json(roles);
  };

  app.get('/api/users/active', [includes.middleware.auth.requireLogin], getActiveUser);

  app.get('/api/users/isuserallowed', [includes.middleware.auth.requireLogin], isUserAllowed);

  app.get('/api/users/admins', [includes.middleware.auth.requireLogin], getAdmins);
  // try to get data from here
  app.get('/api/users/apikey', [includes.middleware.auth.requireLogin], getApiKey);
  // try to get data from here
  app.delete('/api/users/apikey', [includes.middleware.auth.requireLogin], deleteApiKey);

  app.get('/api/users/roles', [includes.middleware.auth.requireLogin], getRoles);
};
