import getActionType from "../utils/getActionType";
import {
  REFRESH_JWT_SUCCESS,
  PENDING,
  FAILED,
  RESET_REQUEST_STATUS,
} from "../actions/types";

const initialState = {
  errors: {},
  status: "idle",
};

const authReducer = (state = initialState, action) => {
  const type = getActionType(action.type, "auth");
  switch (type) {
    case PENDING:
      return { ...state, status: "pending", errors: {} };
    case FAILED:
      return {
        ...state,
        status: "failed",
        errors: { [action.payload.errorType]: action.payload },
      };
    case `${RESET_REQUEST_STATUS}_auth`:
      return { ...state, status: "idle", errors: {} };
    case REFRESH_JWT_SUCCESS:
      return { ...state, status: "success" };
    default:
      return state;
  }
};

export default authReducer;
