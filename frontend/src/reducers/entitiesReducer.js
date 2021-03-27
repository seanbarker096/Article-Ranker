import { combineReducers } from "redux";
import commentReducer from "./commentReducer";
import userReducer from "./userReducer";
import articleReducer from "./articleReducer";
import articleCommentsUserReducer from "./articleCommentsUserReducer";
import votesReducer from "./votesReducer";

export default combineReducers({
  comments: commentReducer,
  articles: articleReducer,
  users: userReducer,
  articleCommentsUser: articleCommentsUserReducer,
  votes: votesReducer,
});
