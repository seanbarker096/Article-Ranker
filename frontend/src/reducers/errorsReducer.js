/* eslint-disable import/no-anonymous-default-export */
const initialState = { errorObject: {}, suppress: true };

export default (state = initialState, action) => {
  switch (action.type) {
    case "CLEAR_ERRORS":
      return initialState;
    default:
      const { errorObject, suppress } = action;
      if (errorObject) {
        const error = errorObject.status === "error";
        if (error) {
          return { errorObject: { ...errorObject }, suppress };
        }
      }
      return state;
  }
};
