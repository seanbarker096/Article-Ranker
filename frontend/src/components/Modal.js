import React from "react";
import ReactDOM from "react-dom";

const Modal = ({ children }) => {
  return ReactDOM.createPortal(children, document.querySelector("#modal"));
};

export default Modal;
