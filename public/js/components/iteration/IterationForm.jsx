var React = require('react');
var api = require('../api.jsx');
var Management = require('./IterationMgmt.jsx');
var Commitment = require('./IterationCommitment.jsx');
var Result = require('./IterationResult.jsx');
var Metrics = require('./IterationMetrics.jsx');
var Buttons = require('./IterationButtons.jsx');

var moment = require('moment');
var initData = {
'_id':'',
'createDate':'',
'createdByUserId':'',
'createdBy':'',
'startDate':'',
'endDate':'',
'name':'',
'teamId':'',
'memberCount':null,
'locationScore':null,
'cycleTimeInBacklog':null,
'cycleTimeWIP':null,
'defectsEndBal':null,
'defectsClosed':null,
'defects':null,
'defectsStartBal':null,
'memberChanged':false,
'comment':'',
'teamSatisfaction':null,
'clientSatisfaction':null,
'deployments':null,
'storyPointsDelivered':null,
'commitedStoryPoints':null,
'deliveredStories':null,
'committedStories':null,
'status':'',
'memberFte':null,
'docStatus':null,
'updatedBy':'',
'updatedByUserId':'',
'updateDate':''};

var invalidBorder = '#f00';
var invalidBackground = '';

var IterationForm = React.createClass({
  getInitialState: function() {
    initData.teamId = this.props.selectedTeam;
    initData._id = this.props.selectedIteration;
    return {
      enableFields: false,
      iteration: initData,
      addBtnDisable: true,
      updateBtnDisable: true,
      lastUpdateTimestamp: '',
      lastUpdateUser: '',
      id:'',
    }
  },

  populateForm: function(data, state){
    //populate form fields per data retrieved
    this.refs.management.populateForm(data, state);
    this.refs.commitment.populateForm(data, state);
    this.refs.result.populateForm(data, state);
    this.refs.metrics.populateForm(data, state);

    if (data != undefined && data != null){
      this.setState({
        lastUpdateTimestamp: this.showDateUTC(data.updateDate),
        lastUpdateUser: data.updatedBy,
        id: data._id,
        addBtnDisable: true,
        updateBtnDisable: false,
        enableFields: true});
        this.setState({iteration: data});
    }
    else{
      this.setState({
        lastUpdateTimestamp: '',
        lastUpdateUser: '',
        id: '',
        addBtnDisable: false,
        updateBtnDisable: true,
        enableFields: true});
        this.setState({iteration: initData});
    }
    
    this.refs.buttons.enableButtons(this.state.addBtnDisable, this.state.updateBtnDisable);
  },

  enableFormFields: function(state){
    this.setState({enableFields: state});
    this.refs.management.enableFormFields(state);
    this.refs.commitment.enableFormFields(state);
    this.refs.result.enableFormFields(state);
    this.setState({addBtnDisable: false, updateBtnDisable: true});
    this.refs.buttons.enableButtons(this.state.addBtnDisable, this.state.updateBtnDisable);
  },

  showDateUTC: function(formatDate) {
    if (formatDate == null || formatDate == '' || formatDate == 'NaN')
      return 'Not available';
    var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
    return utcTime;
  },

  updateIterationCache: function() {
    this.refs.management.initTeamIterations(this.state.iteration.teamId, this.state.iteration._id, true);
  },

  updateIterationInfo: function(action){
    var self = this;
    if (action == 'add'){
      api.addIteration(self.state.iteration)
      .then(function(result) {
        self.setState({iteration: result});
        self.clearHighlightedIterErrors();
        self.showMessagePopup('You have successfully added Iteration information.');
        self.updateIterationCache();
      })
      .catch(function(err){
        self.handleIterationErrors(err, 'add');
      });
    }
    else if (action == 'update'){
      api.updateIteration(self.state.iteration)
      .then(function(result) {
        self.clearHighlightedIterErrors();
        self.showMessagePopup('You have successfully updated Iteration information.');
        self.updateIterationCache();
      })
      .catch(function(err){
        self.handleIterationErrors(err, 'update');
      });
    }
  },

  showMessagePopup: function(message) {
    alert(message);
  },

  handleIterationErrors:function (errorResponse, operation) {
    var errorlist = '';
    var response = errorResponse.responseJSON;

    if (response && response.error) {
      var errors = response.error.errors;
      if (errors){        
        // Return iteration errors as String
        errorlist = this.getIterationErrorPopup(errors);
        if (errorlist != '') {
          this.showMessagePopup(errorlist);
          if (operation === 'add') {
            this.setState({addBtnDisable: false});
          } else if (operation === 'update') {
            this.setState({updateBtnDisable: false});
          }
        }
      }
      else {
        this.showMessagePopup(response.error);
      }
    }
},

getIterationErrorPopup: function(errors) {
  var errorLists = '';
  // Model fields/Form element field
  var fields = {
    '_id': 'iterationSelectList',
    'teamId': 'teamSelectList',
    'name': 'iterationName',
    'startDate': 'iterationStartDate',
    'endDate': 'iterationEndDate',
    'committedStories': 'commStories',
    'commitedStoryPoints': 'commPoints',
    'memberCount': 'memberCount',
    'memberFte': 'fteThisiteration',
    'deliveredStories': 'commStoriesDel',
    'storyPointsDelivered': 'commPointsDel',
    'deployments': 'DeploythisIteration',
    'defectsStartBal': 'defectsStartBal',
    'defects': 'defectsIteration',
    'defectsClosed': 'defectsClosed',
    'defectsEndBal': 'defectsEndBal',
    'cycleTimeWIP': 'cycleTimeWIP',
    'cycleTimeInBacklog': 'cycleTimeInBacklog',
    'memberChanged': 'teamChangeList',
    'clientSatisfaction': 'clientSatisfaction',
    'teamSatisfaction': 'teamSatisfaction'
  };

  Object.keys(fields).forEach(function(mdlField, index) {
    var frmElement = fields[mdlField];
    if (errors[mdlField]) {
      if (frmElement) {
        setFieldErrorHighlight(frmElement);
      }
      errorLists = errorLists + errors[mdlField].message + '\n';
    } else {
      if (frmElement) {
        clearFieldErrorHighlight(frmElement);
      }
    }
  });
    return errorLists;
  },
  
  setFieldErrorHighlight: function (id) {
    if ($('#' + value).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', invalidBorder);
      $($('#select2-' + id + '-container').parent()).css('background', invalidBackground);
    }
    else {
      $('#' + id).css('border-color', invalidBorder);
      $('#' + id).css('background', invalidBackground);
    }
  },

  clearFieldErrorHighlight: function (id) {
    if ($('#' + id).is('select')) {
      $($('#select2-' + id + '-container').parent()).css('border-color', '');
      $($('#select2-' + id + '-container').parent()).css('background', '');
    }
    else {
      $('#' + id).css('border-color', '');
      $('#' + id).css('background', '');
    }
  },

  clearHighlightedIterErrors: function () {
    var fields = [
      'teamSelectList',
      'iterationName',
      'iterationStartDate',
      'iterationEndDate',
      'commStories',
      'commPoints',
      'memberCount',
      'fteThisiteration',
      'commStoriesDel',
      'commPointsDel',
      'DeploythisIteration',
      'defectsStartBal',
      'defectsIteration',
      'defectsClosed',
      'defectsEndBal',
      'cycleTimeWIP',
      'cycleTimeInBacklog',
      'teamChangeList',
      'commentIter',
      'clientSatisfaction',
      'teamSatisfaction'
    ];

    for (j = 0; j < fields.length; j++) {
      clearFieldErrorHighlight(fields[j]);
    }
  },

  render: function() {
    
    var subStyle = {
      'width': '410px'
    };
    var subStyle2 = {
      'width': '730px'
    };
    
    return (
      <form className='ibm-column-form'>
        <Management updateForm={this.populateForm} enableFormFields={this.enableFormFields} ref='management' iteration={this.state.iteration}/>
        <Commitment updateForm={this.populateForm} enableFields={this.state.enableFields} ref='commitment' iteration={this.state.iteration}/>
        <Result updateForm={this.populateForm} enableFields={this.state.enableFields} ref='result' iteration={this.state.iteration}/>
        <Metrics updateForm={this.populateForm} ref='metrics' iteration={this.state.iteration}/>
        <Buttons ref='buttons' iteration={this.state.iteration} parentUpdate = {this.updateIterationInfo}/>
        <h2 className='ibm-bold ibm-h4'>Last update</h2>
        <div className='ibm-rule ibm-alternate-1'>
          <hr/>
        </div>
        <div>
          <span>
            Last update:<span  id='lastUpdateTimestamp'>{this.state.lastUpdateTimestamp}</span>&nbsp;&nbsp;&nbsp;&nbsp;|&nbsp;&nbsp;&nbsp;
            Updated by:<span  id='lastUpdateUser'>{this.state.iteration.updatedBy}</span>
          </span>
        </div>
        <div id='debugSection'>
          <label>
            <span>Doc id for this page(for SIT only):</span>
          </label>
          <span id='doc_id'>{this.state.id}</span>
        </div>
      </form>
    )
  }

});

module.exports = IterationForm;
