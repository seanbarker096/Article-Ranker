import { useDispatch, useSelector } from "react-redux";
import { useRef } from "react";
import { reset } from "redux-form";
import createReduxForm from "./createReduxForm";
import { signUp, getUser } from "../actions";
import { RESET_REQUEST_STATUS } from "../actions/types";
import { unwrapResult } from "@reduxjs/toolkit";

import ajaxForm from "../utils/ajaxForm";
import useRequestStatus from "../utils/customHooks/useRequestStatus";

const AjaxForm = new ajaxForm("users", signUp);

let SignUp = () => {
  const dispatch = useDispatch();
  const reqStatus = useSelector((state) => state.entities.users.status);
  const signUpError = useSelector(
    (state) => state.entities.users.errors.SIGN_UP_ERROR
  );

  const stateRef = useRef();
  stateRef.current = reqStatus;

  const onFormSubmit = async (formValues) => {
    if (reqStatus === "idle") {
      try {
        let res = await dispatch(signUp(formValues));
        //get payload out
        res = unwrapResult(res);
        //will reach here if request was successful
        await dispatch(getUser());
        //reset redux form fields
        dispatch(reset("signUp"));
        //reset request state
        dispatch({ type: `${RESET_REQUEST_STATUS}_users` });
      } catch (err) {
        console.log(err);
      }
    }
  };
  const renderError = () => AjaxForm.renderError(signUpError);

  useRequestStatus(stateRef.current, null, null, "users");

  const initialVals = {
    email: "",
    password: "",
    firstName: "",
  };

  const signUpFields = [
    {
      name: "name",
      key: "name",
      type: "text",
      label: "Name",
    },
    {
      name: "email",
      key: "email",
      type: "email",
      label: "E-mail",
    },
    {
      name: "password",
      key: "password",
      type: "password",
      label: "Password",
    },
    {
      name: "passwordConfirmation",
      key: "password-confirmation",
      type: "password",
      label: "Confirm Password",
    },
  ];

  let SignUpForm = createReduxForm(
    onFormSubmit,
    null,
    "signUp",
    initialVals,
    signUpFields
  );

  return (
    <div>
      <h2 className="ui center aligned icon header">
        <i className="circular user icon"></i>
        Sign Up
      </h2>
      {renderError(signUpError)}
      <SignUpForm />
      <div className="ui horizontal divider">OR</div>
      <h2 className="ui center aligned icon header">
        <i className="circular google icon"></i>
        <a href="api/v1/auth/google" className="ui button black">
          "Sign Up With Google"
        </a>
      </h2>
    </div>
  );
};

export default SignUp;

// //if user enters form following error or submission, update state accordingly
// const handleFocus = (e) => {
//   e.stopPropagation();
//   if (reqStatus === "failed") {
//     setTimeout(() => {
//       dispatch({ type: `${RESET_REQUEST_STATUS}_users` });
//     }, 1000);
//   }
// };
