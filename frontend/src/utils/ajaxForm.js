import { current } from "immer";
import { RESET_REQUEST_STATUS } from "../actions/types";

class ajaxForm {
  constructor(storeSlice, onSubmitActionCreator) {
    this.storeSlice = storeSlice;
    this.onSubmitActionCreator = onSubmitActionCreator;
    this.resetReqStatus = `${RESET_REQUEST_STATUS}_${storeSlice}`;
  }

  handleSubmit(event, dispatch, requestStatus, payload) {
    event.preventDefault();
    event.stopPropagation();
    if (requestStatus === "idle") {
      dispatch(this.onSubmitActionCreator(payload));
    }
  }

  renderError(error, currentResourceId = null) {
    //for some errors we can provider a id of the resource
    //the error is associated with.
    //This ensure error only rendered on that resource (e.g. only
    //on the article being deleted rather than all articles)
    if (error && currentResourceId) {
      if (!error.resourceId) {
        throw new Error(
          "RenderError Error: A resourceId must be provided in the error object"
        );
      }
      if (currentResourceId !== error.resourceId) return null;
    }
    if (error) {
      return <div className="ui red label">{error.message}</div>;
    } else return null;
  }

  handleFieldChange(e, stateSetter, formVals) {
    if (typeof formVals === "object") {
      stateSetter({ ...formVals, [e.target.name]: e.target.value });
    } else {
      stateSetter(e.target.value);
    }
  }
  handleFocus(e, requestStatus, dispatch) {
    e.stopPropagation();
    if (requestStatus === "failed") {
      setTimeout(() => {
        //clears error message
        dispatch({ type: this.resetRequestStatus });
      }, 5000);
    }
  }
}

export default ajaxForm;

// const handleFocus = (e) => {
//   e.stopPropagation();
//   if (requestStatus === "failed") {
//     setTimeout(() => {
//       //clears error message
//       dispatch({ type: `${RESET_REQUEST_STATUS}_articles` });
//     }, 1000);
//   }
// };
