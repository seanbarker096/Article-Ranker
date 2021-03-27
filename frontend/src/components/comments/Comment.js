/* eslint-disable jsx-a11y/anchor-is-valid */
import React, { useState } from "react";

import getDate from "../../utils/getDate";
import EditCommentForm from "./EditCommentForm";
import OwnerContent from "../OwnerContent";
import ajaxForm from "../../utils/ajaxForm";
import VoteButtons from "../VoteButtons";
import { voteOnComment } from "../../actions";

const AjaxForm = new ajaxForm("comments");

const Comment = (props) => {
  const { error, onDeleteClick } = props;
  const commentId = props._id;
  const [editCommentClick, setEditCommentClick] = useState(false);
  const [voteError, setVoteError] = useState(null);

  const date = getDate(props.dateWritten);
  //subscribe to changes of this comment in case comment is edited
  const handleEditSuccess = () => {
    //this ensures editCommentForm removed from DOM
    setEditCommentClick(false);
  };
  const handleCancelClick = (e) => {
    e.stopPropagation();
    setEditCommentClick(false);
  };

  const renderError = () => AjaxForm.renderError(error || voteError);

  if (editCommentClick) {
    return (
      <EditCommentForm
        commentId={commentId}
        commentText={props.commentText}
        onEditSuccess={handleEditSuccess}
        handleCancelClick={handleCancelClick}
      />
    );
  } else {
    return (
      <div style={{ marginBottom: 60 }} className="comment">
        <VoteButtons
          onSubmitActionCreator={voteOnComment}
          parentResourceType="comments"
          parentId={commentId}
          errorType={"VOTE_ON_COMMENT_ERROR"}
          handleVoteError={(voteButtonError) => setVoteError(voteButtonError)}
        />
        <a className="avatar">
          <img src="/images/avatar-1577909_1280.png" alt="user" />
        </a>
        <div className="content">
          <a className="author">{props.owner.name}</a>
          <div className="metadata">
            <span className="date">{date}</span>
          </div>
          <div className="text">{props.commentText}</div>
        </div>

        <OwnerContent ownerId={props.owner._id}>
          <div className="owner-options ui grid">
            <div className="column">
              <a
                onClick={(event) => setEditCommentClick(true)}
                style={{ color: "grey" }}
                className="item"
              >
                Edit
              </a>
            </div>
            <div className="column">
              <a
                onClick={(e) => onDeleteClick(e, commentId)}
                style={{ color: "grey" }}
                className="item"
              >
                Delete
              </a>
            </div>
          </div>
        </OwnerContent>
        {renderError()}
      </div>
    );
  }
};

export default React.memo(Comment);
