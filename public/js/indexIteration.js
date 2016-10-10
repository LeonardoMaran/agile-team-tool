function teamIterationListHander(teamId, teamIterations) {
  $('#gotoIterationList').attr('disabled', 'disabled');

  var graphCategory = [];
  var velocitySeries = new Object();
  velocitySeries.name = 'Delivered';
  velocitySeries.data = [];

  var commVelocitySeries = new Object();
  commVelocitySeries.name = 'Planned';
  commVelocitySeries.data = [];

  var throughputSeries = new Object();
  throughputSeries.name = 'Delivered';
  throughputSeries.data = [];

  var commThroughputSeries = new Object();
  commThroughputSeries.name = 'Planned';
  commThroughputSeries.data = [];

  var teamMemSeries = new Object();
  teamMemSeries.name = 'Team Members';
  teamMemSeries.data = [];
  var teamMemCountArr = [];

  var fteSeries = new Object();
  fteSeries.name = 'FTE';
  fteSeries.data = [];
  fteSeries.color = '#A52A2A';
  var fteCountArr = [];

  var targetSeries = new Object();
  targetSeries.name = 'Member goal (5 - 12)';
  targetSeries.data = [];
  targetSeries.color = '#93FF93';

  var defectsStartSeries = new Object();
  defectsStartSeries.name = 'Existing Defects';
  defectsStartSeries.data = [];

  var defectsSeries = new Object();
  defectsSeries.name = 'New Defects';
  defectsSeries.data = [];

  var deploySeries = new Object();
  deploySeries.name = 'Deployments';
  deploySeries.data = [];

  var teamSatSeries = new Object();
  teamSatSeries.name = 'Team Satisfaction';
  teamSatSeries.data = [];

  var clientSatSeries = new Object();
  clientSatSeries.name = 'Client Satisfaction';
  clientSatSeries.data = [];

  var storyFTESeries = new Object();
  storyFTESeries.name = 'Stories/FTE';
  storyFTESeries.data = [];

  var storyPointFTESeries = new Object();
  storyPointFTESeries.name = 'Story points/FTE';
  storyPointFTESeries.data = [];

  var cycleTimeBacklogSeries = new Object();
  cycleTimeBacklogSeries.name = 'Cycle time in backlog';
  cycleTimeBacklogSeries.data = [];

  var cycleTimeWIPSeries = new Object();
  cycleTimeWIPSeries.name = 'Cycle time in WIP';
  cycleTimeWIPSeries.data = [];

  var series = [];
  var iterationURL = 'iteration?id=' + encodeURIComponent(teamId) + '&iter=';

  // Get last 6 iterations
  var crntIter = '';
  var priorIter = '';
  var p6Iterations = [];
  var listOption = [];

  var iterIndx = 0;
  if (teamIterations != null) {
    teamIterations = sortIterations(teamIterations);

    $.each(teamIterations, function(index, value) {

      if (value.iterationinfo_status == 'Completed') {
        if (iterIndx < 6) {
          var option = [value._id, value.iteration_name];
          listOption.push(option);
          p6Iterations.push(value);
        }
        if (crntIter == '') {
          crntIter = value;
        } else if (priorIter == '') {
          priorIter = value;
        }
        iterIndx++;
      } else {
        var option = [value._id, value.iteration_name];
        listOption.push(option);
      }
    });
  }

  setSelectOptions('gotoIterationList', listOption, null, null, null);
  IBMCore.common.widget.selectlist.init('#gotoIterationList');

  // charts
  for (var i = p6Iterations.length - 1; i > -1; i--) {
    var graphCat;
    var vData = new Object();
    var cvData = new Object();
    var tData = new Object();
    var ctData = new Object();
    var tmData = new Object();
    var fteData = new Object();
    var defectStartData = new Object();
    var defectData = new Object();
    var deployData = new Object();
    var teamSatData = new Object();
    var clientSatData = new Object();
    var storiesFTEData = new Object();
    var storyPointFTEData = new Object();
    var cycleTimeBacklogData = new Object();
    var cycleTimeWIPData = new Object();

    if (p6Iterations[i].team_mbr_change == 'Yes') {
      graphCat = '*' + showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
      vData.color = '#FFA500';
      tData.color = '#FFA500';
    } else {
      graphCat = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    }
    graphCategory.push(graphCat);

    vData.name = p6Iterations[i].iteration_name;
    vData.y = isNaN(parseInt(p6Iterations[i].nbr_story_pts_dlvrd)) ? 0 : parseInt(p6Iterations[i].nbr_story_pts_dlvrd);
    vData.iterURL = iterationURL + p6Iterations[i]._id;
    vData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    vData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    velocitySeries.data.push(vData);

    cvData.name = p6Iterations[i].iteration_name;
    cvData.y = isNaN(parseInt(p6Iterations[i].nbr_committed_story_pts)) ? 0 : parseInt(p6Iterations[i].nbr_committed_story_pts);
    cvData.iterURL = iterationURL + p6Iterations[i]._id;
    cvData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    cvData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    commVelocitySeries.data.push(cvData);

    tData.name = p6Iterations[i].iteration_name;
    tData.y = isNaN(parseInt(p6Iterations[i].nbr_stories_dlvrd)) ? 0 : parseInt(p6Iterations[i].nbr_stories_dlvrd);
    tData.iterURL = iterationURL + p6Iterations[i]._id;
    tData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    tData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    throughputSeries.data.push(tData);

    ctData.name = p6Iterations[i].iteration_name;
    ctData.y = isNaN(parseInt(p6Iterations[i].nbr_committed_stories)) ? 0 : parseInt(p6Iterations[i].nbr_committed_stories);
    ctData.iterURL = iterationURL + p6Iterations[i]._id;
    ctData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    ctData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    commThroughputSeries.data.push(ctData);

    tmData.name = p6Iterations[i].iteration_name;
    tmData.y = isNaN(parseInt(p6Iterations[i].team_mbr_cnt)) ? 0 : parseInt(p6Iterations[i].team_mbr_cnt);
    tmData.iterURL = iterationURL + p6Iterations[i]._id;
    tmData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    tmData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    teamMemSeries.data.push(tmData);
    teamMemCountArr.push(tmData.y);

    fteData.name = p6Iterations[i].iteration_name;
    fteData.y = isNaN(parseInt(p6Iterations[i].fte_cnt)) ? 0 : parseFloat(p6Iterations[i].fte_cnt);
    fteData.iterURL = iterationURL + p6Iterations[i]._id;
    fteData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    fteData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    fteSeries.data.push(fteData);
    fteCountArr.push(fteData.y);

    targetSeries.data.push(-1);

    defectStartData.name = p6Iterations[i].iteration_name;
    defectStartData.y = isNaN(parseInt(p6Iterations[i].nbr_defects_start_bal)) ? 0 : parseInt(p6Iterations[i].nbr_defects_start_bal);
    defectStartData.iterURL = iterationURL + p6Iterations[i]._id;
    defectStartData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    defectStartData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    defectsStartSeries.data.push(defectStartData);

    defectData.name = p6Iterations[i].iteration_name;
    defectData.y = isNaN(parseInt(p6Iterations[i].nbr_defects)) ? 0 : parseInt(p6Iterations[i].nbr_defects);
    defectData.iterURL = iterationURL + p6Iterations[i]._id;
    defectData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    defectData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    defectsSeries.data.push(defectData);

    deployData.name = p6Iterations[i].iteration_name;
    deployData.y = isNaN(parseInt(p6Iterations[i].nbr_dplymnts)) ? 0 : parseInt(p6Iterations[i].nbr_dplymnts);
    deployData.iterURL = iterationURL + p6Iterations[i]._id;
    deployData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    deployData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    deploySeries.data.push(deployData);

    teamSatData.name = p6Iterations[i].iteration_name;
    teamSatData.y = isNaN(parseInt(p6Iterations[i].team_sat)) ? 0 : parseFloat(p6Iterations[i].team_sat);
    teamSatData.iterURL = iterationURL + p6Iterations[i]._id;
    teamSatData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    teamSatData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    teamSatSeries.data.push(teamSatData);

    clientSatData.name = p6Iterations[i].iteration_name;
    clientSatData.y = isNaN(parseInt(p6Iterations[i].client_sat)) ? 0 : parseFloat(p6Iterations[i].client_sat);
    clientSatData.iterURL = iterationURL + p6Iterations[i]._id;
    clientSatData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    clientSatData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    clientSatSeries.data.push(clientSatData);

    var StoriesDel = isNaN(parseInt(p6Iterations[i].nbr_stories_dlvrd)) ? 0 : parseInt(p6Iterations[i].nbr_stories_dlvrd);
    var StoryPointDel = isNaN(parseInt(p6Iterations[i].nbr_story_pts_dlvrd)) ? 0 : parseInt(p6Iterations[i].nbr_story_pts_dlvrd);
    var fte = isNaN(parseInt(p6Iterations[i].fte_cnt)) ? 0 : parseFloat(p6Iterations[i].fte_cnt);
    var storiesFTE = isNaN(parseInt((StoriesDel / fte).toFixed(1))) ? 0 : parseFloat((StoriesDel / fte).toFixed(1));
    var strPointsFTE = isNaN(parseInt((StoryPointDel / fte).toFixed(1))) ? 0 : parseFloat((StoryPointDel / fte).toFixed(1));

    storiesFTEData.name = p6Iterations[i].iteration_name;
    storiesFTEData.y = storiesFTE;
    storiesFTEData.iterURL = iterationURL + p6Iterations[i]._id;
    storiesFTEData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    storiesFTEData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    storyFTESeries.data.push(storiesFTEData);

    storyPointFTEData.name = p6Iterations[i].iteration_name;
    storyPointFTEData.y = strPointsFTE;
    storyPointFTEData.iterURL = iterationURL + p6Iterations[i]._id;
    storyPointFTEData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    storyPointFTEData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    storyPointFTESeries.data.push(storyPointFTEData);

    cycleTimeBacklogData.name = p6Iterations[i].iteration_name;
    cycleTimeBacklogData.y = isNaN(parseInt(p6Iterations[i].nbr_cycletime_in_backlog)) ? 0 : parseFloat(p6Iterations[i].nbr_cycletime_in_backlog);
    cycleTimeBacklogData.iterURL = iterationURL + p6Iterations[i]._id;
    cycleTimeBacklogData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    cycleTimeBacklogData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    cycleTimeBacklogSeries.data.push(cycleTimeBacklogData);

    cycleTimeWIPData.name = p6Iterations[i].iteration_name;
    cycleTimeWIPData.y = isNaN(parseInt(p6Iterations[i].nbr_cycletime_WIP)) ? 0 : parseFloat(p6Iterations[i].nbr_cycletime_WIP);
    cycleTimeWIPData.iterURL = iterationURL + p6Iterations[i]._id;
    cycleTimeWIPData.startDate = showDateDDMMMYYYY(p6Iterations[i].iteration_start_dt);
    cycleTimeWIPData.endDate = showDateDDMMMYYYY(p6Iterations[i].iteration_end_dt);
    cycleTimeWIPSeries.data.push(cycleTimeWIPData);

  }

  var teamMemMax = getMax(teamMemCountArr);
  var fteMax = getMax(fteCountArr);
  var yMax = Math.max(teamMemMax, fteMax);
  if (yMax <= 12) {
    yMax = 12;
  }

  if (!(teamMemSeries.data.length > 0 || fteSeries.data.length > 0 || targetSeries.data.length > 0)) {
    yMax = null;
  }

  var sMax = 4;
  if (!(teamSatSeries.data.length > 0 || clientSatSeries.data.length > 0)) {
    sMax = null;
  }

  destroyIterationCharts();

  loadScoreChart('velocityChart', 'Velocity', 'line', graphCategory, 'Story points', commVelocitySeries,  velocitySeries, 'Points', 'Iteration Dates', '* Indicates Team Change', true, true);
  loadScoreChart('throughputChart', 'Throughput', 'line', graphCategory, 'Stories/tickets/cards', commThroughputSeries, throughputSeries, 'Points', 'Iteration Dates', '* Indicates Team Change', true, true);
  loadPizzaChart('pizzaChart', '2 Pizza Rule (Team Members)', 'line', graphCategory, 'Count', yMax, teamMemSeries, fteSeries, targetSeries, 'Points');
  // loadChartMulSeries('defectsChart', 'Deployments/Defects', 'line', graphCategory, 'Count', 'Iteration Dates', deploySeries, defectsSeries, 'Points', true);
  loadDefectDeployChart('defectsChart', graphCategory, defectsSeries, defectsStartSeries, deploySeries);
  loadSatisfactionChart('statisfactionChart', 'Client and Team Satisfaction', 'line', graphCategory, 'Rating', teamSatSeries, clientSatSeries, 'Points', sMax);
  loadChartMulSeries('unitCostChart', 'Unit cost per FTE', 'line', graphCategory, 'Count', 'Iteration Dates', storyFTESeries, storyPointFTESeries, 'Points', true);
  loadWipBacklogChart('wipBacklogChart', 'Cycle time in backlog and cycle time in WIP (in days)', 'line', graphCategory, 'Average days per story', 'Iteration Dates', cycleTimeBacklogSeries, cycleTimeWIPSeries, 'Points', true);

  $('#GoIterationBtn').click(function() {
    var iterID = encodeURIComponent($('#gotoIterationList option:selected').val());
    var teamID = encodeURIComponent(teamId);
    window.location = 'iteration?id=' + teamID + '&iter=' + iterID;
  });
  $('#gotoIterationList').removeAttr('disabled');

  $('#CreateIterationBtn').attr('disabled', 'disabled');
  if (hasAccess(teamId)) {
    $('#CreateIterationBtn').removeAttr('disabled');
    $('#CreateIterationBtn').click(function(e) {
      window.location = 'iteration?id=' + encodeURIComponent(teamId) + '&iter=new';
    });
  }

  $('#spinnerContainer').hide();
  $('#mainContent').show();
  redrawCharts('iterationSection');
}

