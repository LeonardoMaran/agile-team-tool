var _ = require('underscore');
var request = require('request');
var logger = require('../../middleware/logger.js');
var settings = require('../../settings.js');
var moment = require('moment');
var async = require('async');

SMTP_HOST = settings.email.smtpHost;
EMAIL_APPKEY = settings.email.smtpApplicationKey;
FEEDBACK_FROM = 'noreply@agile-team-tool.ibm.com';
FEEDBACK_RECIPIENTS = 'bfouts@us.ibm.com,esumner@us.ibm.com,chunge@us.ibm.com,jarias@us.ibm.com';

var sendRequest = function(emailObj, cb) {
  var params = emailObj;
  options = {
    url: SMTP_HOST,
    method: 'POST',
    headers: {
      'content-type': 'application/json'
    },
    body: params,
    json: true,
    agentOptions: {
      rejectUnauthorized: false
    }
  };
  logger.get('api').verbose('Sending email');

  return request(options, function(error, response, body) {
    var obj;
    /* istanbul ignore else  */
    if (_.isEmpty(error)) {
      logger.get('api').verbose('%s, Email sent to: %s', response.statusCode, emailObj.sendTo);
      cb(null, 'Email sent to: ' + emailObj.sendTo);
    } else {
      logger.get('api').error('Email failure: %s', JSON.stringify(error));
      cb(JSON.stringify(error), null);
    }
  });
};

var processFeedbackRequest = function(req, res) {
  emails = [];
  //admin email
  emails.push({
    html: '<b>Sent by:</b> ' + req.body.feedback_senderName + ' &lt;' + req.body.feedback_sender + '&gt;\
    <br><b>Date submitted:</b> ' + moment.utc().format('MMMM Do YYYY, h:mm a') + ' GMT\
    <br><b>Area:</b> ' + req.body.feedback_page + '\
    <br><b>Team name:</b> ' + req.body.feedback_teamName + '\
    <br><br><b>Text of feedback:</b> \
    <br>' + req.body.feedback,
    from: FEEDBACK_FROM,
    //test_recipient will override the sendTo for unit tests
    sendTo: req.body.test_recipient || FEEDBACK_RECIPIENTS,
    subject: 'Agile Team Tool Feedback',
    applicationKey: EMAIL_APPKEY
  });
  //user email
  emails.push({
    html: 'Thank you for your feedback about the Agile Team Tool, submitted on: ' + moment.utc().format('MMMM Do YYYY, h:mm a') + ' GMT. We appreciate your comments! \
    <br><br>As a reminder, here is what you told us:\
    <br><b>Area:</b> ' + req.body.feedback_page + '\
    <br><b>Team name:</b> ' + req.body.feedback_teamName + '\
    <br><br><b>Message:</b>\
    <br>' + req.body.feedback + "\
    <br><br>From, <br> The Agile Academy<br> Have more to tell us? Please visit our <a href='https://w3-connections.ibm.com/forums/html/forum?id=d0e31d40-ff11-4691-bc65-c0d95bc0c426'>forum</a>.",
    from: FEEDBACK_FROM,
    //test_recipient will override the sendTo for unit tests
    sendTo: req.body.test_recipient || req.body.feedback_sender,
    subject: 'Agile Team Tool Feedback',
    applicationKey: EMAIL_APPKEY
  });

  async.each(emails, function(email, callback) {
    sendRequest(email, function(error, result) {
      /* istanbul ignore else  */
      if (_.isEmpty(error))
        callback();
      else
        callback(error);
    });
  }, function(error) {
    if (_.isEmpty(error))
      res.status(200).send("<h3 class='ibm-bold'>Thank you for your feedback!</h3> Your input helps us improve the Agile Team Tool.");
    else {
      /* istanbul ignore next  */
      logger.get('api').verbose('ERROR: ' + JSON.stringify(error));
      /* istanbul ignore next  */
      res.status(500).send('There was a problem sending your feedback. Please visit our forum: https://w3-connections.ibm.com/forums/html/forum?id=d0e31d40-ff11-4691-bc65-c0d95bc0c426');
    }
  });
};

module.exports = function(app, includes) {
  app.post('/email/feedback', [includes.middleware.auth.requireLogin], processFeedbackRequest);
};
