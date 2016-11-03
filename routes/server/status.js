var settings = require('../../settings');

module.exports = function(app, includes) {
  var render = includes.render;

  /* instabul ingore next */
  showHome = function(req, res) {
    var json = {
      'pageTitle': 'Home',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'ibmNPSKey': settings.ibmNPSKey,
      'environment': settings.environment
    };
    render(req, res, 'home', json);
  };

  /* instabul ingore next */
  showSSOLogoutPage = function(req, res) {
    var json = {
      'pageTitle': 'Logout',
      'googleAnalyticsKey': settings.googleAnalyticsKey,
      'message': 'You have succesfully logged out, please close this browser window.',
      'ibmNPSKey': settings.ibmNPSKey
    };
    render(req, res, 'status', json);
  };

  app.get('/ssologout', showSSOLogoutPage);
};
