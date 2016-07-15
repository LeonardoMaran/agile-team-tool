var LocalStrategy = require('passport-local').Strategy;
var settings      = require('../settings');
var request       = require('request');
var Promise       = require('bluebird');
var _             = require('underscore');
var loggers        = require('../middleware/logger');

module.exports = function(passport) {


  ldapAuth = function(username, password) {
    return new Promise(function(resolve, reject) {
      var opts = {
        url: settings['ldapAuthURL'],
        form: {
          intranetId: username,
          password: password
        }
      };

      request.post(opts, function(err, res, body) {
        if (err || res.statusCode == 401) {
          reject(body);
        }
        else
          resolve(body);
      })

    });
  };

  passport.serializeUser(function(user, done) {
    if(typeof user === 'string')
      done(null, JSON.parse(user).shortEmail);
    else
      done(null, user['shortEmail']);
  });
  
  passport.deserializeUser(function(user, done) {
    done(null, user);
  });

  passport.use('ldap-login', new LocalStrategy({
    usernameField: 'username',
    passwordField: 'password',
    passReqToCallback: true
  }, function(req, email, password, done) {
    loggers.get('auth').info('Attempting to do LDAP authentication email=%s', email);
    ldapAuth(email, password)
      .then(function(ldapObject) {
        ldapObject = typeof ldapObject === 'string' ? JSON.parse(ldapObject) : ldapObject;
        if (!(_.isEmpty(ldapObject['ldap']))) {
          req.session['email'] = ldapObject['shortEmail'];
          req.session['user'] = ldapObject;
          loggers.get('auth').info('Successfully authenticated %s', email);
          return done(null, ldapObject);
        }
        else {
          loggers.get('auth').error('Unable to authenticate email=%s, ldapObject=%s', email, ldapObject);
          return done(null, false);
        }
          
      })
      .catch(function(err) {
        loggers.get('auth').error('Unable to authenticate email=%s, err=%s', email, err);
        return done(null, false);
      })
  }));


};