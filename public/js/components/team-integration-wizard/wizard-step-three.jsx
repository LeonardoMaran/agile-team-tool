const React = require('react');
const PropTypes = require('prop-types');

const WizardStepThree = props => (
  <div className="att-integration">
    <h2 className="att-integration__heading-step">
      Step 3 of 4: Configure your metrics
    </h2>
    <p className="att-integration__paragraph-step">
      Enter the {props.tools[0].toolId} attributes you use
      to calculate your team&apos;s key agile metrics.
    </p>
    <div className="att-integration__container">
      <ul className="att-integration__unstyled-list">
        <li>Velocity</li>
        <li>Throughput</li>
        <li>Time in Work In Progress (WIP)</li>
        <li>Time in Backlog</li>
        <li>Defects</li>
        <li>Deployments</li>
      </ul>
    </div>
  </div>
);

WizardStepThree.propTypes = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.arrayOf(PropTypes.string),
  })),
};

WizardStepThree.defaultProps = {
  tools: [],
};

module.exports = WizardStepThree;
