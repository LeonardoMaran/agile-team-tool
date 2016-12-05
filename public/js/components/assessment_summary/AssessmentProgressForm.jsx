var React = require('react');
var api = require('../api.jsx');
var utils = require('../../utils');
var ComponentResultItem = require('./ComponentResultItem.jsx');
var OverallResultItem = require('./OverallResultItem.jsx');
var ProjectComponent = require('./ProjectComponent.jsx');
var DeliveryComponent = require('./DeliveryComponent.jsx');
var ActionPlanComponent = require('./ActionPlanComponent.jsx');
var LastUpdateSection = require('./LastUpdateSection.jsx');
var DebugSection = require('./DebugSection.jsx');
var IndependentAssessorSection = require('./IndependentAssessorSection.jsx');
var _ = require('underscore');
var moment = require('moment');
var team = null;
var assessmentData = [];
var hasIndAssessment = false;
var selAssessment;
var principles = [];

var teamId = '';
var assessId = '';
var displayType = {'display': 'none'};

var AssessmentProgressForm = React.createClass({
  getInitialState: function() {
    var urlParameters = utils.getJsonParametersFromUrl();
    var teamId = urlParameters.id;
    var assessId = urlParameters.assessId;
    var assessResult = {};
    // console.log('AssessmentProgressForm urlParameters:',urlParameters);
    return {
      teamId: teamId,
      assessId: assessId,
      assessResult: assessResult
    }
  },

  componentDidMount: function() {
    var self = this;
    var teamId = self.state.teamId;
    var assessId = self.state.assessId;
    self.initShowHideWidget();
    api.getTeamAssessments(teamId, assessId)
      .then(function(assessResult) {
        console.log('AssessmentProgressForm componentDidMount assessResult:',assessResult[0]);
        console.log('AssessmentProgressForm componentDidMount total componentResults:', assessResult[0].componentResults.length);
        // console.log('AssessmentProgressForm componentDidMount componentResults:', assessResult[0].componentResults);
        self.setState({assessResult: assessResult});
        // self.processData(teamId, assessId, assessResult)
      })
      .catch(function(err) {
        return console.log(err);
      });
  },

  hasDevOps: function(team_dlvr_software) {
    console.log('[hasDevOps] team_dlvr_software:',team_dlvr_software)
    if (team_dlvr_software) {
      /*$('#delContainer').remove();*/ // dont use this bec sometimes React will throw error
      displayType = {'display': 'block'};
    }
  },

  processData: function(teamId, assessId, jsonData) {
    jsonData = this.sortAssessments(jsonData);
    var filtered = this.filterSubmitted(jsonData, teamId, assessId);
    filtered.reverse();
    return filtered;
  },

  sortAssessments: function(assessments) {
    if (assessments != null && assessments.length > 1) {
      assessments.sort(function(a, b) {
        if (a['assessmentStatus'].toLowerCase() == 'draft' && b['assessmentStatus'].toLowerCase() == 'draft') {
          var aCreateDate = a['createDate'].split(' ')[0].replace(/-/g, '/') + ' ' + a['createDate'].split(' ')[1];
          var bCreateDate = b['createDate'].split(' ')[0].replace(/-/g, '/') + ' ' + b['createDate'].split(' ')[1];
          if (new Date(bCreateDate).getTime() == new Date(aCreateDate).getTime()) {
            return 0;
          } else {
            return (new Date(bCreateDate).getTime() > new Date(aCreateDate).getTime()) ? 1 : -1;
          }

        } else if (a['assessmentStatus'].toLowerCase() == 'submitted' && b['assessmentStatus'].toLowerCase() == 'submitted') {
          var aSubmitDate = a['submittedDate'].split(' ')[0].replace(/-/g, '/') + ' ' + a['submittedDate'].split(' ')[1];
          var bSubmitDate = b['submittedDate'].split(' ')[0].replace(/-/g, '/') + ' ' + b['submittedDate'].split(' ')[1];
          if (new Date(bSubmitDate).getTime() == new Date(aSubmitDate).getTime()) {
            return 1;
          } else {
            return (new Date(bSubmitDate).getTime() > new Date(aSubmitDate).getTime()) ? 1 : -1;
          }
        } else {
          if (b['assessmentStatus'].toLowerCase() == 'submitted')
            return -1;
          else
            return 1;
        }

      });
    }
    return assessments;
  },

  /**
   * Filters all Submitted assessment of certain type based on the first assessment it finds.
   *
   * @param assessmtList - list of assessments for a team.
   * @param teamId - team id
   * @param assessId - assessment id
   * @returns {Array} - list of filtered assessments of certain type.
   */
  filterSubmitted: function(assessmtList, teamId, assessId) {
    var assessmt_data = [];
    var assessmtType = '';
    var identifier = '';
    if (assessmtList != undefined) {
      for (var i = 0; i < assessmtList.length; i++) {
        if (assessmtList[i].teamId == teamId && assessmtList[i].assessmentStatus == 'Submitted' && assessmtList[i]._id == assessId) {
          assessmtType = this.getAssessmentType(assessmtList[i]);
          break;
        }
      }

      for (var i = 0; i < assessmtList.length; i++) {
        if (assessmtList[i].teamId == teamId && assessmtList[i].assessmentStatus == 'Submitted') {
          identifier = this.getAssessmentType(assessmtList[i]);

          if (assessmtType == '') {
            assessmtType = identifier;
            assessmt_data.push(assessmtList[i]);

          } else if (assessmtType == identifier) {
            assessmt_data.push(assessmtList[i]);

          }
        }
      }
    }
    return assessmt_data;
  },

  /**
   * Find the assessment component that would indicate if its a Project or Ops related assessment.
   *
   * @param assessment - assessment to verify
   * @returns {String} - assessment type.
   */
  getAssessmentType: function(assessment) {
    var identifier = '';
    var results = assessment['componentResults'];
    // console.log('getAssessmentType results:',results)
    if (results != undefined) {
      for (var j = 0; j < results.length; j++) {
        if ((results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('ops') == -1) &&
          (results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('operations') == -1)) {
          identifier = 'Project';
        } else if ((results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('ops') > -1) ||
          (results[j]['componentName'].toLowerCase().indexOf('leadership') > -1 && results[j]['componentName'].toLowerCase().indexOf('operations') > -1)) {
          identifier = 'Ops';
        } else {
          identifier = '';
        }
        break;
      }
      return identifier;
    }
  },

  setIndAssessor: function(assessor) {
    console.log('[setIndAssessor] assessor:',assessor);
    $('#indAssessor').text(assessor);
  },

  /**displaySelected: function(assessmt_data) {
    console.log('[displaySelected] assessmt_data:',assessmt_data);
    var lastRecord = -1;
    for (var y = 0; y < assessmt_data.length; y++) {
      //index 0 - leadership
      //index 1- delivery
      var assessmt = assessmt_data[y];
      // console.log('[displaySelected] assessmt._id:',assessmt._id);
      // console.log('[displaySelected] assessId:',assessId);
      console.log('[displaySelected] assessmt:', assessmt);
      if (assessmt._id !== undefined) {
        lastRecord = y;

        var selfAsstDate = '';
        if (assessmt['submittedDate'] != null && assessmt['submittedDate'] != '') {
          selfAsstDate = showDateMMDDYYYY(assessmt['submittedDate'].substring(0, assessmt['submittedDate'].indexOf(' ')));
        }

        var indAsstDate = '';

        if (assessmt.assessedDate != null && assessmt.assessedDate != '') {
          indAsstDate = showDateMMDDYYYY(assessmt.assessedDate.substring(0, assessmt.assessedDate.indexOf(' ')));
        }
        console.log('[displaySelected] indAsstDate:',indAsstDate)
        // setIndAssessor(assessmt.assessorUserId);
        // loadHeader(selfAsstDate, assessmt.assessmentStatus, indAsstDate, assessmt.assessorStatus); // not needed

        $('#lastUpdateUser').html(assessmt.updatedByUserId);
        $('#lastUpdateTimestamp').html(showDateUTC(assessmt.updateDate));
        $('#doc_id').html(assessmt['_id']);

        if (assessmt.assessorStatus == 'Submitted') {
          hasIndAssessment = true;
        } else {
          removeIndAssessment();
        }

        var firstIndex = lastRecord - 6;
        if (firstIndex < 0) {
          firstIndex = 0;
        } else {
          firstIndex = firstIndex + 1;
        }
        for (var x = firstIndex; x <= lastRecord; x++) {
          if (assessmt_data[x] != null) {
            assessmentData.push(assessmt_data[x]);
          }
        }

        if (assessmt.componentResults != null) {
          console.log('[displaySelected] assessmt.componentResults.length:', assessmt.componentResults.length);
          console.log('[displaySelected] assessmt.componentResults:', assessmt.componentResults);
          var practicesCnt = 0;
          for (var x = 0; x < assessmt.componentResults.length; x++) {
            var assessmt_cmpnt_rslts = assessmt.componentResults[x];
            console.log('[displaySelected] assessmt_cmpnt_rslts:',assessmt_cmpnt_rslts)
            console.log('[displaySelected] assessmt_cmpnt_rslts.componentName:',assessmt_cmpnt_rslts.componentName)
            var id = '';
            if (x == 0) {
              id = 'resultBody';
            } else {
              id = 'deliveryResult';
            }

            this.setAssessHeader(x, assessmt_cmpnt_rslts.componentName);
            this.displayOverAll(id, assessmt_cmpnt_rslts.currentScore, assessmt_cmpnt_rslts.targetScore, x);

            for (var y = 0; y < assessmt_cmpnt_rslts.assessedComponents.length; y++) {
              var assessed_cmpnt = assessmt_cmpnt_rslts.assessedComponents[y];
              this.loadResult(id, assessed_cmpnt, x);
              // storePrinciples(practicesCnt, assessed_cmpnt, assessmt_cmpnt_rslts.componentName);
              practicesCnt++;
            }
          }
        }

        // hasDevOps(assessmt.deliversSoftware);

        if (assessmt.actionPlans != null) {
          // displayActionPlan(assessmt.actionPlans);

          // if (hasAccess(teamId)) {
          //   if (assessmt.actionPlans.length > 0) {
          //     $('#saveActPlanBtn').removeAttr('disabled');
          //     $('#cancelActPlanBtn').removeAttr('disabled');
          //   }
          //   $('#addActEntryBtn').removeAttr('disabled');
          // }
        }
        selAssessment = assessId;
        break;
      }
    }
    //This is a temporary note while action plan is not yet fully implemented
    //addNote();
  },**/

  displaySelected: function(assessmt_data) {
    var lastRecord = -1;
    var hasIndAssessment = false;
    var resultRows = [];
    var loadResultArray = [];
    var overAllArray = [];
    var uuid = Math.random().toString(36).substr(2, 5);
    for (var ctr1 = 0; ctr1 < assessmt_data.length; ctr1++) {
      //index 0 - leadership
      //index 1- delivery
      var assessmt = assessmt_data[ctr1];
      console.log('[displaySelected] assessmt._id:',assessmt._id);
      // console.log('[displaySelected] assessId:',assessId);
      // console.log('[render] assessmt:', assessmt);
      if (assessmt._id !== undefined) {
        lastRecord = ctr1;
        var selfAsstDate = '';
        if (assessmt['submittedDate'] != null && assessmt['submittedDate'] != '') {
          selfAsstDate = utils.showDateMMDDYYYY(assessmt['submittedDate'].substring(0, assessmt['submittedDate'].indexOf(' ')));
        }
        var indAsstDate = '';
        if (assessmt.assessedDate != null && assessmt.assessedDate != '') {
          indAsstDate = utils.showDateMMDDYYYY(assessmt.assessedDate.substring(0, assessmt.assessedDate.indexOf(' ')));
        }
        console.log('[render] indAsstDate:',indAsstDate)
        self.setIndAssessor(assessmt.assessorUserId);
        // loadHeader(selfAsstDate, assessmt.assessmentStatus, indAsstDate, assessmt.assessorStatus); // not needed anymore

        $('#lastUpdateUser').html(assessmt.updatedByUserId);
        $('#lastUpdateTimestamp').html(utils.showDateUTC(assessmt.updateDate));
        $('#doc_id').html(assessmt['_id']);

        if (assessmt.assessorStatus == 'Submitted') {
          hasIndAssessment = true;
        } else {
          removeIndAssessment();
        }

        var firstIndex = lastRecord - 6;
        if (firstIndex < 0) {
          firstIndex = 0;
        } else {
          firstIndex = firstIndex + 1;
        }
        for (var x = firstIndex; x <= lastRecord; x++) {
          if (assessmt_data[x] != null) {
            assessmentData.push(assessmt_data[x]);
          }
        }

        if (assessmt.componentResults != null) {
          // console.log('[render] assessmt.componentResults:', assessmt.componentResults);
          var practicesCnt = 0;
          for (var ctr2 = 0; ctr2 < assessmt.componentResults.length; ctr2++) {
            var assessmt_cmpnt_rslts = assessmt.componentResults[ctr2];
            // console.log('[render] assessmt_cmpnt_rslts:', assessmt_cmpnt_rslts)
            // console.log('[render] assessmt_cmpnt_rslts.componentName:',assessmt_cmpnt_rslts.componentName)
            var id = '';
            if (ctr2 == 0) {
              id = 'resultBody';
            } else {
              id = 'deliveryResult';
            }
            self.displayOverAll(id, assessmt_cmpnt_rslts.currentScore, assessmt_cmpnt_rslts.targetScore, ctr2);
            overAllArray.push(<OverallResultItem
              key={`overall-${ctr2}-${ctr1}-${uuid}`}
              id={id}
              x={ctr2}
              counter={ctr1}
              currentScore={assessmt_cmpnt_rslts.currentScore}
              targetScore={assessmt_cmpnt_rslts.targetScore} 
              hasIndAssessment={hasIndAssessment}
              displaySelectedChart={self.displaySelectedChart} />);

            console.log('assessmt.componentResults x:',ctr2)
            console.log('assessmt.componentResults id:',id)
            self.setAssessHeader(ctr2, assessmt_cmpnt_rslts.componentName);
            // console.log('assessmt_cmpnt_rslts length:', assessmt_cmpnt_rslts.assessedComponents.length);
            for (var ctr3 = 0; ctr3 < assessmt_cmpnt_rslts.assessedComponents.length; ctr3++) {
              var assessed_cmpnt = assessmt_cmpnt_rslts.assessedComponents[ctr3];
              // loadResult(id, assessed_cmpnt, ctr2);
              // console.log('ctr2id:', id);
              loadResultArray.push(<ComponentResultItem
                key={`asmtresult-${ctr2}-${ctr3}-${uuid}`}
                hasIndAssessment={hasIndAssessment}
                displaySelectedChart={self.displaySelectedChart}
                assessed_cmpnt={assessed_cmpnt} x={ctr2} id={id} />);

              // storePrinciples(practicesCnt, assessed_cmpnt, assessmt_cmpnt_rslts.componentName);
              practicesCnt++;
            }
          }
        }

        self.hasDevOps(assessmt.deliversSoftware);

        // if (assessmt.actionPlans != null) {
          // displayActionPlan(assessmt.actionPlans);

          // if (hasAccess(teamId)) {
          //   if (assessmt.actionPlans.length > 0) {
          //     $('#saveActPlanBtn').removeAttr('disabled');
          //     $('#cancelActPlanBtn').removeAttr('disabled');
          //   }
          //   $('#addActEntryBtn').removeAttr('disabled');
          // }
        // }
        selAssessment = assessId;
        break;
      }

    }
      return {
        overAllArray: overAllArray,
        loadResultArray: loadResultArray
      }
  },

  showDateMMDDYYYY: function(formatDate) {
    var date = new Date(formatDate.replace(/-/g, '/'));
    var month = date.getUTCMonth() + 1;
    month = month.toString().length < 2 ? '0' + month.toString() : month.toString();
    var day = date.getUTCDate();
    day = day.toString().length < 2 ? '0' + day.toString() : day.toString();

    return month + '/' + day + '/' + date.getUTCFullYear();
  },

  showDateUTC: function(formatDate) {
    if (formatDate == null || formatDate == '' || formatDate == 'NaN') return 'Not available';
    //var utcTime = moment(formatDate).format('MMMM DD, YYYY, H:mm')format('MMM DD, YYYY, HH:mm (z);
    var utcTime = moment.utc(formatDate).format('MMM DD, YYYY, HH:mm (z)');
    return utcTime;
  },

  loadHeader: function(assessDate, status, indDate, indstatus) {
    // console.log('loadHeader......')
    // console.log('assessDate:',assessDate)
    // $('#teamName').text(teamName);
    $('#assessmentDt').text(utils.showDateDDMMMYYYY(assessDate));
    $('#selfStatus').text(status);
    if ($('#indAssessor').text() != '') {
      $('#indDt').text(utils.showDateDDMMMYYYY(indDate));
      $('#indStatus').text(indstatus);
    } else {
      $('#indAssmtStat').remove();
      $('#indAssmtDt').remove();
    }
  },

  setAssessHeader: function(index, assessName) {
    // console.log('[setAssessHeader] index:',index,' assessName:',assessName)
    $('#assessId_' + index + ' a').text($('#assessId_' + index + ' a').text() + ' ' + assessName);
  },

  displayOverAll: function(id, ovralcur_assessmt_score, ovraltar_assessmt_score, assessed_index) {
    this.loadDefaultChart(id, assessed_index);
  },

  loadDefaultChart: function(id, index) {
    console.log('[loadDefaultChart] id:',id);
    console.log('[loadDefaultChart] index:',index);
    var label = 'Overall';
    var graphId = '';
    if (id == 'resultBody') {
      graphId = 'container';
    } else if (id == 'deliveryResult') {
      graphId = 'deliveryContainer';
    }
    this.displaySelectedChart(null, index, label, graphId);
  },

  displaySelectedChart: function(event, assessed_index, id, elementId) {
    console.log('[displaySelectedChart] assessed_index:',assessed_index);
    console.log('[displaySelectedChart] id:',id);
    console.log('[displaySelectedChart] elementId:',elementId);
    var chartData = new Object();
    var title;
    if (id == 'Overall') {
      console.log('[displaySelectedChart] Overall!!');
      var ave = this.getOverAllRawData(assessed_index);
      chartData = this.plotOverAll(ave);
      title = id;
    } else {
      cat = this.getAssessedData(assessed_index, id);
      chartData = this.getChartData(cat);
      title = this.getPracticeName(assessed_index, id);
    }
    // console.log(' ')
    // console.log('[displaySelectedChart] title:', title)
    console.log('[displaySelectedChart] chartData:', chartData)
    var assessments = [];
    if (hasIndAssessment) {
      assessments = [{
        name: 'Target',
        data: chartData.target_score,
      }, {
        name: 'Current',
        data: chartData.current_score,
      }, {
        name: 'Independent',
        data: chartData.ind_score,
      }];
    } else {
      assessments = [{
        name: 'Target',
        data: chartData.target_score,
      }, {
        name: 'Current',
        data: chartData.current_score,
      }];
    }

    this.loadResultChart(elementId, title, 'line', chartData.categories, 'Maturity Level', assessments,
      null, 'Select practice from adjacent table to see the results.');
  },

  getOverAllRawData: function(assessed_index) {
    console.log('[getOverAllRawData assessmentData.length:',assessmentData.length);
    var result = [];
    for (var i = 0; i < assessmentData.length; i++) {
      var obj = new Object();
      obj.self_assessmt_dt = assessmentData[i]['submittedDate'];
      var assessmt_cmpnt = assessmentData[i].componentResults[assessed_index];
      obj.assessed = new Object;
      if (assessmt_cmpnt != null) {
        if (assessmt_cmpnt.targetScore != undefined)
          obj.assessed.targetScore = parseFloat(assessmt_cmpnt.targetScore);
        if (assessmt_cmpnt.currentScore != undefined)
          obj.assessed.currentScore = parseFloat(assessmt_cmpnt.currentScore);
      }
      result.push(obj);
    }
    return result;
  },

  plotOverAll: function(data) {
    var result = new Object();
    if (data != null) {
      result.categories = [];
      result.target_score = [];
      result.current_score = [];
      result.ind_score = [];
      for (var x = 0; x < data.length; x++) {
        var date = data[x].self_assessmt_dt;
        console.log('[plotOverAll] date:', date);
        // var formattedDate = utils.showDateDDMMMYYYY(date.substring(0, date.indexOf(' ')));
        var formattedDate = utils.showDateDDMMMYYYY(date);
        console.log('[plotOverAll] formattedDate:', formattedDate);
        result.categories[x] = formattedDate
        if (data[x].assessed.targetScore != null) {
          result.target_score[x] = data[x].assessed.targetScore;
        } else {
          result.target_score[x] = 0;
        }
        if (data[x].assessed.currentScore != null) {
          result.current_score[x] = data[x].assessed.currentScore;
        } else {
          result.current_score[x] = 0;
        }
      }
    }
    return result;
  },

  /*loadOverAll: function(id, ovralctar_assessmt_score, ovralcur_assessmt_score, assessed_index) {
    console.log('loadOverAll..... arguments:',arguments);
    var graphId = '';
    var label = 'Overall';
    if (id == 'resultBody') {
      graphId = 'container';
    } else if (id == 'deliveryResult') {
      graphId = 'deliveryContainer';
    }
    var link = "<a role='button' onclick=displaySelectedChart(" + assessed_index + ',' + "'" + label + "'" + ',' + graphId + ") style='cursor: pointer;'>" +
      'Overall' + '</a>';
    row = '<tr> <td> ' + link + '</td>';
    row += '<td>' + (ovralcur_assessmt_score != '' && ovralcur_assessmt_score != undefined ? ovralcur_assessmt_score : '-') + '</td>';
    row += '<td>' + (ovralctar_assessmt_score != '' && ovralctar_assessmt_score != undefined ? ovralctar_assessmt_score : '-') + '</td>';
    if (hasIndAssessment) {
      row += '<td>' + '-' + '</td>';
    }
    row = row + '</tr>';
    $('#' + id).append(row);
  },*/

  displayActionPlan: function(data) {
    var allowEdit = 'disabled';
    if (hasAccess(teamId)) {
      allowEdit = '';
    }
    for (var index = 0; index < data.length; index++) {
      var row = "<tr id = 'td_action_" + index + "'>";
      var userCreated = data[index].user_created;
      if (data[index] != undefined && data[index] != '') {
        if (userCreated != undefined && userCreated.toLowerCase() == 'yes') {
          row = row + '<td>' + "<input name=' " + index + "' aria-label='Select action' id='select_item_" + index + "' type='checkbox' onclick='deleteBtnControl()' " + allowEdit + '/> </td>';
          row = row + "<td id='td_practice_" + index + "' >" + "<span> <select aria-label='Practice list' id='practice_" + index + "' name='practice_" + index + "'  style='width: 100px; font-size: 11px;' onchange='prepopulate(" + index + ")' " + allowEdit + '> ' +
            '</select></span></td>';
        } else {
          row = row + "<td style='min-width: 15px;'>" + '&nbsp;' + '</td>';
          row = row + "<td id='td_practice_" + index + "' style='width: 100px;'>" + replaceEmpty(data[index].practice_name) + '</td>';
        }

        row = row + "<td id='td_principle_" + index + "' style='min-width: 100px;'>" + replaceEmpty(data[index].principle_name) + '</td>';
        row = row + "<td id='td_curScore_" + index + "'>" + replaceEmpty(data[index].cur_mat_lvl_score) + '</td>';
        row = row + "<td id='td_tarScore_" + index + "'>" + replaceEmpty(data[index].tar_mat_lvl_score) + '</td>';
        if (userCreated != undefined && userCreated.toLowerCase() == 'yes') {
          row = row + '<td>' + "<span><textarea aria-label='Action item' id='action_item_" + index + "' maxlength = '350' cols='28' style='resize: none; font-size: 11px;' type='text' name='action_item_" + index + "' " + allowEdit + '>' + replaceEmpty(data[index].how_better_action_item) + '</textarea></span> </td>';
        } else {
          row = row + '<td>' + "<span><textarea aria-label='Action item' id='action_item_" + index + "' maxlength = '350' cols='28' style='resize: none; font-size: 11px;' type='text' name='action_item_" + index + "' disabled>" + replaceEmpty(data[index].how_better_action_item) + '</textarea></span> </td>';
        }
        row = row + '<td>' + "<span><textarea aria-label='Progress summary' id='summary_" + index + "' maxlength = '350' type='text' name='summary_" + index + "' cols='28' style='resize: none; font-size: 11px;' " + allowEdit + '>' + replaceEmpty(data[index].progress_summ) + '</textarea></span> </td>';
        row = row + '<td>' + "<span><textarea aria-label='Key metric' id='metric_" + index + "' maxlength = '350' type='text' name='metric_" + index + "' cols='28' style='resize: none; font-size: 11px;' " + allowEdit + '>' + replaceEmpty(data[index].key_metric) + '</textarea></span> </td>';
        row = row + '<td>' + "<span style='position: relative; top: 12px;'><input aria-label='Review date' id='revDate_" + index + "' style='width: 60px; font-size: 11px;' type='text' value='" + replaceEmpty(data[index].review_dt) + "' name=''revDate_" + index + "' " + allowEdit + '> </span>' + '</td>';
        row = row + "<td id='td_status_" + index + "'>" + "<span> <select aria-label='Action status' id='status_" + index + "' name='status_" + index + "' " + allowEdit + " style='font-size: 11px; width: 80px;'> " +
          '</select></span></td>';
      }
      row = row + '</tr>';
      $('#actionPlan').append(row);
      jQuery('#revDate_' + index).datepicker();
      addActionStatusList(data[index].action_item_status, index);
      if (userCreated != undefined && userCreated.toLowerCase() == 'yes') {
        addActionPracticeList(index, data[index].practice_name);
      }
      if (allowEdit == 'disabled') {
        $('#status_' + index).css('color', 'grey');
      }

    }
  },

  getAssessedData: function(assessed_index, practice_id) {
    var result = [];
    for (var i = 0; i < assessmentData.length; i++) {
      var obj = new Object();
      obj.self_assessmt_dt = assessmentData[i]['submittedDate'];
      var assessmt_cmpnt = assessmentData[i].componentResults[assessed_index];
      obj.assessed = [];
      if (assessmt_cmpnt != null) {
        for (var x = 0; x < assessmt_cmpnt.assessedComponents.length; x++) {
          var assessed_cmpnt_tbl = assessmt_cmpnt.assessedComponents[x];
          if (assessed_cmpnt_tbl != null) {
            if (assessed_cmpnt_tbl.practiceId == practice_id) {
              obj.assessed[0] = assessed_cmpnt_tbl;
              break;
            }
          }
        }
      }
      result.push(obj);
    }
    return result;
  },

  getChartData: function(data) {
    // console.log('[getChartData] data.length:',data.length);
    console.log('[getChartData] data:',data);
    var result = new Object();
    if (data != null) {
      result.categories = [];
      result.target_score = [null];
      result.current_score = [null];
      result.ind_score = [null];
      for (var x = 0; x < data.length; x++) {
        var date = data[x].self_assessmt_dt;
        console.log('[getChartData] date:',date);
        result.categories[x] = utils.showDateDDMMMYYYY(date);
        for (var y = 0; y < data[x].assessed.length; y++) {
          if (data[x].assessed[y].targetScore != '') {
            result.target_score[x] = parseInt(data[x].assessed[y].targetScore);
          } else {
            result.target_score[x] = null;
          }
          if (data[x].assessed[y].currentScore != '') {
            result.current_score[x] = parseInt(data[x].assessed[y].currentScore);
          } else {
            result.current_score[x] = null;
          }
          if (data[x].assessed[y].assessorTarget != '') {
            result.ind_score[x] = parseInt(data[x].assessed[y].assessorTarget);
          } else {
            result.ind_score[x] = null;
          }
        }
      }
    }
    return result;
  },

  getPracticeName: function(assessed_index, practice_id) {
    // console.log('getPracticeName.....');
    var result = '';
    for (var i = 0; i < assessmentData.length; i++) {
      var assessmt_cmpnt = assessmentData[i].componentResults[assessed_index];
      if (assessmt_cmpnt != null) {
        for (var x = 0; x < assessmt_cmpnt.assessedComponents.length; x++) {
          var assessed_cmpnt_tbl = assessmt_cmpnt.assessedComponents[x];
          if (assessed_cmpnt_tbl != null) {
            if (assessed_cmpnt_tbl.practiceId == practice_id) {
              result = assessed_cmpnt_tbl.practiceName;
              break;
            }
          }
        }
      }
    }
    return result;
  },

  /**
   * id - element id to where the graph will be inserted
   * title - label for the graph
   * type - type of graph to be created (e.g. line, bar)
   * categories - label for the x-axis
   * yAxisLabel - label for the y-axis. pass null if no label needed
   * series - the array of values. should have an object with name and data on it
   * unit - unit for plotted values
   * addText - additional text to be displayed below the legend
   */
  loadResultChart: function(id, title, type, categories, yAxisLabel, series, unit, addText) {
    console.log('[loadResultChart] ');
    console.log('[loadResultChart] id:',id);
    console.log('[loadResultChart] title:',title);
    console.log('[loadResultChart] type:',type);
    console.log('[loadResultChart] categories:',categories);
    console.log('[loadResultChart] yAxisLabel:',yAxisLabel);
    console.log('[loadResultChart] series:',series);
    console.log('[loadResultChart] unit:',unit);
    console.log('[loadResultChart] addText:',addText);

    new Highcharts.Chart({
      chart: {
        type: type,
        renderTo: id,
        events: {
          load: function() {
            var text = this.renderer.text(addText, 145, 395)
              .css({
                width: '450px',
                color: '#222',
                fontSize: '11px'
              }).add();
          }
        }
      },

      title: {
        style: {
          'fontSize': '14px'
        },
        text: title
      },

      xAxis: {
        categories: categories,
        tickmarkPlacement: 'on'
      },

      yAxis: {
        max: 5,
        min: 0,
        title: {
          text: yAxisLabel
        },
        allowDecimals: false
      },

      credits: {
        enabled: false
      },

      tooltip: {
        valueSuffix: unit,
        formatter: function() {
          var s1 = this.series.chart.series[0].processedYData[this.point.index];
          var s2 = this.series.chart.series[1].processedYData[this.point.index];
          var s3;
          if (this.series.chart.series[2] != undefined) {
            s3 = this.series.chart.series[2].processedYData[this.point.index];
          }

          var formatResult = '';
          if (s1 == s2) {
            formatResult = '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.chart.series[0].name + ' :<b>' + s1 + '</b><br/>' + '<span style="color:' + this.series.chart.series[1].color + '">\u25CF</span>' + this.series.chart.series[1].name + ' :<b>' + s2 + '</b>';
          } else {
            formatResult = '<span style="color:' + this.series.color + '">\u25CF</span>' + this.series.name + ' :<b>' + this.y + '</b>';
          }

          if (s3 != undefined) {
            if (this.y == s3 && this.series.name != this.series.chart.series[2].name) {
              formatResult = formatResult + '<br/><span style="color:' + this.series.chart.series[2].color + '">\u25CF</span>' + this.series.chart.series[2].name + ' :<b>' + s3 + '</b>';
            }
          }

          return formatResult;
        }
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal'
      },

      series: series
    });
  },

  removeIndAssessment: function() {
    if (!hasIndAssessment) {
      $('#colContainer').find('#resultIndAsses').remove();
      $('#delContainer').find('#deliveryIndAsses').remove();
    }
  },

  /**loadResult: function(id, result, assessed_index) {
    var graphId = '';
    if (id == 'resultBody') {
      graphId = 'container';
    } else if (id == 'deliveryResult') {
      graphId = 'deliveryContainer';
    }
    var link = "<a role='button' onClick=displaySelectedChart(" + assessed_index + ',' + result.practiceId + ',' + graphId + ")  style='cursor: pointer;'>" +
      result.practiceName + '</a>';
    row = '<tr> <td> ' + link + '</td>';
    row += '<td>' + (result.currentScore != '' ? result.currentScore : '-') + '</td>';
    row += '<td>' + (result.targetScore != '' ? result.targetScore : '-') + '</td>';
    if (hasIndAssessment) {
      row += '<td>' + result.assessorTarget + '</td>';
    }

    row = row + '</tr>';
    $('#' + id).append(row);
  },**/

  storePrinciples: function(index, assessed_cmpnt, assessmt_cmpnt_name) {
    console.log('storePrinciples ');
    var obj = new Object();
    obj.index = index;
    obj.assessed_cmpnt = assessed_cmpnt;
    obj.assessmt_cmpnt_name = assessmt_cmpnt_name;
    principles.push(obj);
  },

  initShowHideWidget: function() {
    $("#colContainer").showhide();
    $("#delContainer").showhide();
    $("#actPlanContainer").showhide();
  },

  render: function() {
    var self = this;
    var teamId = self.state.teamId;
    var assessId = self.state.assessId;
    var assessResult = self.state.assessResult;
    var assessmt_data = self.processData(teamId, assessId, assessResult);
    var lastRecord = -1;
    var hasIndAssessment = false;
    var loadResultArray = [];
    var overAllArray = [];

    for (var ctr1 = 0; ctr1 < assessmt_data.length; ctr1++) {
      //index 0 - leadership
      //index 1- delivery
      var assessmt = assessmt_data[ctr1];
      // console.log('[displaySelected] assessmt._id:',assessmt._id);
      // console.log('[displaySelected] assessId:',assessId);
      if (assessmt._id !== undefined) {
        lastRecord = ctr1;
        var selfAsstDate = '';
        if (assessmt['submittedDate'] != null && assessmt['submittedDate'] != '') {
          selfAsstDate = utils.showDateMMDDYYYY(assessmt['submittedDate'].substring(0, assessmt['submittedDate'].indexOf(' ')));
        }
        var indAsstDate = '';
        if (assessmt.assessedDate != null && assessmt.assessedDate != '') {
          indAsstDate = utils.showDateMMDDYYYY(assessmt.assessedDate.substring(0, assessmt.assessedDate.indexOf(' ')));
        }
        console.log('[render] indAsstDate:',indAsstDate)
        self.setIndAssessor(assessmt.assessorUserId);
        // loadHeader(selfAsstDate, assessmt.assessmentStatus, indAsstDate, assessmt.assessorStatus); // not needed anymore

        $('#lastUpdateUser').html(assessmt.updatedBy);
        $('#lastUpdateTimestamp').html(utils.showDateUTC(assessmt.updateDate));
        $('#doc_id').html(assessmt['_id']);

        if (assessmt.assessorStatus == 'Submitted') {
          hasIndAssessment = true;
        } else {
          removeIndAssessment();
        }

        var firstIndex = lastRecord - 6;
        if (firstIndex < 0) {
          firstIndex = 0;
        } else {
          firstIndex = firstIndex + 1;
        }
        for (var x = firstIndex; x <= lastRecord; x++) {
          if (assessmt_data[x] != null) {
            assessmentData.push(assessmt_data[x]);
          }
        }

        if (assessmt.componentResults != null) {
          // console.log('[render] assessmt.componentResults:', assessmt.componentResults);
          var practicesCnt = 0;
          for (var ctr2 = 0; ctr2 < assessmt.componentResults.length; ctr2++) {
            var assessmt_cmpnt_rslts = assessmt.componentResults[ctr2];
            var id = '';
            if (ctr2 == 0) {
              id = 'resultBody';
            } else {
              id = 'deliveryResult';
            }
            self.displayOverAll(id, assessmt_cmpnt_rslts.currentScore, assessmt_cmpnt_rslts.targetScore, ctr2);
            overAllArray.push(<OverallResultItem
              key={`overall-${ctr2}-${ctr1}`}
              id={id}
              x={ctr2}
              counter={ctr1}
              currentScore={assessmt_cmpnt_rslts.currentScore}
              targetScore={assessmt_cmpnt_rslts.targetScore} 
              hasIndAssessment={hasIndAssessment}
              displaySelectedChart={self.displaySelectedChart} />);

            self.setAssessHeader(ctr2, assessmt_cmpnt_rslts.componentName);
            // console.log('assessmt_cmpnt_rslts length:', assessmt_cmpnt_rslts.assessedComponents.length);
            for (var ctr3 = 0; ctr3 < assessmt_cmpnt_rslts.assessedComponents.length; ctr3++) {
              var assessed_cmpnt = assessmt_cmpnt_rslts.assessedComponents[ctr3];
              loadResultArray.push(<ComponentResultItem
                key={`asmtresult-${ctr2}-${ctr3}`}
                hasIndAssessment={hasIndAssessment}
                displaySelectedChart={self.displaySelectedChart}
                assessed_cmpnt={assessed_cmpnt} x={ctr2} id={id} />);

                self.storePrinciples(practicesCnt, assessed_cmpnt, assessmt_cmpnt_rslts.componentName);

              practicesCnt++;
            }
          }
        }

        self.hasDevOps(assessmt.deliversSoftware);

        if (assessmt.actionPlans != null) {
          self.displayActionPlan(assessmt.actionPlans);

          if (hasAccess(teamId)) {
            if (assessmt.actionPlans.length > 0) {
              $('#saveActPlanBtn').removeAttr('disabled');
              $('#cancelActPlanBtn').removeAttr('disabled');
            }
            $('#addActEntryBtn').removeAttr('disabled');
          }
        }
        selAssessment = assessId;
        break;
      }
    }

    loadResultArray = overAllArray.concat(loadResultArray);

    return (
      <form id="progressForm" class="agile-maturity">
        <ProjectComponent resultBodyAry={loadResultArray} />
        <DeliveryComponent deliveryResultAry={loadResultArray} displayType={displayType} />
        <ActionPlanComponent />
        <IndependentAssessorSection />
        <LastUpdateSection />
        <DebugSection />
        <div class="ibm-rule ibm-alternate">
          <hr />
        </div>
      </form>
    );
  }
});

module.exports = AssessmentProgressForm;
