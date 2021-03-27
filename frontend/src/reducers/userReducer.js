import {
  PENDING,
  FAILED,
  RESET_REQUEST_STATUS,
  GET_USER_SUCCESS,
  SIGN_IN_SUCCESS,
  SIGN_UP_SUCCESS,
  SIGN_OUT_SUCCESS,
  GET_USER_ANALYTICS_SUCCESS,
  EDIT_USER_SUCCESS,
} from "../actions/types";
import getActionType from "../utils/getActionType";

const initialState = {
  currentUser: null,
  users: {
    byId: {},
    allIds: [],
  },
  status: "idle",
  errors: {},
};

export default function userReducer(state = initialState, action) {
  let comments, article, user, userId;
  const type = getActionType(action.type, "users");
  switch (type) {
    case PENDING:
      return { ...state, status: "pending", errors: {} };
    case FAILED:
      return {
        ...state,
        status: "failed",
        errors: { [action.payload.errorType]: action.payload },
      };
    case `${RESET_REQUEST_STATUS}_users`:
      return { ...state, status: "idle", errors: {} };
    case SIGN_OUT_SUCCESS:
      return { ...state, currentUser: null, status: "success" };
    case SIGN_IN_SUCCESS:
      return { ...state, status: "success", errors: {} };
    case SIGN_UP_SUCCESS:
      return { ...state, status: "success", errors: {} };
    case GET_USER_SUCCESS:
      return { ...state, currentUser: action.payload, status: "success" };
    case GET_USER_ANALYTICS_SUCCESS:
      return {
        ...state,
        currentUserAnalytics: {
          ...state.currentUserAnalytics,
          userActivity: action.payload.userActivity,
        },
        status: { GET_USER_ANALYTICS: "success" },
      };
    case EDIT_USER_SUCCESS:
      const updatedUser = action.payload;
      return {
        ...state,
        currentUser: {
          ...state.currentUser,
          ...updatedUser,
        },
        status: "success",
        errors: {},
      };
    default:
      return state;
  }
}
