import { combineReducers } from "redux";

import articleVotesReducer from "./articlesVotesReducer";
import commentVotesReducer from "./commentsVotesReducer";

export default combineReducers({
  articlesVotes: articleVotesReducer,
  commentsVotes: commentVotesReducer,
});
