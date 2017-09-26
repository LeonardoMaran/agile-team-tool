// action types
const SHOW_PREVIEW = 'SHOW_PREVIEW';
const SHOW_PREVIEW_SUCCESS = 'SHOW_PREVIEW_SUCCESS';

const initialState = {

};

// actions
const showPreview = (teamId, integration) => ({
  type: [SHOW_PREVIEW],
  payload: {
    request: { url: `/teams/${teamId}/integration/preview`, method: 'post', data: integration },
  },
});

// reducer
const reducer = (state = initialState, action) => {
  switch (action.type) {
    case SHOW_PREVIEW:
      return action.payload.request.data;

    case SHOW_PREVIEW_SUCCESS:
      return action.payload.data;

    default:
      return state;
  }
};

module.exports = {
  reducer,
  showPreview,
};
