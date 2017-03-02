var React = require('react');
var api = require('../api.jsx');
var HomeSpinner = require('./HomeSpinner.jsx');
var HomeHighlightBox = require('./HomeHighlightBox.jsx');
var HomeTeamHeader = require('./HomeTeamHeader.jsx');
var HomeIterSection = require('./HomeIterSection.jsx');
var HomeAseSection = require('./HomeAseSection.jsx');
var HomeTeamInfo = require('./HomeTeamInfo.jsx');
var HomeMemberTable = require('./HomeMemberTable.jsx');
var InlineSVG = require('svg-inline-react');
var HomeChartFilter = require('./HomeChartFilter.jsx');
var HomeAseSummary = require('./HomeAseSummary2.jsx');

var HomeContent = React.createClass({
  shouldComponentUpdate: function(nextProps, nextState) {
    // if (nextProps.loadDetailTeam == this.props.loadDetailTeam) {
    //   return false;
    // } else {
    //   return true;
    // }
    if (_.isEmpty(this.props.loadDetailTeam) && _.isEmpty(nextProps.loadDetailTeam)) {
      return false;
    } else if (_.isEmpty(this.props.loadDetailTeam) && !_.isEmpty(nextProps.loadDetailTeam)) {
      return true
    } else {
      if (nextProps.loadDetailTeam.team && nextProps.loadDetailTeam.team.members && this.props.loadDetailTeam.team.members != nextProps.loadDetailTeam.team.members) {
        return true;
      } else if (nextProps.loadDetailTeam.team && nextProps.loadDetailTeam.team.links && this.props.loadDetailTeam.team.links != nextProps.loadDetailTeam.team.links){
        return true;
      } else {
        return false;
      }
    }
  },

  // handleResize: function(e) {
  //   $(Highcharts.charts).each(function(i,chart) {
  //     if (chart == null) return;
  //     if ($('#' + $(chart.container).attr('id')).length > 0) {
  //       var height = chart.renderTo.clientHeight;
  //       var width = chart.renderTo.clientWidth;
  //       chart.setSize(width, height);
  //     }
  //   });
  // },

  componentDidMount: function() {
    window.addEventListener('resize', this.props.handleChartResize);
  },

  componentWillUnmount: function() {
    window.removeEventListener('resize', this.props.handleChartResize);
  },

  showFilter: function() {
    if ($('.home-chart-filter-block').css('display') == 'none') {
      if (this.props.loadDetailTeam.team.type == 'squad') {
        $('.home-chart-filter-block').css('left', '32%');
      } else {
        $('.home-chart-filter-block').css('left', '-5%');
      }
      $('.home-chart-filter-block').fadeIn();
    } else {
      $('.home-chart-filter-block').fadeOut();
    }
  },
  render: function() {
    var partialName = 'Partial Data';
    if (this.props.loadDetailTeam.team) {
      if (this.props.loadDetailTeam.team.type == 'squad') {
        partialName = 'Team Change';
      } else {
        partialName = 'Partial Data';
      }
    }
    return (
      <div style={{'width': '100%', 'height': '100%'}}>
        <HomeSpinner id={'contentSpinner'}/>
        <div id='bodyContent' style={{'height':'100%','width':'100%'}}>
          <HomeHighlightBox />
          <HomeTeamHeader loadDetailTeam={this.props.loadDetailTeam} selectedTeamChanged={this.props.selectedTeamChanged} tabClickedHandler={this.props.tabClickedHandler} updateTeamLink={this.props.updateTeamLink} updateTeamDetails={this.props.updateTeamDetails} realodTeamMembers={this.props.realodTeamMembers} roles={this.props.roles} />
          <HomeAseSummary loadDetailTeam={this.props.loadDetailTeam} />
          <div class='home-trends-block'>
            <div class='home-trends-block-title'>
              <h1>Trends</h1>
              <span></span>
              <h4>&nbsp;/&nbsp;</h4>
              <h4 style={{'color':'#FFA501'}}>---</h4>
              <h4>&nbsp;/&nbsp;</h4>
              <h4 style={{'color':'#FFA501'}}>*</h4>
              <h4 id='partialName'>&nbsp;{partialName}</h4>
              <div onClick={this.showFilter} style={{'cursor':'pointer'}}>
                <InlineSVG src={require('../../../img/Att-icons/att-icons_filter.svg')}></InlineSVG>
              </div>
              <HomeChartFilter loadDetailTeam={this.props.loadDetailTeam} showFilter={this.showFilter}/>
            </div>
            <div class='home-trends-overflow'>
              <HomeIterSection loadDetailTeam={this.props.loadDetailTeam}/>
              <HomeAseSection loadDetailTeam={this.props.loadDetailTeam}/>
            </div>
          </div>
        </div>
      </div>
    )
  }
});

module.exports = HomeContent;
