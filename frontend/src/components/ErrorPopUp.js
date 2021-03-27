import React, { useEffect } from "react";
import Modal from "./Modal";
import { useState } from "react";

const ErrorPopUp = ({ errors }) => {
  const { errorObject, suppress } = errors;
  const [visible, updateModalVisible] = useState("visible active");

  useEffect(() => {
    updateModalVisible("visible active");
  }, [errors]);

  const handleClick = () => {
    updateModalVisible("");
  };

  if (suppress) {
    return null;
  }
  if (errorObject !== {}) {
    return (
      <Modal>
        <div className={`ui dimmer modals ${visible}`}>
          <div className={`ui standard modal ${visible}`}>
            <button
              onClick={handleClick}
              className="ui right floated icon button"
            >
              <i className="close icon"></i>
            </button>
            <div className="header">App Error</div>
            <div className="content">{errorObject.message}</div>
          </div>
        </div>
      </Modal>
    );
  }
  return null;
};

export default ErrorPopUp;
