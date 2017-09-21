const PropTypes = require('prop-types');

const types = {
  tools: PropTypes.arrayOf(PropTypes.shape({
    toolId: PropTypes.string,
    toolName: PropTypes.string,
    servers: PropTypes.array,
  })),
  team: PropTypes.shape({
    name: PropTypes.string,
    type: PropTypes.string,
    integration: PropTypes.shape({
      id: PropTypes.number,
      toolId: PropTypes.string,
      server: PropTypes.string,
      projectArea: PropTypes.string,
      settings: PropTypes.object,
    }),
  }),
  projects: PropTypes.arrayOf(PropTypes.shape({
    projectId: PropTypes.string,
    projectName: PropTypes.string,
  })),
  loadTools: PropTypes.func,
  loadTeam: PropTypes.func,
  loadProjects: PropTypes.func,
};

const defaults = {
  tools: [
    { toolId: '', toolName: '', servers: [] },
  ],
  integration: {},
  team: {},
  projects: [
    { projectId: '', projectName: '' },
  ],
  loadTools: () => {},
  loadTeam: () => {},
  loadProjects: () => {},
};

module.exports = {
  types,
  defaults,
};
