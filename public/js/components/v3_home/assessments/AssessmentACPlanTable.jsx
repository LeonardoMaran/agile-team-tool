var React = require('react');
var api = require('../../api.jsx');
var _ = require('underscore');
var moment = require('moment');
var ReactDOM = require('react-dom');
var InlineSVG = require('svg-inline-react');
var DatePicker = require('react-datepicker');
var AssessmentDatePicker = require('./AssessmentDatePicker.jsx');
var actionPlanSelection = [];

var AssessmentACPlanTable = React.createClass({
  getInitialState: function() {
    return (
      {
        actionPlans : []
      }
    )
  },
  componentWillMount: function() {
    var self = this;
    actionPlanSelection = [];
    _.each(self.props.tempAssess.componentResults, function(componentResult){
      _.each(componentResult.assessedComponents, function(assessedComponent){
        var newAssessedComponent = _.clone(assessedComponent);
        newAssessedComponent['componentName'] = componentResult['componentName'];
        actionPlanSelection.push(newAssessedComponent);
      });
    })
  },
  componentDidMount: function() {
    this.initialHandler();
  },
  componentDidUpdate: function() {
    $('.assessment-acplan-table > .table-block').off('hover');
    $('.practice-name-selection').off('change');
    this.initialHandler();
  },
  initialHandler: function() {
    var self = this;
    if (self.props.loadDetailTeam.access) {
      $('.assessment-acplan-table > .table-block').hover(function(){
        var id = $(this)[0].id;
        $('#' + id + ' .action-plan-delete').css('display', 'block');
      },function(){
        var id = $(this)[0].id;
        $('#' + id + ' .action-plan-delete').css('display', 'none');
      })
    }
    $('.practice-name-selection').change(self.actionPlanChangeHandler);
  },
  actionPlanChangeHandler: function(e) {
    var self = this;
    var tempActionPlans = self.getActionPlansFromTable();
    var idx = parseInt(e.target.id.substring(e.target.id.indexOf('_')+1, e.target.id.length));
    var componentSelected = _.find(actionPlanSelection, function(aps){
      if (aps.practiceName == e.target.value) {
        return aps;
      }
    });
    if (!_.isEmpty(componentSelected)) {
      tempActionPlans[idx]['practiceName'] = componentSelected['practiceName'];
      tempActionPlans[idx]['componentName'] = componentSelected['componentName'];
      tempActionPlans[idx]['principleName'] = componentSelected['principleName'];
      tempActionPlans[idx]['principleId'] = componentSelected['principleId'];
      tempActionPlans[idx]['practiceId'] = componentSelected['practiceId'];
      tempActionPlans[idx]['currentScore'] = componentSelected['currentScore'];
      tempActionPlans[idx]['targetScore'] = componentSelected['targetScore'];
    }
    self.setState({actionPlans: tempActionPlans});
  },
  addNewActionPlan: function() {
    var self = this;
    var tempActionPlans = self.getActionPlansFromTable();
    var newActionPlan = {
      actionStatus: 'Open',
      keyMetric: '',
      progressSummary: '',
      targetScore: actionPlanSelection[0].targetScore,
      currentScore: actionPlanSelection[0].currentScore,
      improveDescription: '',
      practiceName: actionPlanSelection[0].practiceName,
      practiceId: actionPlanSelection[0].practiceId,
      principleName: actionPlanSelection[0].principleName,
      principleId: actionPlanSelection[0].principleId,
      componentName: actionPlanSelection[0].componentName,
      isUserCreated: true,
      actionPlanId: _.isEmpty(self.state.actionPlans)?self.props.tempAssess.actionPlans.length:self.state.actionPlans.length
    }
    tempActionPlans.push(newActionPlan);
    self.setState({actionPlans: tempActionPlans});
  },
  deleteActionPlan: function(idx) {
    var self = this;
    var tempActionPlans = self.getActionPlansFromTable();
    tempActionPlans.splice(idx, 1);
    self.setState({actionPlans: tempActionPlans});
  },
  cancelActionPlan: function() {
    var self = this;
    if(confirm('You have requested to cancel all changes you made on this action plan.  All changes will be removed. Please confirm that you want to proceed with this cancel changes.')){
      self.setState({actionPlans: self.props.tempAssess.actionPlans});
    }
  },
  saveActionPlan: function() {
    var self = this;
    var tempActionPlans = self.getActionPlansFromTable();
    self.props.tempAssess.actionPlans = tempActionPlans;
    api.updateAssessment(self.props.tempAssess)
      .then(function(result){
        self.setState({actionPlans: self.props.tempAssess.actionPlans});
        $('#lastUpdatedByEmail').html(result.updatedBy);
        $('#lastUpdatedByTime').html(moment.utc(result.updateDate).format('DD MMM YYYY'));
        _.find(self.props.loadDetailTeam.assessments, function(assess, idx){
          if (assess._id.toString() == result._id.toString()) {
            self.props.loadDetailTeam.assessments[idx] = result;
          }
        });
        self.props.updateAssessmentSummary();
        alert('Your action plan has been saved.');
      })
      .catch(function(err){
        console.log(err);
      })
  },
  getActionPlansFromTable: function() {
    var self = this;
    var tableActionPlans = [];
    _.each($('.assessment-acplan-table > .table-block'), function(tableBlock, idx){
      var tempActionPlan = {
        actionStatus: $('#actionPlanSelect_' + idx).val(),
        keyMetric: self.htmlDecode($('#actionPlanKeyMetric_' + idx).val()),
        progressSummary: self.htmlDecode($('#actionPlanProgressSummary_' + idx).val()),
        targetScore: parseInt($('#actionPlanTargetScore_' + idx).html()),
        currentScore: parseInt($('#actionPlanCurrentScore_' + idx).html()),
        improveDescription: self.htmlDecode($('#actionPlanImproveDescription_' + idx).val()),
        practiceName: self.htmlDecode($('#actionPlanPracticeName_' + idx + ' > h1').css('display') == 'block'?$('#actionPlanPracticeName_' + idx + ' > h1').html():$('#actionPlanPracticeName_' + idx + ' > select').val()),
        practiceId: parseInt($('#actionPlanPracticeId_' + idx).html()),
        principleName: self.htmlDecode($('#actionPlanPrincipleName_' + idx).html()),
        principleId: parseInt($('#actionPlanPricipleId_' + idx).html()),
        componentName: self.htmlDecode($('#actionPlanComponentName_' + idx).html()),
        isUserCreated: $('#actionPlanIsUserCreated_' + idx).html() == 'true',
        actionPlanId: idx
      }
      if ($('#actionPlanReviewDate_' + idx).html() != 'Override') {
        tempActionPlan['reviewDate'] = new Date(moment.utc($('#actionPlanReviewDate_' + idx).html(), 'DD MMM YYYY'));
      }
      tableActionPlans.push(tempActionPlan);
    });
    return tableActionPlans;
  },
  htmlDecode: function(value){
    return $('<div/>').html(value).text();
  },
  htmlEncode: function(value){
    return $('<div/>').text(value).html();
  },
  render: function(){
    var self = this;
    if (self.props.tempAssess) {
      if (self.props.loadDetailTeam.access) {
        var haveAccess = true;
      } else {
        haveAccess = false;
      }
      var practiceNameSelection = actionPlanSelection.map(function(aps, idx){
        return (
          <option key={'aps_' + idx} value={aps.practiceName}>{aps.practiceName}</option>
        )
      });
      if (!_.isEmpty(this.state.actionPlans)) {
        var actionPlans = this.state.actionPlans;
      } else {
        actionPlans = self.props.tempAssess.actionPlans
      }
      var tableBlocks = actionPlans.map(function(ap, idx){
        var reviewDate = ap.reviewDate==null?'Override':moment.utc(ap.reviewDate).format('DD MMM YYYY');
        var reviewDeteStyle = {
          color: ap.reviewDate==null?'#4178BE':'#323232',
          cursor: haveAccess?'pointer':'not-allowed'
        }
        var readOnlyStyle = {
          cursor: haveAccess&&ap.isUserCreated?'auto':'not-allowed',
          color: haveAccess&&ap.isUserCreated?'#323232':'#777677'
        }
        var readOnlyStyle2 = {
          cursor: haveAccess?'auto':'not-allowed',
          color: haveAccess?'#323232':'#777677'
        }
        return (
          <div key={'actionPlan_' + idx} id={'actionPlan_' + idx} class='table-block'>
            <div style={{'display':'none'}} class='other-info'>
              <span id={'actionPlanPricipleId_' + idx}>{ap.principleId}</span>
              <span id={'actionPlanPracticeId_' + idx}>{ap.practiceId}</span>
              <span id={'actionPlanComponentName_' + idx}>{ap.componentName}</span>
              <span id={'actionPlanIsUserCreated_' + idx}>{ap.isUserCreated?'true':'false'}</span>
            </div>
            <div style={{'width':'10%'}} class='practice-name' id={'actionPlanPracticeName_' + idx}>
              <h1 style={{'display':ap.isUserCreated?'none':'block'}}>{ap.practiceName}</h1>
              <select style={{'display':ap.isUserCreated?'block':'none'}} class='practice-name-selection' id={'practiceNameSelection_' + idx} defaultValue={ap.practiceName}>
                {practiceNameSelection}
              </select>
            </div>
            <div style={{'width':'10%'}} class='principle-name'>
              <h1 id={'actionPlanPrincipleName_' + idx}>{ap.principleName}</h1>
            </div>
            <div style={{'width':'6%'}}>
              <h1 id={'actionPlanCurrentScore_' + idx}>{ap.currentScore}</h1>
            </div>
            <div style={{'width':'6%'}}>
              <h1 id={'actionPlanTargetScore_' + idx} >{ap.targetScore}</h1>
            </div>
            <div style={{'width':'15%'}}>
              <textarea id={'actionPlanImproveDescription_' + idx} readOnly={!haveAccess||!ap.isUserCreated} style={readOnlyStyle} maxLength='350' defaultValue={ap.improveDescription}/>
            </div>
            <div style={{'width':'15%','marginLeft':'1%'}}>
              <textarea id={'actionPlanProgressSummary_' + idx} readOnly={!haveAccess} style={readOnlyStyle2} maxLength='350' defaultValue={ap.progressSummary}/>
            </div>
            <div style={{'width':'15%','marginLeft':'1%'}}>
              <textarea id={'actionPlanKeyMetric_' + idx} readOnly={!haveAccess} style={readOnlyStyle2} maxLength='350' defaultValue={ap.keyMetric} />
            </div>
            <div style={{'width':'8%','marginLeft':'1%'}}>
              <h1 id={'actionPlanReviewDate_' + idx} style={reviewDeteStyle}>{reviewDate}</h1>
            </div>
            <div style={{'width':'8%'}}>
              <div>
                <select disabled={!haveAccess} id={'actionPlanSelect_' + idx} defaultValue={ap.actionStatus}>
                  <option value='Open'>{'Open'}</option>
                  <option value='In-progress'>{'In-progress'}</option>
                  <option value='Closed'>{'Closed'}</option>
                </select>
              </div>
            </div>
            <div style={{'width':'4%','display':haveAccess?'block':'none'}}>
              <div class='action-plan-delete' style={{'cursor':'pointer','display':'none'}} onClick={self.deleteActionPlan.bind(null, idx)}>
                <InlineSVG src={require('../../../../img/Att-icons/att-icons_delete.svg')}></InlineSVG>
              </div>
            </div>
          </div>
        );
      });
    }
    return (
      <div class='assessment-acplan-table' id={'assessmentContainer' + self.props.componentId}>
        <div class='header-title'>
          <div style={{'width':'10%'}}>
            <h1>{'Related Practice'}</h1>
          </div>
          <div style={{'width':'10%'}}>
            <h1>{'Principle'}</h1>
          </div>
          <div style={{'width':'6%'}}>
            <h1>{'Current'}</h1>
          </div>
          <div style={{'width':'6%'}}>
            <h1>{'Target'}</h1>
          </div>
          <div style={{'width':'15%'}}>
            <h1>{'How do we get better?'}</h1>
          </div>
          <div style={{'width':'15%','marginLeft':'1%'}}>
            <h1>{'Progress Summary'}</h1>
          </div>
          <div style={{'width':'15%','marginLeft':'1%'}}>
            <h1>{'Key Metric'}</h1>
          </div>
          <div style={{'width':'8%','marginLeft':'1%'}}>
            <h1>{'Review Date'}</h1>
          </div>
          <div style={{'width':'8%'}}>
            <h1>{'Status'}</h1>
          </div>
        </div>
        {tableBlocks}
        <div class='action-plan-add'>
          <button disabled={!haveAccess} onClick={self.addNewActionPlan} type='button' id='addActionPlan' class='ibm-btn-sec ibm-btn-blue-50'>{'Add Action Item'}</button>
        </div>
        <div class='action-plan-btns'>
          <button type='button' id='cancelACPlanBtn' class='ibm-btn-sec ibm-btn-blue-50' disabled={!haveAccess} onClick={self.cancelActionPlan}>{'Cancel Changes'}</button>
          <button type='button' id='saveACPlanBtn' class='ibm-btn-pri ibm-btn-blue-50' style={{'marginRight':'1%'}}disabled={!haveAccess} onClick={self.saveActionPlan}>{'Save Action Plan'}</button>
        </div>
      </div>
    );
  }
});
module.exports = AssessmentACPlanTable;
