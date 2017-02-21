var React = require('react');
var api = require('../api.jsx');
var _ = require('underscore');
var InlineSVG = require('svg-inline-react');
var Modal = require('react-overlays').Modal;
var HomeAddTeamFooterButtons = require('./HomeAddTeamFooterButtons.jsx');
var HomeTeamParentChildSelection = require('./HomeTeamParentChildSelection.jsx');

var HomeAddTeamHierarchyModal = React.createClass({
  getInitialState: function() {
    return {
      buttonOptions: {
        prevScreen: 'showTeamTypeModal',
        prevDisabled: '',
        nextScreen: 'showTeamMemberModal',
        nextDisabled: 'disabled'
      },
      selparentList: 'none',
      children: [],
      childCount: 0,
      defaultParentObjects: [
        {name: 'Parent of my currently selected team', id: 'parentOfSelected'},
        {name: 'Peer of my currently selected team', id: 'peerOfSelected'}
      ],
      teamNames: []
    }
  },

  componentDidMount: function() {
    this.setState({selparentList: 'none'});
    $("#pc-hier-selChild").prop('disabled', false);  
  //$("#pc-hier-selparent").select2();
  //$("#pc-hier-selChild").select2(); 
    //$("#pc-hier-selparent").change(this.props.onchangeParentHierchSel);
    // $("#pc-hier-selChild").change(this.props.onchangeChildHierchSel);
  //  $("#pc-hier-selChild").change(this.childSelectHandler);

    var buttonOptions = this.state.buttonOptions;
    buttonOptions.prevDisabled = '';
    buttonOptions.prevScreen = 'showTeamTypeModal';
    buttonOptions.nextDisabled = '';
    buttonOptions.nextScreen = 'showTeamMemberModal';
    this.setButtonOptions(buttonOptions);

    this.selectListInit();    
  },

  setButtonOptions: function(buttonOptions) {
    this.setState({ buttonOptions: buttonOptions });
  },

  show: function() {
    var self = this;
    console.log('show',self.props.selectedParentTeam);   
 
    $('#optsel-parent select').select2({'dropdownParent':$('#optsel-parent')});
    $('#pc-hier-selparent').change(self.parentSelectHandler);

    if (!_.isEmpty(self.props.selectedParentTeam))
      $('#pc-hier-selparent').val(self.props.selectedParentTeam._id).change();

    $('#optsel-child select').select2({'dropdownParent':$('#optsel-child')});
    $('#pc-hier-selChildren').change(self.childSelectHandler);

   $('#optsel-parent select2-search input').select2({'font-size:1.4em;':$('#optsel-parent')});
 

//    $("#teamTypeBlock span[data-widget=tooltip]").tooltip();
  },

  selectListInit: function() {
    var self = this;
    //self.setState({teamNames: this.props.teamNames});
    console.log('In selectListIntit: '+   this.state.teamNames.length);
    api.fetchTeamNames()
      .then(function(teams) {
        var selectableChildren = _.sortBy(teams, 'name');
          console.log('In HomeTeamParentChildSelection: before selectableChildren:'+selectableChildren.length);
          self.setState({teamNames: selectableChildren});
          });

  },


  parentSelectHandler: function(e){
    var self = this;
    var selectedValue = e.target.value;
    
    var team = _.find(self.props.selectableParents, function(team) {
      if (_.isEqual(selectedValue,team._id)) return team;
    });
    self.props.setSelectedParentTeam(team);

    var filteredTeam = [];
    filteredTeam = _.filter(this.state.teamNames, function(team) {
      return !_.isEqual(team._id, selectedValue);
    });
    self.setState({teamNames: filteredTeam});
  },

  childDeleteHandler: function(id) {
    var self = this;
    console.log('childDeleteHandler',id);    
    var children = self.state.children;
    children = _.filter(children, function(team) {
       return !_.isEqual(id, team._id);
    });
    self.setState({children:children});
//    this.props.onchangeChildTeamList(this.state.children);
  },

  childSelectHandler: function(e) {
    var self = this;         
    console.log('childSelectHandler');
    var selectedValue = e.target.value;
    /*if (!_.isEmpty(selectedValue)) {
      var buttonOptions = self.props.buttonOptions;
      buttonOptions.nextDisabled = '';
      buttonOptions.nextScreen = 'showTeamMemberModal';
      self.props.setButtonOptions(buttonOptions);
    }
    */

    $('#btn-teamaddparentchildhier').prop('disabled', false);

    var selectedChild = $('#pc-hier-selChild option:selected').val();
    if (!_.isEmpty(selectedChild)) {
      var childTeam = _.find(self.state.teamNames, function(team) {
        if (team._id == selectedChild) return team;
      })
      if ($('.team-hier-children p#'+selectedChild).length > 0) {
        //alert(childTeam.name + ' is already listed.');
        return;
      }
      var children = self.state.children;
      children.push(childTeam);
      children = _.sortBy(children, 'name');

      self.setState({children:children});
//      this.props.onchangeChildTeamList(this.state.children);
    }
  },
  

  render: function () {
    var self = this;
    var noteStyle = {
       color: '#4178BE'
    };

    var selparent1Style = {'display': 'block'};

    var childTeams = null;

    childTeams = this.state.children.map(function(item, index) {
      return (
         <p key={index} id={item._id}>
          <h title={item.name}>{item.name}</h>
          <InlineSVG class='list-child-remove-icon' src={require('../../../img/Att-icons/att-icons_remove.svg')} onClick={self.childDeleteHandler.bind(null, item._id)}></InlineSVG> </p>
        )
    });

    var populateChildrenTeamNames = null;
    populateChildrenTeamNames = this.state.teamNames.map(function(item) {
     return (
       <option key={item._id} value={item._id}>{item.name}</option>
      );
    });

   var populateParentTeamNames = this.props.selectableParents.map(function(item) {
     return ( 
      <option key={item._id} value={item._id}>{item.name}</option>
     ) ;
   });

   var populateDefaultParentOption = this.state.defaultParentObjects.map(function(item) {
     return ( 
      <option key={item._id} value={item._id}>{item.name}</option>
     ) ;
   });





  return (
    <div>
      <Modal aria-labelledby='modal-label' className='reactbootstrap-modal' backdropClassName='reactbootstrap-backdrop' show={self.props.activeWindow} onShow={self.show}>
        <div class='new-team-creation-add-block' id='pc-hier-SetupBlock'>

          <div class='new-team-creation-add-block-header'>
            <h>Parent/Child Team Hierarchy</h>
            <span class='close-ico'><InlineSVG onClick={self.props.closeWindow} src={require('../../../img/Att-icons/att-icons-close.svg')}></InlineSVG></span>
          </div>

          <div class='new-team-creation-add-block-content'>
            <div class='new-team-creation-add-block-content-mid'>
              <div class='top-note-parent-child-hierarchy'>Please choose the parent team, if any, "above" your team as well as the childrean beneath.</div>

              <div class='home-modal-block-content'>
                <div class='team-hier-block'>
                  <div class='team-setup-icon-hier'>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_parent+squad.svg')}></InlineSVG>
                   </div>

                   <div class='team-parent-child-hierarchy-p'>  
                     <div class='line1' style={{'width':150}}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')} name="imgSvg"></InlineSVG>
                    </div>
                    <div class='line2' style={{'width':150}}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
                    </div>
                    <div class='line3' style={{'width':145}}>
                      <InlineSVG src={require('../../../img/Att-icons/att-icons_arrow-thin-grey.svg')}></InlineSVG>
                    </div>

                    <div class="optsel-parent" style={selparent1Style} id="optsel-parent">     
                      <select name="pc-hier-selparent" id="pc-hier-selparent" class="pc-hier-selparent">
                        <option key='NA' value='NA' selected>Select parent team</option>
                        <option key='NoParent' value='NoParent'>Top tier / No Parent Above / Not Listed</option>
                        {populateParentTeamNames}
                      </select>
                    </div>

                    <div class="curteam-block">Current Team (being made)</div>

                    <div class="optsel-child" style={selparent1Style} id="optsel-child">     
                      <select name="pc-hier-selChild" id="pc-hier-selChild" class="pc-hier-selChild">                          
                        <option value='NA'>Add children team(s)</option>
                        <option value='NoChild'>Not Listed</option>
                        {populateChildrenTeamNames}
                      </select>
                    </div>                

                    <div>
                      <div class='team-hier-children'>
                      {childTeams}
                   </div>   
                 </div>
                </div>    
              </div>

              <div class="clearboth"></div>
            </div>



          </div>
        </div>   
        <HomeAddTeamFooterButtons buttonOptions={self.state.buttonOptions} openWindow={self.props.openWindow} />
       </div>
      </Modal>
    </div>
    )
  }
});
module.exports = HomeAddTeamHierarchyModal;
