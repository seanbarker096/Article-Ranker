import { useDispatch, useSelector } from "react-redux";
import { useState, useRef } from "react";

import useRequestStatus from "../../utils/customHooks/useRequestStatus";
import ajaxForm from "../../utils/ajaxForm";
import {
  commentErrSelector,
  commentApiReqStatusSelector,
} from "../../selectors";
import { editComment } from "../../actions";

const AjaxForm = new ajaxForm("comments", editComment);
const EditCommentForm = ({
  commentText,
  commentId,
  onEditSuccess,
  handleCancelClick,
}) => {
  const error = useSelector((state) =>
    commentErrSelector(state, "EDIT_COMMENT_ERROR")
  );
  const reqStatus = useSelector((state) => commentApiReqStatusSelector(state));
  const dispatch = useDispatch();
  const [comment, updateComment] = useState(commentText);
  const stateRef = useRef();
  stateRef.current = reqStatus;
  //call custom useEffect hook
  useRequestStatus(
    stateRef.current,
    comment,
    updateComment,
    "comments",
    onEditSuccess
  );

  const handleSubmit = (e) =>
    AjaxForm.handleSubmit(e, dispatch, reqStatus, {
      commentText: comment,
      apiUrl: `/comments/${commentId}`,
      resourceId: commentId,
    });

  const renderError = () => AjaxForm.renderError(error);

  const handleCommentChange = (e) =>
    AjaxForm.handleFieldChange(e, updateComment, comment);

  return (
    <div className="comment form">
      <form onSubmit={handleSubmit}>
        <div className="ui input">
          <input
            onChange={handleCommentChange}
            style={{ marginBottom: "5px" }}
            value={comment}
          />
        </div>
        <div style={{ marginBottom: "20px" }}></div>
        <button className="ui blue labeled submit icon button">
          <i className="icon edit"></i> Edit Comment
        </button>
        <button onClick={handleCancelClick} className="ui button red">
          Cancel
        </button>
        {renderError()}
      </form>
    </div>
  );
};

export default EditCommentForm;
