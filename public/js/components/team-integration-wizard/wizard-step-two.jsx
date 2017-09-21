const React = require('react');
const PropTypes = require('prop-types');


const WizardStepTwo = props => (
  <div className="att-integration">
    <h2 className="att-integration__heading-step">
      Step 2 of 4: Locate your {props.tools[0].toolId} team
    </h2>
    <div className="att-integration__container">
      <span htmlFor="your-squad">Your Agile Team Tool Squad</span>
      <p><input type="text" value={props.team.name} /></p>

      <span className="att-integration__label">
        {props.tools[0].toolId} Server
      </span>
      <select className="att-integration__dropdown">
        <option defaultValue={props.team.integration.server}>
          {props.team.integration.server}
        </option>
      </select>

      <span className="att-integration__label">
        {props.tools[0].toolId} Project Area
      </span>
      <select className="att-integration__dropdown">
        <option defaultValue={props.project.name}>{props.project.name}</option>
      </select>

    </div>
  </div>
);

WizardStepTwo.propTypes = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.arrayOf(PropTypes.string),
  })),
  project: PropTypes.shape({
    id: PropTypes.string,
    name: PropTypes.string,
  }),
  team: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    integration: PropTypes.shape({
      toolId: PropTypes.string,
      server: PropTypes.string,
      projectId: PropTypes.string,
      settings: PropTypes.arrayOf(PropTypes.shape({
        defects: PropTypes.object,
        velocity: PropTypes.object,
        throughput: PropTypes.object,
        wip: PropTypes.object,
        backlog: PropTypes.object,
        deployments: PropTypes.object,
        iterationPattern: PropTypes.string,
      })),
    }),
  }),
};

WizardStepTwo.defaultProps = {
  tools: [],
  project: {},
  team: {},
};

module.exports = WizardStepTwo;
