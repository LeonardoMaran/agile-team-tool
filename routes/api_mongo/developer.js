var util = require('../../helpers/util');
// var developersModel = require('../../models/mongodb/developers');

module.exports = function(app, includes) {
  var middleware = includes.middleware;

  // getApiKey = /* instabul ingore next */ function(req, res) {
  //   developersModel.createApikey(req.session['user'])
  //     .then(function(result) {
  //       console.log(result);
  //       res.status(200).json({
  //         'apiKey': result.key,
  //         'shortEmail': result.email
  //       });
  //     })
  //     .catch( /* instabul ingore next */ function(err) {
  //       res.status(404).send(err);
  //     });
  // };
  //
  // getApiKeyByUser = /* instabul ingore next */ function(req, res) {
  //   developersModel.getUserApikeyByUser(req.session['user'])
  //     .then(function(result) {
  //       if (!_.isEmpty(result)) {
  //         console.log(result);
  //         res.status(200).json({
  //           'apiKey': result.key,
  //           'shortEmail': result.email
  //         });
  //       } else {
  //         console.log('No result is avilable');
  //         res.status(200).json({
  //           'apiKey': '',
  //           'shortEmail': ''
  //         });
  //       }
  //     })
  //     .catch( /* instabul ingore next */ function(err) {
  //       res.status(404).send(err);
  //     });
  // };

  // try to get data from here
  /* instabul ingore next */
  // app.get('/api/developer/apiKey', [includes.middleware.auth.requireLogin], getApiKey);
  // /* instabul ingore next */
  // app.get('/api/developer/apiKeyByUser', [includes.middleware.auth.requireLogin], getApiKeyByUser);

};