function destroyIterationCharts() {
  // var chartIds = ['velocityChart', 'throughputChart', 'pizzaChart', 'defectsChart', 'statisfactionChart', 'unitCostChart', 'pvelocityChart', 'pthroughputChart', 'pPizzaChart', 'pdefectsChart', 'piePizzaChart'];
  // $.each(chartIds, function(index, id) {
  //   if ($('#' + id).highcharts() != null)
  //     $('#' + id).highcharts().destroy();
  // });
  $(Highcharts.charts).each(function(i, chart) {
    if (chart == null) return;

    if ($('#iterationSection #' + $(chart.container).attr('id')).length > 0) {
      chart.destroy();
    }
  });
}

function loadScoreChart(id, title, type, categories, yAxisLabel, seriesObj1, seriesObj2, unit, text, subtitle, showLegend, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      title: {
        text: text,
        align: 'middle',
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on',
      labels: {
        style: {
          'fontSize': '9px'
        },
        formatter: function() {
          if (typeof this.value === 'string' && this.value.indexOf('*') >= 0) {
            return '<span style="fill: orange;">' + this.value + '</span>';
          } else {
            return this.value;
          }
        }
      }
    },

    yAxis: {
      min: 0,
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
        }
        if (this.points[0].point.startDate != undefined) {
          formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: subtitle,
      verticalAlign: 'bottom',
      align: 'center',
      y: 8,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      showInLegend: showLegend,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: showLegend,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadPizzaChart(id, title, type, categories, yAxisLabel, yMax, seriesObj1, seriesObj2, seriesObj3, unit) {
  var plotBandOptions = null;

  if (seriesObj1.data.length > 0 || seriesObj2.data.length > 0 || seriesObj3.data.length > 0) {
    plotBandOptions = [{
      color: '#93FF93',
      from: 5,
      to: 12,
      id: 'plotband-2',
      name: 'band'
    }];
  }

  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Iteration Dates',
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 4,
      showEmpty: false,
      title: {
        text: yAxisLabel
      },
      plotBands: plotBandOptions

    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
        }
        formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10,
      itemDistance: 5
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color,
      marker: {
        symbol: 'square'
      }
    }]
  });
}

