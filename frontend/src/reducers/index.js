import { combineReducers } from "redux";
//redux form reducer
import { reducer as formReducer } from "redux-form";
import entitiesReducer from "./entitiesReducer";
import authReducer from "./authReducer";

export default combineReducers({
  form: formReducer,
  auth: authReducer,
  entities: entitiesReducer,
});
