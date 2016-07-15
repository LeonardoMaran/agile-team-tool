"use strict";
module.exports = function(app, includes) {
  var render = includes.render;

  var showIteration = function(req, res) {
    var json = {"pageTitle":"Home"}
    render(req, res, 'iteration', json);
  };

  app.get("/iteration", showIteration);
};