function loadStackedPizzaChart(id, title, type, categories, yAxisLabel, seriesObj1, seriesObj2, seriesObj3) {


  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Team size by month for completed iterations'
      },
      categories: categories
    },

    yAxis: {
      min: 0,
      title: {
        text: yAxisLabel
      },
      reversedStacks: false
    },

    plotOptions: {
      column: {
        stacking: 'normal',
        dataLabels: {
          enabled: true,
          color: (Highcharts.theme && Highcharts.theme.dataLabelsColor) || 'black',
          style: {
            textShadow: '0 0 0px white',
            fontSize: '10px'
          }
        }
      }
    },

    tooltip: {
      headerFormat: '',
      pointFormat: 'Total iterations : {point.totalCompleted}'
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
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color

    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color

    }, {
      showInLegend: true,
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color
    }]
  });
}

function loadBarPizzaChart(id, title, type, categories, seriesObj1, seriesObj2, yMax) {

  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    legend: {
      itemStyle: {
        color: 'orange'
      }
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Iteration results by month',
        x: -20
      },
      categories: categories
    },

    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 25,
      title: {
        text: 'Iteration % with 5-12 members'
      }
    },

    plotOptions: {
      series: {
        stacking: 'normal',
        allowPointSelect: true
      }
    },

    tooltip: {
      headerFormat: '',
      pointFormat: '<b>% iterations: {point.y}</b>' +
        //'<br/><b>Squad Teams: {point.squadTeams}</b>' +
        '<br/><b># iterations: {point.totalCompleted}</b>'
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: false,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color

    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      color: seriesObj2.color

    }]
  });
}

function loadPiePizzaChart(id, title, type, seriesObj, subtitle) {

  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    plotOptions: {
      series: {
        dataLabels: {
          enabled: true,
          formatter: function() {
            return this.point.y;
          },
          distance: -15
        }
      }
    },

    tooltip: {
      headerFormat: '',
      pointFormat: '<b>Team members:{point.tc}</b><br/><b>FTE:{point.fte}</b>'
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal'
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: subtitle,
      verticalAlign: 'bottom',
      align: 'center',
      y: -135,
      x: 30,
      style: {
        fontSize: '10px',
        //color : '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      size: '120%',
      innerSize: '65%',
      showInLegend: true,
      colorByPoint: true,
      name: 'team/fte',
      data: seriesObj
    }]
  });
}

