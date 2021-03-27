import { useState, useRef, useEffect } from "react";
import { useSelector, useDispatch } from "react-redux";

import { userApiReqStatusSelector } from "../../selectors";
import { editUser } from "../../actions";
import Form from "../Form";
import editUserFormFields from "./editUserFormFields";

const Profile = ({ user }) => {
  const initialValues = {};
  const [editPageActive, setEditPageActive] = useState(false);
  const editUserApiReqStatus = useSelector((state) =>
    userApiReqStatusSelector(state)
  );
  const dateJoined = new Date(user.dateJoined);
  const stateRef = useRef();
  stateRef.current = editUserApiReqStatus;

  useEffect(() => {
    if (stateRef.current === "success") {
      setEditPageActive(false);
    }
  }, [setEditPageActive, editUserApiReqStatus]);

  const handleEditButtonClick = (e) => {
    e.stopPropagation();
    //display edit form
    setEditPageActive(true);
  };

  const renderPage = () => {
    if (editPageActive) {
      if (user) {
        Object.keys(user).forEach((key) => {
          initialValues[key] = user[key];
        });
      }
      return (
        <div>
          <Form
            formFields={editUserFormFields}
            initialValues={initialValues}
            errorType="EDIT_USER_ERROR"
            resourceType="users"
            actionCreator={editUser}
            apiUrl="/users/me"
            handleCancelClick={() => setEditPageActive(false)}
          ></Form>
        </div>
      );
    } else {
      return (
        <div className="ui items">
          <div className="item">
            <div className="ui small image">
              <img src="/images/avatar-1577909_1280.png" alt="user" />
            </div>
            <div className="content">
              <div className="header">{user.name}</div>
              <div className="ui list">
                <div className="item">
                  <i className="users icon"></i>
                  <div className="content">
                    {`Role: ${user.role[0].toUpperCase()}${user.role.slice(1)}`}
                  </div>
                </div>
                <div className="item">
                  <i className="users icon"></i>
                  <div className="content">{`Member since ${dateJoined.getMonth()}/${dateJoined.getFullYear()}`}</div>
                </div>
              </div>
            </div>
          </div>
          <button
            className="ui right floated button primary"
            onClick={handleEditButtonClick}
          >
            Update Details
          </button>
        </div>
      );
    }
  };
  return <div>{renderPage()}</div>;
};

export default Profile;
