import React, { useRef } from "react";
import { useDispatch, useSelector } from "react-redux";

import Modal from "./Modal";
import { signOut } from "../actions";
import history from "../history";

import ajaxForm from "../utils/ajaxForm";
import useRequestStatus from "../utils/customHooks/useRequestStatus";

const AjaxForm = new ajaxForm("users", signOut);

const SignOut = () => {
  const dispatch = useDispatch();
  const signOutError = useSelector(
    (state) => state.entities.users.errors.SIGN_OUT_ERROR
  );
  const reqStatus = useSelector((state) => state.entities.users.status);

  const stateRef = useRef();
  stateRef.current = reqStatus;

  const handleClick = (event) => {
    if (reqStatus === "idle")
      if (
        event.target.id === "logout" ||
        event.target.parentElement.id === "logout"
      ) {
        dispatch(signOut());
      } else {
        history.goBack();
      }
  };

  useRequestStatus(stateRef.current, null, null, "users");

  const renderError = () => AjaxForm.renderError(signOutError);

  const SignOutContent = () => {
    return (
      //   <div className="ui dimmer modals visible active">
      <div className="ui dimmer modals visible active">
        <div className="ui icon header ">
          <i className="question inverted icon"></i>
          <p style={{ color: "white" }}>Are you sure you want to log out?</p>
        </div>
        <div className="actions">
          <div
            id="cancel"
            onClick={handleClick}
            className="ui red basic cancel inverted button"
          >
            <i className="remove icon"></i>
            No
          </div>
          <div
            className="ui green ok inverted button"
            id="logout"
            onClick={handleClick}
          >
            <i className="checkmark icon"></i>
            Yes
          </div>
        </div>
        {renderError()}
      </div>
    );
  };
  return (
    <Modal>
      <SignOutContent />
    </Modal>
  );
};

export default SignOut;
