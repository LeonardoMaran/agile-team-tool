function teamAssessmentListHander(teamId, teamAssessments) {
  $('#gotoAssesmentList').attr('disabled', 'disabled');

  var allowAccess = hasAccess(teamId);
  //var listOption = getAssessmentDropdownList(sortAssessments(teamAssessments));
  var listOption = getAssessmentDropdownList(teamAssessments);

  var draftExist = false;
  for (var i = 0; i < listOption.length; i++) {
    if (listOption[i][1].toLowerCase().indexOf('draft') > -1) {
      draftExist = true;
      draftAssesID = listOption[i][0];
      break;
    }
  }

  $('#CreateAssesmentBtn').attr('disabled', 'disabled');
  if (allowAccess) {
    if (!draftExist) {
      $('#CreateAssesmentBtn').removeAttr('disabled');
      $('#CreateAssesmentBtn').click(function(e) {
        window.location = 'assessment?id=' + encodeURIComponent(teamId) + '&assessId=new';
      });
    }
  }

  $('#GoAssesmentBtn').click(function() {
    var teamID = encodeURIComponent(teamId);
    var assessId = encodeURIComponent($('#gotoAssesmentList option:selected').val());
    var isDraft = ($('#gotoAssesmentList option:selected').text().toLowerCase().indexOf('draft') > -1);
    if (assessId == '' || isDraft)
      window.location = 'assessment?id=' + teamID + '&assessId=' + assessId;
    else
      window.location = 'progress?id=' + teamID + '&assessId=' + assessId;
  });

  if (listOption.length > 6) {
    newOption = [];
    for (var i = 0; i <= 5; i++)
      newOption.push(listOption[i]);
    listOption = newOption;
  }

  setSelectOptions('gotoAssesmentList', listOption, null, null, null);
  IBMCore.common.widget.selectlist.init('#gotoAssesmentList');

  $('#gotoAssesmentList').removeAttr('disabled');

  plotAssessmentSeries(teamAssessments);

  // redrawCharts('assessmentSection');
}

function destroyAssessmentCharts() {
  // destroy existing charts in the main container
  $(Highcharts.charts).each(function(i, chart) {
    if (chart == null) return;

    if ($('#assessmentSection #' + $(chart.container).attr('id')).length > 0) {
      chart.destroy();
    }
  });
}

function noAssessmentRecord(){
  $('#assessmentCharts').empty();

  var p = document.createElement('p');
  p.appendChild(document.createTextNode('No assessment results to display.'));
  $('#assessmentCharts').append(p);

  var hrDiv = document.createElement('div');
  hrDiv.setAttribute('class', 'ibm-rule ibm-alternate ibm-gray-30');
  hrDiv.appendChild(document.createElement('hr'));
  $('#assessmentCharts').append(hrDiv);
}

