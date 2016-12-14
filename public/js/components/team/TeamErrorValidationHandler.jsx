var _ = require('underscore');
var React = require('react');

var TeamErrorValidationHandler = React.createClass({
  getInitialState: function() {
    return {
      errors: {},
      formFields: []
    }
  },
  componentWillReceiveProps: function(newProps) {
    this.state.errors = {};
    if (_.has(newProps.formError.error, 'responseJSON') && _.has(newProps.formError.error.responseJSON, 'errors') && _.isEqual(newProps.formError.error.responseJSON.name, 'ValidationError')) {
      this.state.errors = newProps.formError.error.responseJSON.errors
    } else if (_.has(newProps.formError.error, 'responseJSON') && _.has(newProps.formError.error.responseJSON, 'errors')) {
      this.state.errors = newProps.formError.error.responseJSON.errors;
    } else if (_.has(newProps.formError.error, 'responseText')) {
      this.state.errors = JSON.parse(newProps.formError.error.responseText);
    } else if (!_.isEmpty(newProps.formError.error)) {
      this.state.errors = ['An error has occurred while performing the operation.'];
    }
    this.state.formFields = newProps.formError.map
    this.handleErrors();
  },
  handleErrors: function() {
    var errors = this.state.errors;
    var formFields = this.state.formFields;
    var msg = '';
    var msgList = [];
    var frmList = [];
    // find all db related errors
    _.each(formFields, function(f) {
      if (frmList.indexOf(f.id) == -1)
        clearFieldErrorHighlight(f.id);

      if (!_.isEmpty(errors) && !_.isEmpty(errors[f.field])) {
        setFieldErrorHighlight(f.id);
        if (msgList.indexOf(f.field) == -1) {
          msgList.push(f.field);
          frmList.push(f.id);
          if (msg != '') msg += '\n';
          msg += errors[f.field].message;
        }
      }
    });
    // all other errors
    _.each(errors, function(err) {
      if (err instanceof String) {
        if (msg != '') msg += '\n';
        msg += err;
      }
    });
    if (msg != '')
      showMessagePopup(msg);
  },
  setFieldErrorHighlight: function(id) {
    var borderColor = 'red';
    var backgroundColor = '';
    if ($('#' + id).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', borderColor);
      $($('#select2-' + id + '-container').parent()).css('background', backgroundColor);
    } else {
      $('#' + id).css('background', backgroundColor);
      $('#' + id).css('border-color', borderColor);
    }
  },
  clearFieldErrorHighlight: function(id) {
    var borderColor = '';
    var backgroundColor = '';
    if ($('#' + id).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', borderColor);
      $($('#select2-' + id + '-container').parent()).css('background', backgroundColor);
    } else {
      $('#' + id).css('background', backgroundColor);
      $('#' + id).css('border-color', borderColor);
    }
  },
  render: function() {
    return(
      <div/>
    );
  }
});

module.exports = TeamErrorValidationHandler;
