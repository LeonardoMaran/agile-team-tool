const React = require('react');
const propTypes = require('./prop-types');
const InlineSVG = require('svg-inline-react');
const dropdownIcon = require('../../../img/Att-icons/att-icons_show.svg');

const WizardStepTwo = (props) => {
  const toolId = props.tools && props.tools.length ? props.tools[0].toolId : 0;
  const teamName = props.team ? props.team.name : '';
  const projectName = props.projects && props.projects.length ? props.projects[0].projectName : '';
  const server = props.team.integration ? props.team.integration.server : '';

  return (
    <div className="att-integration">
      <h2 className="att-integration__heading-step">
        Step 2 of 4: Locate your {toolId} team
      </h2>
      <div className="att-integration__container">
        <span htmlFor="your-squad">Your Agile Team Tool Squad</span>
        <p><input type="text" value={teamName} /></p>

        {/* <span className="att-integration__label">
          {toolId} Server
        </span>
        <select className="att-integration__dropdown">
          <option defaultValue={server}>
            {server}
          </option>
        </select> */}

        <span>{toolId} Server</span>
        <div className="dropdown">
          <button className="dropdown-btn">{server}
            <InlineSVG src={dropdownIcon} />
          </button>
          <div className="dropdown-content">
            <option>{server}</option>
          </div>
        </div>

        <span>{toolId} Project Area</span>
        <div className="dropdown">
          <button className="dropdown-btn">{projectName}
            <InlineSVG src={dropdownIcon} />
          </button>
          <div className="dropdown-content">
            <option>{projectName}</option>
          </div>
        </div>
      </div>
    </div>
  );
};

WizardStepTwo.propTypes = propTypes.types;
WizardStepTwo.defaultProps = propTypes.defaults;

module.exports = WizardStepTwo;