function plotAssessmentSeries(teamAssessments) {
  destroyAssessmentCharts();

  //get the 5 latest submitted results
  var assessmentsToPlot = [];
  for (var i = 0; i < teamAssessments.length && assessmentsToPlot.length <= 5; i++) {
    if (teamAssessments[i]['assessmt_status'] != null && teamAssessments[i]['assessmt_status'].toLowerCase() == 'submitted') {
      assessmentsToPlot.push(teamAssessments[i]);
    }
  }

  chartSeries = [];
  var chartData = new Object();

  if (assessmentsToPlot.length > 0){
    $('#assessmentCharts').empty();
  }
  else {
    noAssessmentRecord();
  }

  for (i = assessmentsToPlot.length - 1; i > -1; i--) {
    var results = assessmentsToPlot[i]['assessmt_cmpnt_rslts'];

    for (var j = 0; j < results.length; j++) {
      var found = false;
      var identifier = '';
      if ((results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('ops') == -1) &&
        (results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('operations') == -1)) {
        identifier = 'prj';
      } else if ((results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('ops') > -1) ||
        (results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('leadership') > -1 && results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('operations') > -1)) {
        identifier = 'ops';
      } else if (results[j]['assessed_cmpnt_name'].toLowerCase().indexOf('delivery') > -1) {
        identifier = 'devops';
      }

      $.each(chartSeries, function(index, obj) {
        if (obj['prefixId'] == identifier) {
          found = true;
          chartData = obj;
          // assessment name to be shown as graph title
          chartData['title'] = results[j]['assessed_cmpnt_name'];

        }
      });
      if (!found) {
        // create a section in the page for the particular assessment group
        $('#assessmentCharts').append(createChartSection(identifier));
        // var hrDiv = document.createElement('div');
        // hrDiv.setAttribute('class', 'ibm-rule ibm-alternate ibm-gray-30');
        // hrDiv.appendChild(document.createElement('hr'));
        // $('#assessmentCharts').append(hrDiv);

        chartData = new Object();
        // page element id that will render the graph data
        chartData['prefixId'] = identifier;
        // assessment name to be shown as graph title
        chartData['title'] = results[j]['assessed_cmpnt_name'];
        // x-axis graph labels
        chartData['categories'] = [];
        // data series to plot
        chartData['targetScore'] = [];
        chartData['currentScore'] = [];
        // placeholder for the spider chart data containing the answers to all practices for the particular assessment
        chartData['assessmentResult'] = [];
        // holder for all chart data to be shown
        chartSeries.push(chartData);

      }

      var submitDate = showDateDDMMMYYYY(assessmentsToPlot[i]['self-assessmt_dt'].split(' ')[0]);
      chartData['categories'].push(submitDate);
      chartData['targetScore'].push(isNaN(parseFloat(results[j]['ovraltar_assessmt_score'])) ? 0 : parseFloat(results[j]['ovraltar_assessmt_score']));
      chartData['currentScore'].push(isNaN(parseFloat(results[j]['ovralcur_assessmt_score'])) ? 0 : parseFloat(results[j]['ovralcur_assessmt_score']));
      chartData['assessmentResult'].push(results[j]['assessed_cmpnt_tbl']);

    }
  }
  // alert('sections done');
  // plot the line graph of selected maturity assessments
  $.each(chartSeries, function(index, chartData) {
    $('#' + chartData['prefixId'] + '_Chart').highcharts({
      chart: {
        type: 'line', width: 380
      },

      title: {
        style: {
          'fontSize': '14px'
        },
        text: 'Overall Maturity for ' + chartData['title']
      },

      xAxis: {
        labels: {
          style: {
            'fontSize': '9px'
          }
        },
        categories: chartData['categories'],
        tickmarkPlacement: 'on'
      },

      yAxis: {
        max: 4,
        min: 0,
        title: {
          text: 'Maturity level'
        },
        labels: {
          style: {
            'fontSize': '9px'
          }
        },
        endOnTick: false,
        tickInterval: 1,
        allowDecimals: false
      },

      tooltip: {
        shared: true,
        //pointFormat : '<span style="color:{series.color}">{series.name}: <b>{point.y:,.1f}</b><br/>'
        formatter: function() {
          var tt = this.x + '<br/>';
          for (var i = 0; i < this.points.length; i++) {
            tt = tt + "<label style='color:" + this.points[i].color + ";'>" + this.points[i].series.name + '</label>: ' + "<label style='font-weight: bold;'>" + this.points[i].y + '</label><br/>';
          }
          tt = tt + "<i style='font-size: 8pt;'>Select to see practice results</i>";
          return tt;
        },
        useHTML: true,
        style: {
          'fontSize': '11px'
        }
      },

      legend: {
        align: 'center',
        verticalAlign: 'bottom',
        layout: 'horizontal'
      },

      credits: {
        enabled: false
      },

      series: [{
        name: 'Current',
        data: chartData['currentScore'],
        point: {
            // click event callback to render spider graph data of practices for the particular series point.
          events: {
            click: function() {
              plotAssessment(this.index, chartData);
            }
          }
        }
      }
        /*, {
        						name : "Target overall",
        						data : chartData["targetScore"],
        						point : {
        							// click event callback to render spider graph data of  practices for the particular series point.
        							events : {
        								click : function() {
        									console.log(this);
        									plotAssessment(this.index, chartData);
        								}
        							}
        						}
        					}*/
      ]
    });
  });

  // plot the spider graph of the last assessment in the series.
  for (i = 0; i < chartSeries.length; i++) {
    var lastResultIndex = chartSeries[i]['assessmentResult'].length - 1;
    plotAssessment(lastResultIndex, chartSeries[i]);
  }
}

