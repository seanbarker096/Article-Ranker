import {
  CREATE_COMMENT_SUCCESS,
  EDIT_COMMENT_SUCCESS,
  GET_ARTICLES_SUCCESS,
  DELETE_COMMENT_SUCCESS,
  DELETE_ARTICLE_SUCCESS,
  VOTE_ON_COMMENT_SUCCESS,
  PENDING,
  FAILED,
  RESET_REQUEST_STATUS,
} from "../actions/types";

import getActionType from "../utils/getActionType";

//normalized data structre
const initialState = {
  byId: {},
  allIds: [],
  status: "idle",
  errors: {},
};

const commentReducer = (state = initialState, action) => {
  const type = getActionType(action.type, "comments");
  let comment, commentId, comments;
  switch (type) {
    case PENDING:
      return { ...state, status: "pending", errors: {} };
    case FAILED:
      return {
        ...state,
        status: "failed",
        errors: { [action.payload.errorType]: action.payload },
      };
    case `${RESET_REQUEST_STATUS}_comments`:
      return { ...state, status: "idle", errors: {} };
    case CREATE_COMMENT_SUCCESS:
      comment = action.payload;
      commentId = comment._id;
      return {
        ...state,
        byId: { ...state.byId, [commentId]: comment },
        allIds: [...state.allIds, commentId],
        status: "success",
        errors: {},
      };
    case EDIT_COMMENT_SUCCESS:
      const editedComment = action.payload;
      const id = editedComment._id;
      return {
        ...state,
        byId: { ...state.byId, [id]: { ...state.byId[id], editedComment } },
        allIds: [...state.allIds, id],
        status: "success",
        errors: {},
      };

    case DELETE_COMMENT_SUCCESS:
      comment = action.payload;
      commentId = comment._id;
      const newCommentsById = { ...state.byId };
      delete newCommentsById[commentId];
      const newIdsArrray = state.allIds.filter((el) => el !== commentId);
      return {
        ...state,
        byId: newCommentsById,
        allIds: newIdsArrray,
        status: "success",
        errors: {},
      };
    case GET_ARTICLES_SUCCESS:
      comments = action.payload.comments;
      if (comments) {
        const IDs = Object.keys(comments);
        return {
          ...state,
          byId: { ...state.byId, ...comments },
          allIds: [...state.allIds, ...IDs],
        };
      } else return state;
    case DELETE_ARTICLE_SUCCESS:
      const deletedArticleId = action.payload._id;
      const newCommentsObj = { ...state.byId };
      const newCommentIdArr = [...state.allIds];
      Object.values(newCommentsObj).forEach((comment) => {
        if (comment.articleId === deletedArticleId) {
          delete newCommentsObj[comment._id];
          newCommentIdArr.splice(newCommentIdArr.indexOf(comment._id), 1);
        }
      });
      return {
        ...state,
        byId: newCommentsObj,
        allIds: newCommentIdArr,
      };
    default:
      return state;
  }
};

export default commentReducer;