function loadChartMulSeries(id, title, type, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, unit, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: xAxisLabel,
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
        }
        if (this.points[0].point.startDate != undefined) {
          formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadDefectDeployChart(id, categories, columnSeries1, columnSeries2, lineSeries) {
  new Highcharts.Chart({
    chart: {
      type: 'column',
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: 'Deployments and Defects'
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Iteration Dates',
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: 'Count'
      }
    },

    plotOptions: {
      column: {
        stacking: 'normal',
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
        }
        if (this.points[0].point.startDate != undefined) {
          formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10,
      itemDistance: 5,
      symbolRadius: 0
      // itemStyle: {"fontWeight": "normal" }
    },

    credits: {
      enabled: false
    },

    // Stripe patterns
    // defs: {
    //   patterns: [{
    //     id: 'start-defects',
    //     path: {
    //       d: 'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
    //       stroke: '#7ab4ee',
    //       strokeWidth: 5
    //     }
    //   }, {
    //     id: 'new-defects',
    //     path: {
    //       d: 'M 3 0 L 3 10 M 8 0 L 8 10',
    //       stroke: '#434348',
    //       strokeWidth: 3
    //     }
    //   }]
    // },

    series: [{
      showInLegend: true,
      name: columnSeries1.name,
      data: columnSeries1.data,
      // borderColor: '#7ab4ee',
      // color: 'url(#start-defects)',
      color: '#808080',
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: columnSeries2.name,
      data: columnSeries2.data,
      // borderColor: '#434348',
      // color: 'url(#new-defects)',
      color: '#7ab4ee',
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      type: 'line',
      showInLegend: true,
      name: lineSeries.name,
      data: lineSeries.data,
      color: '#434348',
      marker: {
        symbol: 'triangle'
      },
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadWipBacklogChart(id, title, type, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, unit, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: xAxisLabel,
        x: -20
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
        }
        if (this.points[0].point.startDate != undefined) {
          formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            if (pointClickable)
              window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function loadChartPartialSeries(id, title, type, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, unit, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: xAxisLabel
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      formatter: function() {
        if (this.point.totalSquad != undefined) {
          return yAxisLabel + ' : ' + this.point.y + '<br>' + 'Squad Teams : ' + this.point.totalSquad + '<br>' + 'Iterations: ' + this.point.totalCompleted;
        } else {
          return '<b>' + this.key + '</b><br>' + yAxisLabel + ' : ' + this.point.y + '<br>' + this.point.startDate + ' - ' + this.point.endDate;
        }
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

    subtitle: {
      text: '---Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 15,
      x: 30,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      showInLegend: false,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      dashStyle: seriesObj1.dashStyle
    }, {
      showInLegend: false,
      name: seriesObj2.name,
      data: seriesObj2.data
    }
    ]
  });
}

function loadDefectsChartParent(id, categories, columnSeries1, partialColumnSeries1, columnSeries2, partialColumnSeries2 , lineSeries, partialLineSeries) {
  new Highcharts.Chart({
    chart: {
      type: 'column',
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: 'Deployment and Defects'
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Iteration results by month'
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: 'Count'
      }
    },

    plotOptions: {
      column: {
        stacking: 'normal',
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        var serName = '';
        for (var i = 0; i < this.points.length; i++) {
          if (serName != this.points[i].series.name) {
            formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
          }
          serName = this.points[i].series.name;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10,
      itemDistance: 8,
      symbolRadius: 0
      // itemStyle: {"fontWeight": "normal" }
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: '---Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 15,
      x: 30,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    defs: {
      patterns: [{
      //   id: 'start-defects',
      //   path: {
      //     d: 'M 0 10 L 10 0 M -1 1 L 1 -1 M 9 11 L 11 9',
      //     stroke: '#data',
      //     strokeWidth: 5
      //   }
      // }, {
        id: 'partial',
        path: {
          d: 'M 0 3 L 5 3 L 5 0 M 5 10 L 5 7 L 10 7',
          stroke: 'orange',
          strokeWidth: 4
        }
      }]
    },

    series: [{
    //   showInLegend: false,
    //   name: partialColumnSeries1.name,
    //   data: partialColumnSeries1.data,
    //   color: '808080',
    //   zoneAxis: 'x',
    //   zones: [{ value: 2}, { color: 'orange' }]
    // }, {
      showInLegend: true,
      name: columnSeries1.name,
      data: columnSeries1.data,
      color: '#808080',
      zoneAxis: 'x',
      zones: [{value: 5}, {dashStyle: 'dash', color: 'orange'}]
    }, {
    //   showInLegend: false,
    //   name: partialColumnSeries2.name,
    //   data: partialColumnSeries2.data,
    //   color: '7ab4ee',
    //   zoneAxis: 'x',
    //   zones: [{ value: 2}, { color: 'orange' }]
    // }, {
      showInLegend: true,
      name: columnSeries2.name,
      data: columnSeries2.data,
      color: '#7ab4ee',
      zoneAxis: 'x',
      zones: [{value: 5}, {dashStyle: 'dash', color: 'orange'}]
    }, {
      type: 'line',
      showInLegend: false,
      name: partialLineSeries.name,
      data: partialLineSeries.data,
      color: 'orange',
      dashStyle: 'dash',
      marker: {
        symbol: 'triangle'
      }
    }, {
      type: 'line',
      showInLegend: true,
      name: lineSeries.name,
      data: lineSeries.data,
      color: '#434348',
      marker: {
        symbol: 'triangle'
      }
    }]
  });
}


function loadWipBackoutChartParent(id, title, type, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, seriesObj3, seriesObj4, unit, pointClickable) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: xAxisLabel
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        var serName = '';
        for (var i = 0; i < this.points.length; i++) {
          if (serName != this.points[i].series.name) {
            formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
          }
          serName = this.points[i].series.name;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: '---Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 15,
      x: 30,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      showInLegend: false,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      dashStyle: seriesObj1.dashStyle,
      marker: {
        symbol: 'circle'
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      marker: {
        symbol: 'circle'
      }
    }, {
      showInLegend: false,
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color,
      dashStyle: seriesObj3.dashStyle,
      marker: {
        symbol: 'triangle'
      }
    }, {
      showInLegend: true,
      name: seriesObj4.name,
      data: seriesObj4.data,
      marker: {
        symbol: 'triangle'
      }
    }

    ]
  });
}

function loadSatisfactionChartParent(id, title, type, categories, yAxisLabel, xAxisLabel, seriesObj1, seriesObj2, seriesObj3, seriesObj4, unit, pointClickable, yMax) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: xAxisLabel
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 2,
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        var serName = '';
        for (var i = 0; i < this.points.length; i++) {
          if (serName != this.points[i].series.name) {
            formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
          }
          serName = this.points[i].series.name;
        }
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    subtitle: {
      text: '---Partial month',
      verticalAlign: 'bottom',
      align: 'center',
      y: 15,
      x: 30,
      style: {
        fontSize: '12px',
        color: '#FFA500',
        fontWeight: 'bold'
      }
    },

    series: [{
      showInLegend: false,
      name: seriesObj1.name,
      data: seriesObj1.data,
      color: seriesObj1.color,
      dashStyle: seriesObj1.dashStyle,
      marker: {
        symbol: 'circle'
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      marker: {
        symbol: 'circle'
      }
    }, {
      showInLegend: false,
      name: seriesObj3.name,
      data: seriesObj3.data,
      color: seriesObj3.color,
      dashStyle: seriesObj3.dashStyle,
      marker: {
        symbol: 'triangle'
      }
    }, {
      showInLegend: true,
      name: seriesObj4.name,
      data: seriesObj4.data,
      marker: {
        symbol: 'triangle'
      }
    }
    ]
  });
}


function loadSatisfactionChart(id, title, type, categories, yAxisLabel, seriesObj1, seriesObj2, unit, yMax) {
  new Highcharts.Chart({
    chart: {
      type: type,
      renderTo: id,
      marginLeft: 60,
      marginRight: 0, width: 380
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
      text: title
    },

    xAxis: {
      labels: {
        style: {
          'fontSize': '9px'
        }
      },
      title: {
        text: 'Iteration Dates'
      },
      categories: categories,
      tickmarkPlacement: 'on'
    },

    yAxis: {
      min: 0,
      max: yMax,
      tickInterval: 2,
      showEmpty: false,
      title: {
        text: yAxisLabel
      }
    },

    plotOptions: {
      column: {
        pointPlacement: 'on'
      }
    },

    tooltip: {
      shared: true,
      formatter: function() {
        var formatResult = '<b>' + this.points[0].key + '</b><br>';
        for (var i = 0; i < this.points.length; i++) {
          formatResult = formatResult + '<span style="color:' + this.points[i].series.color + '">\u25CF</span>' + this.points[i].series.name + ' :<b>' + this.points[i].y + '</b><br/>';
        }
        formatResult = formatResult + '<br>' + this.points[0].point.startDate + ' - ' + this.points[0].point.endDate;
        return formatResult;
      }
    },

    legend: {
      align: 'center',
      verticalAlign: 'bottom',
      layout: 'horizontal',
      itemMarginTop: -10
    },

    credits: {
      enabled: false
    },

    series: [{
      showInLegend: true,
      name: seriesObj1.name,
      data: seriesObj1.data,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }, {
      showInLegend: true,
      name: seriesObj2.name,
      data: seriesObj2.data,
      point: {
        events: {
          click: function(e) {
            window.location = e.point.iterURL;
          }
        }
      }
    }]
  });
}

function retrieveIterations(teamIds, startDate, endDate, _callback, args) {
  var start = getMonthlyRange(startDate);
  var end = getMonthlyRange(endDate);

  var iterQuery = new Object();
  iterQuery.selector = new Object();
  iterQuery.sort = [];

  var selector = new Object();
  selector.type = 'iterationinfo';

  var condition1 = new Object();
  condition1.$in = teamIds;
  selector.team_id = condition1;

  var condition2 = new Object();
  condition2.$regex = start + ' || ' + end;
  selector.iteration_end_dt = condition2;

  var condition3 = new Object();
  condition3.$eq = 'Completed';
  selector.iterationinfo_status = condition3;


  iterQuery.selector = selector;
  var sort = new Object();
  sort.iteration_end_dt = 'asc';

  iterQuery.sort.push(sort);
  iterations = selectorQuery(iterQuery, _callback, args);
}

function currentTeamStats() {
  var squadTeams = [];
  var teamsLt5 = 0;
  var teams5to12 = 0;
  var teamsGt12 = 0;
  var tcLt5 = 0;
  var tc5to12 = 0;
  var tcGt12 = 0;
  var fteLt5 = 0;
  var fte5to12 = 0;
  var fteGt12 = 0;
  var entry = new Object();

  for (var i in squadList) {
    var team = allTeamsLookup[squadList[i]];
    if (!_.isEmpty(team))
      squadTeams.push(team);
  }

  for (var x = 0; x < squadTeams.length; x++) {
    var teamCnt = squadTeams[x]['total_members'] != null ? squadTeams[x]['total_members'] : teamMemCount(squadTeams[x]['members']);
    var teamFTE = squadTeams[x]['total_allocation'] != null ? squadTeams[x]['total_allocation'] : teamMemFTE(squadTeams[x]['members']);
    if (teamCnt != undefined && teamCnt != '') {
      teamCnt = parseInt(teamCnt);
      if (teamCnt < 5) {
        teamsLt5 = teamsLt5 + 1;
        fteLt5 = fteLt5 + teamFTE;
        tcLt5 = tcLt5 + teamCnt;
      } else if (teamCnt > 12) {
        teamsGt12 = teamsGt12 + 1;
        fteGt12 = fteGt12 + teamFTE;
        tcGt12 = tcGt12 + teamCnt;

      } else {
        teams5to12 = teams5to12 + 1;
        fte5to12 = fte5to12 + teamFTE;
        tc5to12 = tc5to12 + teamCnt;
      }
    }
  }
  entry.teamsLt5 = teamsLt5;
  entry.tcLt5 = tcLt5;
  entry.fteLt5 = fteLt5;

  entry.teams5to12 = teams5to12;
  entry.tc5to12 = tc5to12;
  entry.fte5to12 = fte5to12;

  entry.teamsGt12 = teamsGt12;
  entry.tcGt12 = tcGt12;
  entry.fteGt12 = fteGt12;

  return entry;
}

function iterationScoreCard(teamId, teamName, teamIterations, nonsquadScore) {
  var graphCategory = [];

  var velocitySeries = new Object();
  velocitySeries.name = teamName;
  velocitySeries.data = [];

  var velocityParSer = new Object();
  velocityParSer.name = 'Partial month';
  velocityParSer.data = [];
  velocityParSer.dashStyle = 'dash';
  velocityParSer.color = 'orange';

  var throughputSeries = new Object();
  throughputSeries.name = teamName;
  throughputSeries.data = [];

  var throughputParSer = new Object();
  throughputParSer.name = 'Partial month';
  throughputParSer.data = [];
  throughputParSer.dashStyle = 'dash';
  throughputParSer.color = 'orange';

  var teamLt5Ser = new Object();
  teamLt5Ser.name = 'Teams <5 mbrs';
  teamLt5Ser.data = [];
  teamLt5Ser.color = '#D3D3D3';

  var team5to12Ser = new Object();
  team5to12Ser.name = 'Teams 5-12 mbrs';
  team5to12Ser.data = [];
  team5to12Ser.color = '#93FF93';

  var teamGt12Ser = new Object();
  teamGt12Ser.name = 'Teams >12 mbrs';
  teamGt12Ser.data = [];
  teamGt12Ser.color = '#808080';

  var defectsStartSeries = new Object();
  defectsStartSeries.name = 'Existing Defects';
  defectsStartSeries.data = [];

  var defectsParStartSer = new Object();
  defectsParStartSer.name = 'Existing Defects';
  defectsParStartSer.data = [];

  var defectsSeries = new Object();
  defectsSeries.name = 'New Defects';
  defectsSeries.data = [];

  var defectsParSer = new Object();
  defectsParSer.name = 'New Defects';
  defectsParSer.data = [];
  // defectsParSer.dashStyle = 'dash';
  // defectsParSer.color = 'orange';

  var deploySeries = new Object();
  deploySeries.name = 'Deployments';
  deploySeries.data = [];

  var deployParSer = new Object();
  deployParSer.name = 'Deployments';
  deployParSer.data = [];
  deployParSer.dashStyle = 'dash';
  deployParSer.color = 'orange';

  //------
  var clientStatSeries = new Object();
  clientStatSeries.name = 'Client Satisfaction';
  clientStatSeries.data = [];

  var clientStatParSer = new Object();
  clientStatParSer.name = 'Client Satisfaction';
  clientStatParSer.data = [];
  clientStatParSer.dashStyle = 'dash';
  clientStatParSer.color = 'orange';

  var teamStatSeries = new Object();
  teamStatSeries.name = 'Team Satisfaction';
  teamStatSeries.data = [];

  var teamStatParSer = new Object();
  teamStatParSer.name = 'Team Satisfaction';
  teamStatParSer.data = [];
  teamStatParSer.dashStyle = 'dash';
  teamStatParSer.color = 'orange';

  var cycleTimeBacklogSeries = new Object();
  cycleTimeBacklogSeries.name = 'Cycle time in backlog';
  cycleTimeBacklogSeries.data = [];

  var cycleTimeBacklogParSer = new Object();
  cycleTimeBacklogParSer.name = 'Cycle time in backlog';
  cycleTimeBacklogParSer.data = [];
  cycleTimeBacklogParSer.dashStyle = 'dash';
  cycleTimeBacklogParSer.color = 'orange';

  var cycleTimeWIPSeries = new Object();
  cycleTimeWIPSeries.name = 'Cycle time in WIP';
  cycleTimeWIPSeries.data = [];

  var cycleTimeWIPParSer = new Object();
  cycleTimeWIPParSer.name = 'Cycle time in WIP';
  cycleTimeWIPParSer.data = [];
  cycleTimeWIPParSer.dashStyle = 'dash';
  cycleTimeWIPParSer.color = 'orange';

  var partialSeries = new Object();
  partialSeries.name = 'Partial month';
  partialSeries.data = [];
  partialSeries.color = 'orange';

  var monthList = teamIterations;
  monthList = sortMMMYYYY(monthList);
  var curTeamstat = nonsquadScore; //currentTeamStats();

  for (var i = monthList.length - 1; i > -1; i--) {
    var graphCat;

    var tLt5Data = new Object();
    var t5to12Data = new Object();
    var tGt12Data = new Object();

    graphCat = monthList[i].month;
    graphCategory.push(graphCat);

    if (monthList[i].partialMonth == true) {
      var vpData = new Object();
      vpData.name = monthList[i].month;
      vpData.x = graphCategory.indexOf(monthList[i].month);
      vpData.y = isNaN(parseInt(monthList[i].totalPoints)) ? 0 : parseInt(monthList[i].totalPoints);
      vpData.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
      vpData.totalSquad = isNaN(parseInt(monthList[i].totalSquad)) ? 0 : parseInt(monthList[i].totalSquad);
      velocityParSer.data.push(vpData);

      var vpData = new Object();
      vpData.name = monthList[i + 1].month;
      vpData.x = graphCategory.indexOf(monthList[i + 1].month);
      vpData.y = isNaN(parseInt(monthList[i + 1].totalPoints)) ? 0 : parseInt(monthList[i + 1].totalPoints);
      vpData.totalCompleted = isNaN(parseInt(monthList[i + 1].totalCompleted)) ? 0 : parseInt(monthList[i + 1].totalCompleted);
      vpData.totalSquad = isNaN(parseInt(monthList[i + 1].totalSquad)) ? 0 : parseInt(monthList[i + 1].totalSquad);
      velocityParSer.data.push(vpData);

      var tpData = new Object();
      tpData.name = monthList[i].month;
      tpData.x = graphCategory.indexOf(monthList[i].month);
      tpData.y = isNaN(parseInt(monthList[i].totalStories)) ? 0 : parseInt(monthList[i].totalStories);
      tpData.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
      tpData.totalSquad = isNaN(parseInt(monthList[i].totalSquad)) ? 0 : parseInt(monthList[i].totalSquad);
      throughputParSer.data.push(tpData);

      var tpData = new Object();
      tpData.name = monthList[i + 1].month;
      tpData.x = graphCategory.indexOf(monthList[i + 1].month);
      tpData.y = isNaN(parseInt(monthList[i + 1].totalStories)) ? 0 : parseInt(monthList[i + 1].totalStories);
      tpData.totalCompleted = isNaN(parseInt(monthList[i + 1].totalCompleted)) ? 0 : parseInt(monthList[i + 1].totalCompleted);
      tpData.totalSquad = isNaN(parseInt(monthList[i + 1].totalSquad)) ? 0 : parseInt(monthList[i + 1].totalSquad);
      throughputParSer.data.push(tpData);

      var defPData = new Object();
      defPData.name = monthList[i].month;
      defPData.x = graphCategory.indexOf(monthList[i].month);
      defPData.y = isNaN(parseInt(monthList[i].totalDefectsStartBal)) ? 0 : parseInt(monthList[i].totalDefectsStartBal);
      defectsParStartSer.data.push(defPData);
      defectsStartSeries.data.push(defPData);

      var defPData = new Object();
      defPData.name = monthList[i + 1].month;
      defPData.x = graphCategory.indexOf(monthList[i + 1].month);
      defPData.y = isNaN(parseInt(monthList[i + 1].totalDefectsStartBal)) ? 0 : parseInt(monthList[i + 1].totalDefectsStartBal);
      defectsParStartSer.data.push(defPData);

      var defPData = new Object();
      defPData.name = monthList[i].month;
      defPData.x = graphCategory.indexOf(monthList[i].month);
      defPData.y = isNaN(parseInt(monthList[i].totalDefects)) ? 0 : parseInt(monthList[i].totalDefects);
      defectsParSer.data.push(defPData);
      defectsSeries.data.push(defPData);

      var defPData = new Object();
      defPData.name = monthList[i + 1].month;
      defPData.x = graphCategory.indexOf(monthList[i + 1].month);
      defPData.y = isNaN(parseInt(monthList[i + 1].totalDefects)) ? 0 : parseInt(monthList[i + 1].totalDefects);
      defectsParSer.data.push(defPData);

      var depPData = new Object();
      depPData.name = monthList[i].month;
      depPData.x = graphCategory.indexOf(monthList[i].month);
      depPData.y = isNaN(parseInt(monthList[i].totalDplymts)) ? 0 : parseInt(monthList[i].totalDplymts);
      deployParSer.data.push(depPData);

      var depPData = new Object();
      depPData.name = monthList[i + 1].month;
      depPData.x = graphCategory.indexOf(monthList[i + 1].month);
      depPData.y = isNaN(parseInt(monthList[i + 1].totalDplymts)) ? 0 : parseInt(monthList[i + 1].totalDplymts);
      deployParSer.data.push(depPData);

      var tsPData = new Object();
      tsPData.name = monthList[i].month;
      tsPData.x = graphCategory.indexOf(monthList[i].month);
      tsPData.y = isNaN(parseInt(monthList[i].totTeamStat)) ? null : parseFloat(monthList[i].totTeamStat.toFixed(1));
      teamStatParSer.data.push(tsPData);

      var tsPData = new Object();
      tsPData.name = monthList[i + 1].month;
      tsPData.x = graphCategory.indexOf(monthList[i + 1].month);
      tsPData.y = isNaN(parseInt(monthList[i + 1].totTeamStat)) ? null : parseFloat(monthList[i + 1].totTeamStat.toFixed(1));
      teamStatParSer.data.push(tsPData);

      var csPData = new Object();
      csPData.name = monthList[i].month;
      csPData.x = graphCategory.indexOf(monthList[i].month);
      csPData.y = isNaN(parseInt(monthList[i].totClientStat)) ? null : parseFloat(monthList[i].totClientStat.toFixed(1));
      clientStatParSer.data.push(csPData);

      var csPData = new Object();
      csPData.name = monthList[i + 1].month;
      csPData.x = graphCategory.indexOf(monthList[i + 1].month);
      csPData.y = isNaN(parseInt(monthList[i + 1].totClientStat)) ? null : parseFloat(monthList[i + 1].totClientStat.toFixed(1));
      clientStatParSer.data.push(csPData);

      var ctfPData = new Object();
      ctfPData.name = monthList[i].month;
      ctfPData.x = graphCategory.indexOf(monthList[i].month);
      ctfPData.y = isNaN(parseInt(monthList[i].totCycleTimeBacklog)) ? null : parseFloat(monthList[i].totCycleTimeBacklog.toFixed(1));
      cycleTimeBacklogParSer.data.push(ctfPData);

      var ctfPData = new Object();
      ctfPData.name = monthList[i + 1].month;
      ctfPData.x = graphCategory.indexOf(monthList[i + 1].month);
      ctfPData.y = isNaN(parseInt(monthList[i + 1].totCycleTimeBacklog)) ? null : parseFloat(monthList[i + 1].totCycleTimeBacklog.toFixed(1));
      cycleTimeBacklogParSer.data.push(ctfPData);

      var ctwPData = new Object();
      ctwPData.name = monthList[i].month;
      ctwPData.x = graphCategory.indexOf(monthList[i].month);
      ctwPData.y = isNaN(parseInt(monthList[i].totCycleTimeWIP)) ? null : parseFloat(monthList[i].totCycleTimeWIP.toFixed(1));
      cycleTimeWIPParSer.data.push(ctwPData);

      var ctwPData = new Object();
      ctwPData.name = monthList[i + 1].month;
      ctwPData.x = graphCategory.indexOf(monthList[i + 1].month);
      ctwPData.y = isNaN(parseInt(monthList[i + 1].totCycleTimeWIP)) ? null : parseFloat(monthList[i + 1].totCycleTimeWIP.toFixed(1));
      cycleTimeWIPParSer.data.push(ctwPData);

    } else {
      var vData = new Object();
      vData.name = monthList[i].month;
      vData.y = isNaN(parseInt(monthList[i].totalPoints)) ? 0 : parseInt(monthList[i].totalPoints);
      vData.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
      vData.totalSquad = isNaN(parseInt(monthList[i].totalSquad)) ? 0 : parseInt(monthList[i].totalSquad);
      velocitySeries.data.push(vData);

      var tData = new Object();
      tData.name = monthList[i].month;
      tData.y = isNaN(parseInt(monthList[i].totalStories)) ? 0 : parseInt(monthList[i].totalStories);
      tData.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
      tData.totalSquad = isNaN(parseInt(monthList[i].totalSquad)) ? 0 : parseInt(monthList[i].totalSquad);
      throughputSeries.data.push(tData);

      var defData = new Object();
      defData.name = monthList[i].month;
      defData.y = isNaN(parseInt(monthList[i].totalDefectsStartBal)) ? 0 : parseInt(monthList[i].totalDefectsStartBal);
      defectsStartSeries.data.push(defData);

      defData = new Object();
      defData.name = monthList[i].month;
      defData.y = isNaN(parseInt(monthList[i].totalDefects)) ? 0 : parseInt(monthList[i].totalDefects);
      defectsSeries.data.push(defData);

      var depData = new Object();
      depData.name = monthList[i].month;
      depData.y = isNaN(parseInt(monthList[i].totalDplymts)) ? 0 : parseInt(monthList[i].totalDplymts);
      deploySeries.data.push(depData);

      var tsData = new Object();
      tsData.name = monthList[i].month;
      tsData.y = isNaN(parseInt(monthList[i].totTeamStat)) ? null : parseFloat(monthList[i].totTeamStat.toFixed(1));
      teamStatSeries.data.push(tsData);

      var csData = new Object();
      csData.name = monthList[i].month;
      csData.y = isNaN(parseInt(monthList[i].totClientStat)) ? null : parseFloat(monthList[i].totClientStat.toFixed(1));
      clientStatSeries.data.push(csData);
    }

    tLt5Data.name = monthList[i].month;
    tLt5Data.y = isNaN(parseInt(monthList[i].teamsLt5)) ? null : parseInt(monthList[i].teamsLt5) == 0 ? null : parseInt(monthList[i].teamsLt5);
    tLt5Data.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    teamLt5Ser.data.push(tLt5Data);

    t5to12Data.name = monthList[i].month;
    var i5to12 = isNaN(parseInt(monthList[i].teams5to12)) ? null : parseInt(monthList[i].teams5to12) == 0 ? null : parseInt(monthList[i].teams5to12);
    var totIter = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    var percen = parseFloat(((i5to12 / totIter) * 100).toFixed(1));
    t5to12Data.y = percen;
    t5to12Data.totalCompleted = totIter;
    // t5to12Data.squadTeams = i5to12;
    t5to12Data.percentage = percen;
    if (monthList[i].partialMonth == true) {
      t5to12Data.color = 'orange';
    }
    team5to12Ser.data.push(t5to12Data);
    //partialSeries.data.push(0);

    tGt12Data.name = monthList[i].month;
    tGt12Data.y = isNaN(parseInt(monthList[i].teamsGt12)) ? null : parseInt(monthList[i].teamsGt12) == 0 ? null : parseInt(monthList[i].teamsGt12);
    tGt12Data.totalCompleted = isNaN(parseInt(monthList[i].totalCompleted)) ? 0 : parseInt(monthList[i].totalCompleted);
    teamGt12Ser.data.push(tGt12Data);
  }

  var pData = [];
  var pDataObj = new Object();
  pDataObj.name = 'Teams <5 mbrs';
  pDataObj.y = curTeamstat.teamsLt5 == 0 ? null : curTeamstat.teamsLt5;
  pDataObj.tc = curTeamstat.tcLt5;
  pDataObj.fte = curTeamstat.fteLt5.toFixed(1);
  pDataObj.color = '#D3D3D3';
  pData.push(pDataObj);

  pDataObj = new Object();
  pDataObj.name = 'Teams 5-12 mbrs';
  pDataObj.y = curTeamstat.teams5to12 == 0 ? null : curTeamstat.teams5to12;
  pDataObj.tc = curTeamstat.tc5to12;
  pDataObj.fte = curTeamstat.fte5to12.toFixed(1);
  pDataObj.color = '#93FF93';
  pData.push(pDataObj);

  pDataObj = new Object();
  pDataObj.name = 'Teams >12 mbrs';
  pDataObj.y = curTeamstat.teamsGt12 == 0 ? null : curTeamstat.teamsGt12;
  pDataObj.tc = curTeamstat.tcGt12;
  pDataObj.fte = curTeamstat.fteGt12.toFixed(1);
  pDataObj.color = '#808080';
  pData.push(pDataObj);


  var totTeamCnt = curTeamstat.teamsLt5 + curTeamstat.teams5to12 + curTeamstat.teamsGt12;
  var cenTitle = 'Total team count:<br>' + totTeamCnt;

  var pizYMax = 100;
  if (!team5to12Ser.data.length > 0) {
    pizYMax = null;
  }

  var ctsYMax = 4;
  if (!(teamStatParSer.data.length > 0 || teamStatSeries.data.length > 0 || clientStatParSer.data.length > 0 || clientStatSeries.data.length > 0)) {
    ctsYMax = null;
  }
  destroyIterationCharts();
  loadChartPartialSeries('pvelocityChart', 'Velocity', 'line', graphCategory, 'Story points', 'Iteration results by month', velocityParSer, velocitySeries, 'Points', false);
  loadChartPartialSeries('pthroughputChart', 'Throughput', 'line', graphCategory, 'Stories/tickets/cards', 'Iteration results by month', throughputParSer, throughputSeries, 'Points', false);
  loadBarPizzaChart('pPizzaChart', 'Squad Team Size Per Iteration', 'column', graphCategory, team5to12Ser, partialSeries, pizYMax);
  // loadDeploymentsChartParent('pdefectsChart', 'Deployments/Defects', 'line', graphCategory, 'Count', 'Iteration results by month', deployParSer, deploySeries, defectsParSer, defectsSeries, 'Points', false);
  loadDefectsChartParent('pdefectsChart', graphCategory, defectsSeries, defectsParSer, defectsStartSeries, defectsParStartSer, deploySeries, deployParSer);
  loadSatisfactionChartParent('pstatisfactionChart', 'Client and Team Satisfaction', 'line', graphCategory, 'Rating', 'Iteration results by month', teamStatParSer, teamStatSeries, clientStatParSer, clientStatSeries, 'Points', false, ctsYMax);
  loadPiePizzaChart('piePizzaChart', '2 Pizza Rule (Squad Teams - Current)', 'pie', pData, cenTitle);
  loadWipBackoutChartParent('pwipBacklogChart', 'Cycle time in backlog and cycle time in WIP (in days)', 'line', graphCategory, 'Average days per story', 'Iteration results by month', cycleTimeBacklogParSer, cycleTimeBacklogSeries, cycleTimeWIPParSer, cycleTimeWIPSeries, 'Points', false);
  $('#spinnerContainer').hide();
  $('#mainContent').show();
  redrawCharts('iterationSection');
}

function iterationEmptyScoreCard(teamId, teamName) {
  var graphCategory = [];

  var velocitySeries = new Object();
  velocitySeries.name = teamName;
  velocitySeries.data = [];

  var throughputSeries = new Object();
  throughputSeries.name = teamName;
  throughputSeries.data = [];

  destroyIterationCharts();

  loadScoreChart('velocityChart', 'Velocity', 'line', graphCategory, 'Story points', velocitySeries, velocitySeries, 'Points', 'Iteration results by month', null, false, false);
  loadScoreChart('throughputChart', 'Throughput', 'line', graphCategory, 'Stories/tickets/cards', throughputSeries, throughputSeries, 'Points', 'Iteration results by month', null, false, false);
}

function completedIterationsHandler(teamId, teamName, squadList, iterationList) {
  collectedIterations = iterationList;
  parentIterationScoreCard(teamId, teamName, squadList, collectedIterations);

}

function parentIterationScoreCard(teamId, teamName, squadList, iterationsList) {
  var teamIterations = [];
  if (!_.isEmpty(iterationsList) && !_.isEmpty(squadList)) {
    _.each(squadList, function(id) {
      teamIterations = _.union(teamIterations, _.where(collectedIterations, {
        team_id: id
      }));
    });
    iterationScoreCard(teamId, teamName, teamIterations);
  }
}