function plotAssessment(index, chartData) {
  spiderData = new Object();
  spiderData['title'] = chartData['title'] + ' Practices for ' + chartData['categories'][index]; // "Assessment Practices for " + chartData["categories"][index];
  spiderData['prefixId'] = chartData['prefixId'];
  spiderData['categories'] = [];
  spiderData['targetScore'] = [];
  spiderData['currentScore'] = [];
  var practices = chartData['assessmentResult'][index];

  for (var i = 0; i < practices.length; i++) {
    spiderData['categories'].push(practices[i]['practice_name']);
    spiderData['targetScore'].push(isNaN(parseFloat(practices[i]['tar_mat_lvl_score'])) ? 0 : parseFloat(practices[i]['tar_mat_lvl_score']));
    spiderData['currentScore'].push(isNaN(parseFloat(practices[i]['cur_mat_lvl_score'])) ? 0 : parseFloat(practices[i]['cur_mat_lvl_score']));
  }

  if ($('#' + spiderData['prefixId'] + '_SpiderChart').highcharts() != null)
    $('#' + spiderData['prefixId'] + '_SpiderChart').highcharts().destroy();

  $('#' + spiderData['prefixId'] + '_SpiderChart').highcharts({
    chart: {
      polar: true,
      type: 'line', width: 380,
      events: {
        load: function() {
          var text = this.renderer.text('Select an overall score on the adjacent graph to view practice results.', 30, 295)
            .css({
              width: '450px',
              color: '#222',
              fontSize: '10px'
            }).add();
        }
      }
    },

    title: {
      style: {
        'fontSize': '13px'
      },
      text: spiderData['title']
    },

    xAxis: {
      reserveSpace: false,
      labels: {
        style: {
          'whiteSpace': 'nowrap',
          'fontSize': '10px'
        },
        formatter: function() {
          var text = this.value,
            formatted = text.length > 15 ? text.substring(0, 15) + '...' : text;

          return formatted;
        }
      },
      categories: spiderData['categories'],
      tickmarkPlacement: 'on',
      lineWidth: 0
    },

    yAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        },
        enabled: false
      },
      gridLineInterpolation: 'polygon',
      lineWidth: 0,
      max: 4,
      min: 0,
      maxPadding: 0.1,
      tickInterval: 1,
      allowDecimals: false
    },

    tooltip: {
      shared: true,
      pointFormat: '<span style="color:{series.color}">{series.name}: <b>{point.y:,.1f}</b><br/>'
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
    },

    credits: {
      enabled: false
    },

    series: [{
      name: 'Current',
      data: spiderData['currentScore'],
    }, {
      name: 'Target',
      data: spiderData['targetScore'],
    }]
  });
}

function createChartSection(prefixId) {
  var mainDiv = document.createElement('div');
  mainDiv.setAttribute('class', 'ibm-columns');
  mainDiv.setAttribute('style', 'margin-bottom: 3em;');

  var colDiv = document.createElement('div');
  colDiv.setAttribute('class', 'ibm-col-6-2');

  var div = document.createElement('div');
  div.setAttribute('id', prefixId + '_Chart');
  div.setAttribute('style', 'width: 100%; min-height: 310px;');
  colDiv.appendChild(div);
  mainDiv.appendChild(colDiv);

  colDiv = document.createElement('div');
  colDiv.setAttribute('class', 'ibm-col-6-2');
  div = document.createElement('div');
  div.setAttribute('id', prefixId + '_SpiderChart');
  div.setAttribute('style', 'width: 100%; min-height: 310px;');
  colDiv.appendChild(div);
  mainDiv.appendChild(colDiv);

  return mainDiv;
}

