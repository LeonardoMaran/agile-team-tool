var React = require('react');
var _ = require('underscore');
var moment = require('moment');

var TeamIteration = React.createClass({
  showMoreIterations: function() {
    var iterationsBlocks = $('tr[id^=irow_]');
    $('#iterationTitle').html('Iterations for' + this.props.selectedTeam.team.name);
    $('#moreIterations').hide();
    $('#lessIterations').show();
    _.each(iterationsBlocks, function(iterationBlock){
      $('#'+iterationBlock.id).show();
    });
  },
  showLessIterations: function() {
    var iterationsBlocks = $('tr[id^=irow_]');
    $('#iterationTitle').html('Last 5 Iterations for' + this.props.selectedTeam.team.name);
    $('#moreIterations').show();
    $('#lessIterations').hide();
    _.each(iterationsBlocks, function(iterationBlock){
      if (parseInt(iterationBlock.id.substring(5,iterationBlock.id.length)) >= 5) {
        $('#'+iterationBlock.id).hide();
      }
    });
  },
  render: function() {
    var self = this;
    if (self.props.selectedTeam.team == undefined) {
      return null;
    } else {
      var teamName = self.props.selectedTeam.team.name;
      if (self.props.selectedTeam.access) {
        var createAccess = '';
      } else {
        createAccess = 'disabled';
      }
      if (self.props.selectedTeam.type != 'squad') {
        return (
          <div class='ibm-container-body' id='iterationPageSection'>
            <h2 class='ibm-bold ibm-h4'>Iteration information</h2>
            <div id='nonSquadIterationPageSection' style={{'display': 'block'}}>
              <p>Non squad team does not manage iteration information.</p>
            </div>
          </div>
        )
      } else {
        var count = 0;
        if (self.props.selectedTeam.iterations != undefined && !_.isEmpty(self.props.selectedTeam.iterations)) {
          var iterations = self.props.selectedTeam.iterations.map(function(iteration){
            var iterationId = 'irow_'+count;
            var startDate = moment(iteration.startDate).format('DDMMMYYYY');
            var endDate = moment(iteration.endDate).format('DDMMMYYYY');
            var iname = iteration.name;
            if (count < 5) {
              count++;
              return (
                <tr key={iterationId} id={iterationId}>
                  <td></td>
                  <td>
                    <a style={{'textDescription': 'underline', 'color': 'black'}}>{iname}</a>
                  </td>
                  <td>{startDate}</td>
                  <td>{endDate}</td>
                </tr>
              )
            } else {
              count++;
              return (
                <tr key={iterationId} id={iterationId} style={{'display':'none'}}>
                  <td></td>
                  <td>
                    <a style={{'textDescription': 'underline', 'color': 'black'}}>{iname}</a>
                  </td>
                  <td>{startDate}</td>
                  <td>{endDate}</td>
                </tr>
              )
            }
          })
        } else {
          var iterations = null;
        }
        if (count >= 5) {
          var showMoreBtnStyle = {
            'display': 'block'
          }
        } else {
          var showMoreBtnStyle = {
            'display': 'none'
          }
        }
        return (
          <div class='ibm-container-body' id='iterationPageSection'>
            <h2 class='ibm-bold ibm-h4'>Iteration information</h2>
              <div id='squadIterationPageSection' style={{'display': 'block', 'marginTop': '15px'}}>
                <div style={{'float':'left', 'fontSize':'14px', 'width':'100%'}} class='tcaption'>
                  <em id='iterationTitle' class='ibm-bold'>Last 5 Iterations for {teamName}</em>
                  <p style={{'float': 'right'}} class='ibm-button-link'>
                    <input type='button' class='ibm-btn-pri ibm-btn-small' id='iterTeamBtn' value='Create iteration' onclick='' disabled={createAccess}/>
                  </p>
                </div>
                <table class='ibm-data-table' id='iterationTable' summary='List of iterations information' style={{'fontSize': '90%'}}>
                  <thead>
                    <tr>
                      <th scope='col' width='1%'></th>
                      <th scope='col' width='30%'>Iteration number/identifiers</th>
                      <th scope='col' width='35%'>Start date</th>
                      <th scope='col' width='35%'>End date</th>
                    </tr>
                  </thead>
                  <tbody id='iterationList'>
                    {iterations}
                  </tbody>
                </table>
                <div id='moreIterations' style={showMoreBtnStyle}>
                  <p>
                    <label> <a class='ibm-arrow-forward-bold-link' onClick={self.showMoreIterations}>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; More..</a> </label>
                  </p>
                </div>
                <div id='lessIterations' style={{'display': 'none'}}>
                  <p>
                    <label> <a class='ibm-arrow-forward-bold-link'onClick={self.showLessIterations}>&nbsp; &nbsp; &nbsp; &nbsp; &nbsp; Less..</a> </label>
                  </p>
                </div>
              </div>
          </div>
        )
      }
    }
  }
});

module.exports = TeamIteration;
