var React = require('react');
var api = require('../../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');
var AssessmentActiveTemplates = require('./AssessmentActiveTemplates.jsx');
var AssessmentButtons = require('./AssessmentButtons.jsx');

var AssessmentPopover = React.createClass({
  getInitialState: function() {
    return {
      lcAssessTemplate: {},
      ddAssessTemplate: {},
      isUpdate: true
    };
  },
  componentWillMount: function() {
  },
  componentDidMount: function() {
    $('#assessmentTeamTypeSelector').select2({'width':'100%','dropdownParent':$('.assessment-popover-block')});
    $('#assessmentSoftwareTypeSelector').select2({'width':'100%','dropdownParent':$('.assessment-popover-block')});
    $('#assessmentTeamTypeSelector').change(this.ttChangeHandler);
    $('#assessmentSoftwareTypeSelector').change(this.stChangeHandler);
  },
  componentDidUpdate: function() {
  },
  ttChangeHandler: function(e) {
    var self = this;
    self.setState({isUpdate: false});
  },
  stChangeHandler: function(e) {
    var self = this;
    self.setState({isUpdate: false});
  },
  showBlock: function(id) {
    $('#showBlockBtn' + id).hide();
    $('#hideBlockBtn' + id).show();
    $('#assessmentContainer' + id).show();
  },
  hideBlock: function(id) {
    $('#showBlockBtn' + id).show();
    $('#hideBlockBtn' + id).hide();
    $('#assessmentContainer' + id).hide();
  },
  expandAll: function(id) {
    $('#assessmentContainer' + id + ' a.ibm-twisty-trigger').parent().addClass('ibm-active');
    $('#assessmentContainer' + id + ' a.ibm-twisty-trigger').removeClass('collapse');
    $('#assessmentContainer' + id + ' a.ibm-twisty-trigger').addClass('expand');
    $('#assessmentContainer' + id + ' .ibm-twisty-body').css('display','block');
  },
  collapseAll: function(id) {
    $('#assessmentContainer' + id + ' a.ibm-twisty-trigger').parent().removeClass('ibm-active');
    $('#assessmentContainer' + id + ' a.ibm-twisty-trigger').addClass('collapse');
    $('#assessmentContainer' + id + ' a.ibm-twisty-trigger').removeClass('expand');
    $('#assessmentContainer' + id + ' .ibm-twisty-body').css('display','none');
  },
  render: function() {
    var self = this;
    var assessDraft = {};
    var lcAssessTemplate = {};
    var ddAssessTemplate = {};
    if (self.props.loadDetailTeam.assessments.length > 0 && self.props.loadDetailTeam.assessments[0].assessmentStatus == 'Draft') {
      assessDraft = self.props.loadDetailTeam.assessments[0];
    }
    if (self.props.loadDetailTeam.access) {
      var haveAccess = false;
    } else {
      haveAccess = true;
    }
    if (_.isEmpty(assessDraft)) {
      var submitDate = 'On Submission';
      var lastUpdatedBy = 'On Submission';
      var lastUpdated = null;
      var assessType = $('#assessmentTeamTypeSelector').val() == undefined?'Project':$('#assessmentTeamTypeSelector').val();
      var deliversSoftware = $('#assessmentSoftwareTypeSelector').val() == undefined?'Yes':$('#assessmentSoftwareTypeSelector').val();
      if (assessType == 'Project') {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[0];
      } else {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[1];
      }
      if (deliversSoftware == 'Yes') {
        self.state.ddAssessTemplate = self.props.assessTemplate.components[2];
      } else {
        self.state.ddAssessTemplate = {};
      }
    } else {
      submitDate = moment.utc(assessDraft.submittedDate).format('DD MMM YYYY');
      lastUpdatedBy = assessDraft.updatedBy;
      lastUpdated = ' (' + moment.utc(assessDraft.updateDate).format('DD MMM YYYY') + ')';
      assessType = $('#assessmentTeamTypeSelector').val() == undefined?assessDraft.type:$('#assessmentTeamTypeSelector').val();
      deliversSoftware = $('#assessmentSoftwareTypeSelector').val() == undefined?(assessDraft.deliversSoftware?'Yes':'No'):$('#assessmentSoftwareTypeSelector').val();
      if (assessType == 'Project') {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[0];
      } else {
        self.state.lcAssessTemplate = self.props.assessTemplate.components[1];
      }
      if (deliversSoftware == 'Yes') {
        self.state.ddAssessTemplate = self.props.assessTemplate.components[2];
      } else {
        self.state.ddAssessTemplate = {};
      }
    }
    return (
      <div tabIndex='1' class='assessment-popover-block'>
        <div class='assessment-title'>
          <h1>{'Agile Maturity Team Assessment'}</h1>
          <div onClick={self.props.hideAssessmentPopover}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons-close.svg')}></InlineSVG>
          </div>
        </div>
        <div class='assessment-header'>
          <div class='header-title'>
            <h1>{self.props.loadDetailTeam.team.name}</h1>
          </div>
          <div class='assessment-status'>
            <div class='status-title'>
              <h1 style={{'width':'12%'}}>{'Team Type'}</h1>
              <h1 style={{'width':'17%','left':'10%'}}>{'Delivers Software'}</h1>
              <h1 style={{'width':'16%','left':'16%'}}>{'Submission Date'}</h1>
              <h1 style={{'width':'16%','left':'26%'}}>{'Last Updated By'}</h1>
            </div>
            <div class='status-selection'>
              <div class='team-type-selector'>
                <select id='assessmentTeamTypeSelector' disabled={haveAccess} defaultValue={assessType}>
                  <option value='Project'>{'Project'}</option>
                  <option value='Operations'>{'Operations'}</option>
                </select>
              </div>
              <div class='team-type-selector' style={{'left':'3%'}}>
                <select id='assessmentSoftwareTypeSelector' disabled={haveAccess} defaultValue={deliversSoftware}>
                  <option value='Yes'>{'Yes'}</option>
                  <option value='No'>{'No'}</option>
                </select>
              </div>
              <div class='submit-date-selector'>
                <h1>{submitDate + ' ('}</h1>
                <h2 style={{'cursor':haveAccess?'none':'pointer'}}>{'override'}</h2>
                <h1>{')'}</h1>
              </div>
              <div class='last-updated-by'>
                <h1>{lastUpdatedBy}</h1>
                <h1>{lastUpdated}</h1>
              </div>
            </div>
          </div>
        </div>
        <div class='lc-header'>
          <div class='header-title'>
            <h1>{'Leadership and Collaboration'}</h1>
          </div>
          <div class='hideBlock-btn' id='hideBlockBtn1' style={{'display':'block'}} onClick={self.hideBlock.bind(null, '1')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_show.svg')}></InlineSVG>
          </div>
          <div class='showBlock-btn' id='showBlockBtn1' style={{'display':'none'}} onClick={self.showBlock.bind(null, '1')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
          </div>
          <div class='collapseall-btn' onClick={self.collapseAll.bind(null, '1')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_collapseall.svg')}></InlineSVG>
          </div>
          <div class='expandall-btn' onClick={self.expandAll.bind(null, '1')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_expandall.svg')}></InlineSVG>
          </div>
        </div>
        <div class='agile-maturity' id='assessmentContainer1'>
          <AssessmentActiveTemplates assessTemplate={self.state.lcAssessTemplate} assessDraft={assessDraft} haveAccess={haveAccess} assessTemplateId={'0'} isUpdate={self.state.isUpdate}/>
        </div>
        <div class='lc-header'>
          <div class='header-title'>
            <h1>{'Delivery and DevOps'}</h1>
          </div>
          <div class='hideBlock-btn' id='hideBlockBtn2' style={{'display':'block'}} onClick={self.hideBlock.bind(null, '2')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_show.svg')}></InlineSVG>
          </div>
          <div class='showBlock-btn' id='showBlockBtn2' style={{'display':'none'}} onClick={self.showBlock.bind(null, '2')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_hide.svg')}></InlineSVG>
          </div>
          <div class='collapseall-btn' onClick={self.collapseAll.bind(null, '2')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_collapseall.svg')}></InlineSVG>
          </div>
          <div class='expandall-btn' onClick={self.expandAll.bind(null, '2')}>
            <InlineSVG src={require('../../../../img/Att-icons/att-icons_expandall.svg')}></InlineSVG>
          </div>
        </div>
        <div class='agile-maturity' id='assessmentContainer2'>
          <AssessmentActiveTemplates assessTemplate={self.state.ddAssessTemplate} assessDraft={assessDraft} haveAccess={haveAccess} assessTemplateId={'1'} isUpdate={self.state.isUpdate}/>
        </div>
        <AssessmentButtons assessDraft={assessDraft} haveAccess={haveAccess}/>
      </div>
    )
  }
});
module.exports = AssessmentPopover;
