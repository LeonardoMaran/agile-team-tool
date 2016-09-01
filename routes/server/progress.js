var settings = require('../../settings');
 		
module.exports = function(app, includes) {
  var middleware  = includes.middleware;
  var render = includes.render;

  showAssessmentProgress = function(req, res) {
    var json = 
      {
        'pageTitle'       : 'Maturity Assessment',
        'user'            : req.session['user'],
        'allTeams'        : req.session['allTeams'],
        'allTeamsLookup'  : req.session['allTeamsLookup'],
        'myTeams'         : req.session['myTeams'],
        'systemAdmin'     : req.session['systemAdmin'],
        'systemStatus'    : req.session['systemStatus'],
        'environment'     : settings.environment,
        'prefix'          : settings.prefixes.assessment,
        'userTeamList'    : req.userTeamList,
        'googleAnalyticsKey' : settings.googleAnalyticsKey
      };
      render(req, res, 'progress', json);
  };
  
  app.get('/progress',  
    [
      includes.middleware.auth.requireLoginWithRedirect,
      includes.middleware.cache.setSystemInfoCache,
      includes.middleware.cache.setUserTeams
    ], showAssessmentProgress);
};