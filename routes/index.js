var fs = require('fs');
var settings = require('../settings');
var middleware = {
  auth : require('../middleware/auth'),
  cache: require('../middleware/cache')
}

render = function(req, res, file, json) {
  //can add stuff to json here if needed
  json["siteTitle"] = "Agile Team Tool";
  json["userEmail"] = req.user;
  json["prefixIteration"] = settings.prefixes['iteration'];
  return res.render(file, json);
};

module.exports = function(app, passport) {
  var includes = {
    passport: passport,
    render: render,
    middleware: middleware
  };
  fs.readdirSync("./routes/server").forEach(function(file) {
    require("./server/" + file)(app, includes);
  });
  fs.readdirSync("./routes/api").forEach(function(file) {
    require("./api/" + file)(app, includes);
  });
};
