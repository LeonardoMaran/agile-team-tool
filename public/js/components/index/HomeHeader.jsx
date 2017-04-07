var React = require('react');
var InlineSVG = require('svg-inline-react');
var HomeFeedback = require('./HomeFeedback.jsx');
var HomeApikey = require('./HomeApikey.jsx');

var HomeHeader = React.createClass({
  getInitialState: function() {
    return {
      userInterfaceIndicator: false,
      showFeedbackModal: false,
      showApikeyModal: false
    }
  },
  showFeedback: function() {
    this.setState({userInterfaceIndicator: false, showFeedbackModal: true});
  },
  showUserInterfaceFeedback: function() {
    this.setState({userInterfaceIndicator: true, showFeedbackModal: true});
  },
  closeFeedback: function() {
    this.setState({ showFeedbackModal: false });
  },
  showApikey: function() {
    this.setState({ showApikeyModal: true });
  },
  closeApikey: function() {
    this.setState({ showApikeyModal: false });
  },
  render: function() {
    var userName = user.ldap.preferredFirstName || user.ldap.hrFirstName;
    var callupName = user.ldap.callupName || userName;
    var userImage = '//images.w3ibm.mybluemix.net/image/'+user.ldap.uid.toUpperCase();
    var siteEnv = '';
    var revertToOld = {
      'display': environment.toLowerCase() == 'development'?'none':'inline-block',
//      'display': 'inline-block',
      'color':'#3B6DAA'
    };

    var feedbackPopup = {
//      'display': environment.toLowerCase() == 'development'?'none':'inline-block',
      'display': 'inline-block',
      'color':'#3B6DAA'
    };

    if (_.isEmpty(environment) || environment.toLowerCase() == 'development')
      siteEnv = 'Stage'
    return (
      <div class='agile-home-header'>
        <div class='header-title'>
          <div>IBM</div>&nbsp;<div>Agile Team Tool</div>&nbsp;
          <div class='home-header-banner-message'>{siteEnv} &nbsp; &nbsp;
            <span class='home-header-banner-icon' style={revertToOld}>
            <a href="https://agiletool.mybluemix.net">
            <InlineSVG src={require('../../../img/Att-icons/att-icons-revert.svg')}></InlineSVG>
             <span class='home-header-banner-label'>
             Revert to previous interface
             </span>
            </a>
            </span>
            <span class='home-header-banner-label-feedback' style={feedbackPopup} >
             &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; My <a href="#" title="Feedback" id="feedback-modal" onClick={this.showUserInterfaceFeedback}>Feedback</a> on the new User Interface.
            </span>            
          </div>
        </div>
        <div class="header-menu">
          <div class="header-menu-dropdown">
            <div class='header-menu-icon'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_Profile.svg')}></InlineSVG>
            </div>
            <div class='header-menu-label'>{userName}</div>
            <div class='header-menu-icon-chev'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            </div>
            <div class='header-menu-icon-chev-hide'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            </div>
            <ul class="header-menu-profile-block">
              <li style={{'display':'none'}}>
                <div>Manage user profile</div>
              </li>
              <li style={{'display':'none'}}>
                <img src={userImage}/>
                <div>{callupName}</div>
              </li>
              <li>
                <div class="header-menu-icon-api" style={{'paddingTop':'1em'}}>
                  <a href="#" onClick={this.showApikey}>
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_api.svg')}></InlineSVG>
                    <div>API Key Generation</div>
                  </a>
                </div>
              </li>
              <li>
                <div class="header-menu-icon-logout">
                  <a href="/logout">
                    <InlineSVG src={require('../../../img/Att-icons/att-icons_logout.svg')}></InlineSVG>
                    <div>Log out</div>
                  </a>
                </div>
              </li>
            </ul>
          </div>
          <div class="header-menu-dropdown">
            <div class='header-menu-icon'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons_question.svg')}></InlineSVG>
            </div>
            <div class='header-menu-label'>Help</div>
            <div class='header-menu-icon-chev'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            </div>
            <div class='header-menu-icon-chev-hide'>
              <InlineSVG src={require('../../../img/Att-icons/att-icons-Chevron-down.svg')}></InlineSVG>
            </div>
            <ul class="header-menu-help-block">
              <li>
                <div>How to:</div>
              </li>
              <li>
                <a href="./docs/howto/AgileTeamTool_TeamDataGuide.pdf" target="_blank">Maintain Your Team Data</a>
              </li>
              <li>
                <a href="./docs/howto/AgileTeamTool_IterationResultsGuide.pdf" target="_blank">Record Iteration Results</a>
              </li>
              <li>
                <a href="./docs/howto/AgileTeamTool_MaturityAssessmentGuide.pdf" target="_blank">Assess Your Agile Maturity</a>
              </li>
              <li>
                <a href="./docs/howto/AgileTeamTool_PersonDayTeamSatTemplate.xlsx" target="_blank">Compute Person Days Avail</a>
              </li>
              <li>
                <a href="./docs/howto/AgileTeamTool_Top things to know about the new UI.pdf" target="_blank">Navigate the New Interface</a>
              </li>

              <li>
                <a href="./docs/howto/AgileTeamTool_Agile Team Tool User Guide_newUI.pdf" target="_blank">User Guide</a>
              </li>
              <li>
                <a href="./docs/howto/Agile Team Tool - Quick Ref.pdf" target="_blank">Quick Reference Card</a>
              </li>
              <li>
                <a href="./docs/howto/AgileTeamTool_FrequentlyAskedQuestions.pdf" target="_blank">FAQ</a>
              </li>
              <li>
                <a href="#" title="Feedback" id="feedback-modal" onClick={this.showFeedback}>Support & Feedback</a>
              </li>
              <li>
                <a href="https://w3-connections.ibm.com/forums/html/topic?id=b3e1586f-37a5-4d2a-a3e1-653867728fd8&ps=25" target="_blank">What's new</a>
              </li>
              <li>
                <a href="/api-docs" target="_blank">{'ATT API Documentation'}</a>
              </li>
            </ul>
          </div>
          <div class='header-logo'>
            <InlineSVG class='header-ibm-logo' src={require('../../../img/Att-icons/att-icons-IBM_logo.svg')}></InlineSVG>
          </div>
        </div>

        <HomeFeedback showFeedbackModal={this.state.showFeedbackModal} closeFeedback={this.closeFeedback} userInterfaceIndicator={this.state.userInterfaceIndicator}/>
        <HomeApikey showApikeyModal={this.state.showApikeyModal} closeApikey={this.closeApikey} />
      </div>
    )
  }
});

module.exports = HomeHeader;
