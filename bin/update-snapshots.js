require('../settings');
var schedule = require('node-schedule');
var snapshot = require('../models/mongodb/snapshot');
var workerLogger = require('../middleware/logger').get('worker');

schedule.scheduleJob('*/3 * * * *', function() {
  snapshot.updateRollUpData()
    .then(function() {
      workerLogger.verbose('Successfully updated iteration/assessment rollup data for squads');
      return null;
    })
    .catch(function(err) {
      workerLogger.error('Unable to update rollup data err=', err.error);
      return null;
    });
});

schedule.scheduleJob('1 0 * * *', function() {
  snapshot.completeIterations()
    .then(function() {
      workerLogger.verbose('Successfully processed "Not Complete" iterations.');
      return null;
    })
    .catch(function(err) {
      workerLogger.error('Unable to process "Not Complete" iterations err=', err.error);
      return null;
    });
});
