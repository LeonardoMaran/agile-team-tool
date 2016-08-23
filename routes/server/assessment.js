var settings = require('../../settings');

module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showAssessment = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Maturity Assessment',
        'user'            : req.session['user'],
        'allTeams'        : [],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment,
        'prefix'          : settings.prefixes.assessment,
        'squadTeams'      : req.squadTeams,
        'userTeams'       : req.userTeams
      };
    render(req, res, 'assessment', json);
  };
  
  app.get('/assessment',  
    [
      includes.middleware.auth.requireLoginWithRedirect,
      includes.middleware.cache.setSystemInfoCache,
      includes.middleware.cache.setSquadTeams,
      includes.middleware.cache.setUserTeams
    ], showAssessment);
};