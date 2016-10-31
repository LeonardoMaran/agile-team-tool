var Promise = require('bluebird');
var uuid = require('node-uuid');
var loggers = require('../../middleware/logger');
var moment = require('moment');
var _ = require('underscore');
var config = require('../../settings');
var mongoose = config.mongoose;
var Schema   = require('mongoose').Schema;

var apiKeySchema = {
  userId: {
    type: String,
    required: [true, 'UserId is required.'],
    unique: true
  },
  email: {
    type: String,
    required: [true, 'email is required.'],
    unique: true
  },
  key: {
    type: String,
    default: 'none'
  },
  createDate: {
    type: Date,
    default: new Date()
  }
};

var apiKeySchema = new Schema(apiKeySchema, { collection : 'apiKeys'});
var ApiKey = mongoose.model('apiKeys', apiKeySchema);

var apiKeys = {
  getUserApikeyByUser: function(user) {
     return new Promise(function(resolve, reject) {
       var uid = user['ldap']['uid'];
       if (_.isEmpty(uid)) {
         loggers.get('model-users').verbose('Getting user api key with UID but empty');
         var q = {};
         var query = ApiKey.find(q);
       } else {
         loggers.get('model-users').verbose('Getting user api key with UID ' + uid);
         var q = {userId: uid};
         var query = ApiKey.findOne(q);
       }
       query
       .then(function(result){
         resolve(result);
       })
       .catch(function(err){
         reject(err);
       });
     });
   },

   createApikey: function(user) {
     return new Promise(function(resolve, reject) {
       var apiData = {};
       apiKeys.getUserApikeyByUser(user)
         .then(function(result) {
           if (_.isEmpty(result)) {
             var uuidKey = uuid.v4();
             apiData['userId'] = user['ldap']['uid'];
             apiData['email'] = user['shortEmail'];
             apiData['key'] = uuidKey;
             var newApiKey = new ApiKey(apiData);
             ApiKey.create(newApiKey);
             result = apiData;
           }
           apiData = result;
           return apiData;
         })
         .then(function(result) {
           resolve(apiData);
         })
         .catch( /* istanbul ignore next */ function(err) {
           loggers.get('models-users').error('ERROR:', err);
           var msg = err.error;
           reject(msg);
         });
     });
   },

   deleteApikey: function(user) {
     return new Promise(function(resolve, reject) {
       loggers.get('model-users').verbose('Delete api key for user ' + user.shortEmail);
       apiKeys.getUserApikeyByUser(user)
       .then(function(userApi) {
         if (!_.isEmpty(userApi)) {
//        return cloudantDriver.deleteRecord(userApi._id, userApi._rev);
          var deleteApiKey = new ApiKey(userApi);
          ApiKey.delete(deleteApiKey);
         } else {
          return userApi;
         }
       })
       .then(function(result) {
         resolve(result);
       })
       .catch( /* istanbul ignore next */ function(err) {
         loggers.get('models-users').error('ERROR:', err);
         var msg = err.error;
         reject(msg);
       });
     });
   }


};

module.exports = apiKeys;
