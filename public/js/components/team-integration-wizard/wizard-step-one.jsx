const React = require('react');
const PropTypes = require('prop-types');


const WizardStepOne = props => (
  <div className="att-integration">
    {props.integration.teamName}
    <h2 className="att-integration__heading">
      1 of 4: RTC Integration Overview
    </h2>
    <article className="att-integration__article">
      <div className="att-integration__article__image">
        <img
          className="att-integration__article__image__rtc-logo"
          alt="IBM Rational Policy Tester Logo"
          src={'../../img/ibm-rtc-logo-2x.png'}
        />
      </div>
      <div className="att-integration__article__text">
        <h3 className="att-integration__heading">Integrate {props.tools[0].toolName} with ATT</h3>
        <p>
          Connect Rational Team Connect (RTC) with Agile Team Tool (ATT)
          to automatically move your agile metrics data over every
          iteration. Save time and energy by avoiding extra spreadsheets to
          keep track of this information.
        </p>
        <p>
          This integration automates bringing over key agile metrics
          including: Velocity, THroughput, Time in WIP, Time in
          Backlog, Deployments, and Defects.
        </p>
      </div>
    </article>
  </div>
);

WizardStepOne.propTypes = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.arrayOf(PropTypes.string),
  })),
  integration: PropTypes.shape({
    id: PropTypes.number,
    toolId: PropTypes.string,
    server: PropTypes.string,
    teamName: PropTypes.string,
    projectArea: PropTypes.string,
  }),
};

WizardStepOne.defaultProps = {
  tools: [{
    toolId: 0,
    toolName: '',
    servers: [],
  }],
  integration: {},
};

module.exports = WizardStepOne;