function assessmentParentRollup(assessmentData){
  //set div min height
  $('#assessmentTrend').attr('style','min-height: 380px;');
  $('#assessmentEval').attr('style','min-height: 380px;');
  var graphCategory = [];
  var teamNoAssessment = new Object();
  teamNoAssessment.name = 'Squads with no assessment';
  teamNoAssessment.data = [];
  teamNoAssessment.color = '#808080';

  var teamGt120Days = new Object();
  teamGt120Days.name = 'Squads > 120 days since last assessment';
  teamGt120Days.data = [];
  teamGt120Days.color = '#CCCCCC';

  var teamLt120Days = new Object();
  teamLt120Days.name = 'Squads with assessment in last 120 days';
  teamLt120Days.data = [];
  teamLt120Days.color = '#B4E051';

  for (var i = 0; i < assessmentData.length; i++) {
    var graphCat;

    var tNoData = new Object();
    var tGt120Data = new Object();
    var tLt120Data = new Object();

    graphCat = assessmentData[i].month;
    graphCategory.push(graphCat);

    tLt120Data.name = assessmentData[i].month;
    var l120days = isNaN(parseInt(assessmentData[i].less_120_days)) ? null : parseInt(assessmentData[i].less_120_days) == 0 ? null : parseInt(assessmentData[i].less_120_days);
    tLt120Data.y = l120days;
    teamLt120Days.data.push(tLt120Data);

    tGt120Data.name = assessmentData[i].month;
    var g120days = isNaN(parseInt(assessmentData[i].gt_120_days)) ? null : parseInt(assessmentData[i].gt_120_days) == 0 ? null : parseInt(assessmentData[i].gt_120_days);
    tGt120Data.y = g120days;
    teamGt120Days.data.push(tGt120Data);

    tNoData.name = assessmentData[i].month;
    var noData = isNaN(parseInt(assessmentData[i].no_submission)) ? null : parseInt(assessmentData[i].no_submission) == 0 ? null : parseInt(assessmentData[i].no_submission);
    tNoData.y = noData;
    teamNoAssessment.data.push(tNoData);
  }

  loadBarAssessmentEvaluation('assessmentEval', 'Frequency of Maturity Assessment Evaluations','column', graphCategory, teamLt120Days, teamGt120Days, teamNoAssessment, 100);
}

function loadBarAssessmentEvaluation(id, title, type, categories, seriesObj1, seriesObj2, seriesObj3, yMax) {

  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      width:390
    },
    lang: {
      noData: 'No results reported'
    },
    noData: {
      style: {
        fontWeight: 'bold',
        fontSize: '12px',
        color: '#303030'
      }
    },
    title: {
      style: {
        'fontSize': '15px'
      },
      text: title,
      x: 23
    },
    legend: {
      symbolRadius: 0,
      itemStyle: {
        fontSize: '12px'
      }
    },
    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Months'
      },
      categories: categories
    },
    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 20,
      title: {
        text: '% of squads within the team'
      }
    },
    plotOptions: {
      column: {
        stacking: 'percent'
      }
    },
    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        var serName = '';
        for (var i = 0; i < this.points.length; i++) {
          if (serName != this.points[i].series.name) {
            formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + '# of squads: <b>' + this.points[i].y + '</b>, % of teams: <b>'+ this.points[i].percentage.toFixed(1)+'</b><br/>';
          }
          serName = this.points[i].series.name;
        }
        return formatResult;
      }
    },
    series: [{
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color,
      dataLabels: {
        enabled: true,
        style:{
          textShadow: false,
          color: 'white'
        }
      }
    }, {
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color,
      dataLabels: {
        enabled: true,
        style:{
          textShadow: false,
          color: 'black'
        }
      }
    }, {
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      dataLabels: {
        enabled: true,
        style:{
          textShadow: false,
          color: 'black'
        }
      }
    }],
    credits: {
      enabled: false
    }
  });
}
