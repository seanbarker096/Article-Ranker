import React, { useEffect } from "react";
import { Router, Route } from "react-router-dom";
import { useDispatch, useSelector } from "react-redux";

import Header from "./components/Header";
import SignUp from "./components/SignUp";
import SignIn from "./components/SignIn";
import SignOut from "./components/SignOut";
import CreateArticleForm from "./components/articles/CreateArticleForm";
import EditArticleForm from "./components/articles/EditArticleForm";
import Home from "./components/Home";
import MyProfileHome from "./components/UserProfile/MyProfileHome";
import Test from "./Test";
import ErrorPopUp from "./components/ErrorPopUp";
import history from "./history";
import { refreshJWT, getUser, getCsrfToken } from "./actions";
import { RESET_REQUEST_STATUS } from "./actions/types";

const App = () => {
  const user = useSelector((state) => state.entities.users.currentUser);
  const errors = useSelector((state) => state.errors);
  const dispatch = useDispatch();
  //get user and refreshJWT on app mount
  useEffect(() => {
    //refreshJWT
    const asyncFunc = async function () {
      //if still have valid refreshToken then we use it to get updated jwtToken.
      //Then use new JWT to get user data
      await dispatch(getCsrfToken());
      await dispatch(refreshJWT());
      //wont reach next line unless successful, so can reset status then
      dispatch({ type: `${RESET_REQUEST_STATUS}_auth` });
      await dispatch(getUser());
      dispatch({ type: `${RESET_REQUEST_STATUS}_users` });
    };
    asyncFunc();
  }, [dispatch]);

  //refresh JWT every 10 minutes
  useEffect(() => {
    setInterval(() => dispatch(refreshJWT()), 1000 * 60 * 10);
  }, [dispatch]);

  const SignOutPage = user ? SignOut : Home;
  return (
    <div className="ui container">
      {/* <Test /> */}
      <Router history={history}>
        <Header user={user} />
        <Route path="/signup">
          <SignUp />
        </Route>
        <Route path="/signin">
          <SignIn />
        </Route>
        <Route path="/signout">
          <SignOutPage />
        </Route>
        <Route path="/articles/new">
          <CreateArticleForm />
        </Route>
        <Route path="/articles/:id/edit" component={EditArticleForm} />
        <Route exact path="/">
          <Home />
        </Route>
        <Route path="/users/me" component={MyProfileHome} />
      </Router>
    </div>
  );
};

export default App;
