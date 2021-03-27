/* eslint-disable import/no-anonymous-default-export */
import {
  PENDING,
  FAILED,
  RESET_REQUEST_STATUS,
  VOTE_ON_COMMENT_SUCCESS,
  GET_ARTICLES_VOTES_SUCCESS,
} from "../actions/types";
import Profile from "../components/UserProfile/Profile";
import getActionType from "../utils/getActionType";

const initialState = {
  //by commentId
  byParentId: {},
  status: "idle",
  errors: {},
};

export default function (state = initialState, action) {
  const type = getActionType(action.type, "commentsVotes");
  switch (type) {
    case FAILED: {
      //if for sepcific resource
      if (action.payload.resourceId) {
        return {
          ...state,
          status: {
            [action.payload.resourceId]: "failed",
          },
          errors: {
            [action.payload.errorType]: {
              [action.payload.resourceId]: action.payload,
            },
          },
        };
      }
      return {
        ...state,
        status: "failed",
        errors: {
          [action.payload.errorType]: action.payload,
        },
      };
    }
    case PENDING:
      return {
        ...state,
        status: "pending",
        errors: {},
      };
    case `${RESET_REQUEST_STATUS}_commentsVotes`:
      return {
        ...state,
        status: "idle",
        errors: {},
      };
    case VOTE_ON_COMMENT_SUCCESS: {
      let {
        votersVote,
        voterId,
        voteDoc: { resourceId = null, voteSum = 0 },
      } = action.payload;
      //if comment is getting first ever vote
      if (!state.byParentId[resourceId]) {
        return {
          ...state,
          byParentId: {
            ...state.byParentId,
            [resourceId]: {
              voters: {
                [voterId]: votersVote,
              },
              voteSum,
            },
          },
          status: { [resourceId]: "success" },
          errors: {},
        };
      }
      return {
        ...state,
        byParentId: {
          ...state.byParentId,
          [resourceId]: {
            ...state.byParentId[resourceId],
            voters: {
              ...state.byParentId[resourceId].voters,
              [voterId]: votersVote,
            },
            voteSum,
          },
        },
        status: { [resourceId]: "success" },
        errors: {},
      };
    }
    case GET_ARTICLES_VOTES_SUCCESS:
      const { commentsVotes } = action.payload;
      console.log(action.payload);
      console.log(commentsVotes);
      return {
        ...state,
        byParentId: {
          ...state.byParentId,
          ...commentsVotes,
        },
        status: "success",
        errors: {},
      };
    default:
      return state;
  }
}
