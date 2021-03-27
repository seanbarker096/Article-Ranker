import { useDispatch } from "react-redux";
import { useEffect } from "react";
import { RESET_REQUEST_STATUS } from "../../actions/types";

const useRequestStatus = function (
  requestStatus,
  initialValues,
  stateSetter,
  storeSlice,
  onSuccessParentCallback
) {
  //listen for request status changes
  const dispatch = useDispatch();
  const resetReqStatus = `${RESET_REQUEST_STATUS}_${storeSlice}`;
  return useEffect(() => {
    let timeout;
    if (requestStatus === "success") {
      //reset form values
      if (stateSetter) {
        //empty string valid value to revert back to
        if (!initialValues && initialValues !== "")
          throw Error("Please provide a value to revert state back to");
        stateSetter(initialValues);
      }
      //small value so true but alsmost instantaneous
      timeout = 100;
    }
    if (requestStatus === "failed") {
      timeout = 3000;
    }
    if (timeout) {
      setTimeout(() => {
        dispatch({ type: resetReqStatus });
      }, timeout);
    }
    if (requestStatus === "success" && onSuccessParentCallback) {
      //excute callback to tell parent request successful
      onSuccessParentCallback();
    }
  }, [
    dispatch,
    requestStatus,
    storeSlice,
    onSuccessParentCallback,
    initialValues,
    stateSetter,
    resetReqStatus,
  ]);
};

export default useRequestStatus;
