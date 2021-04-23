import React, { useEffect, useState, useCallback, useRef } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import Comment from './Comment';
import CreateCommentForm from './CreateCommentForm';
import { deleteComment } from '../../actions';
import useRequestStatus from '../../utils/customHooks/useRequestStatus';

const CommentList = ({ articleId }) => {
    const dispatch = useDispatch();
    const commentStateRef = useRef();
    const reqStatusStateRef = useRef();
    const comments = useSelector(
        (state) => state.entities.articleCommentsUser[articleId].comments
    );
    const [createCommentClicked, registerCreateClick] = useState(false);

    //optmized delete comment code
    //////////////////////////////////////////////////
    const deleteCommentReqStatus = useSelector(
        (state) => state.entities.comments.status
    );
    const deleteCommentErr = useSelector(
        (state) => state.entities.comments.errors.DELETE_COMMENT_ERROR
    );
    const [commentToDelete, registerDeleteClick] = useState({
        clicked: false,
        id: null,
    });
    //ensures we pass up to date values into our useEffects
    commentStateRef.current = commentToDelete;
    reqStatusStateRef.current = deleteCommentReqStatus;

    useEffect(() => {
        if (
            deleteCommentReqStatus === 'idle' &&
            commentStateRef.current.clicked
        ) {
            dispatch(deleteComment({ resourceId: commentStateRef.current.id }));
            registerDeleteClick({ clicked: false, id: null });
        }
    }, [
        commentToDelete,
        deleteCommentReqStatus,
        dispatch,
        registerDeleteClick,
    ]);

    //cant include dispatch here as would need to include deleteCommentReqStatus
    //too to ensure "idle". This would create new func for all comments
    //cuasing them to re-render
    const memoizedHandleDeleteClick = useCallback(
        (event, commentId) => {
            event.preventDefault();
            registerDeleteClick({ clicked: true, id: commentId });
        },
        [registerDeleteClick]
    );
    //end of optimised delete comment handling code
    ///////////////////////////////////////

    useRequestStatus(reqStatusStateRef.current, null, null, 'comments', null);

    const renderComments = () => {
        if (comments) {
            return Object.values(comments).map((comment) => {
                let error;
                //if error related to this comment sent to child as prop so re-renders
                if (
                    deleteCommentErr &&
                    deleteCommentErr.resourceId === comment._id
                ) {
                    error = deleteCommentErr;
                } else {
                    error = null;
                }
                return (
                    <Comment
                        key={comment._id}
                        onDeleteClick={memoizedHandleDeleteClick}
                        //pass error into child to prevent need to subscribe comment to store
                        error={error}
                        {...comment}
                    />
                );
            });
        }
        return null;
    };

    return (
        <div>
            <div>{renderComments()}</div>
            <div style={{ marginTop: '20px' }}>
                {!createCommentClicked ? (
                    <button
                        href=""
                        className="ui basic button comment_addCommentButton"
                        onClick={(e) => {
                            e.stopPropagation();
                            registerCreateClick(true);
                        }}
                    >
                        Add Comment
                    </button>
                ) : null}
                {createCommentClicked ? (
                    <CreateCommentForm
                        articleId={articleId}
                        onCreateSuccess={() => registerCreateClick(false)}
                        handleCancelClick={() => registerCreateClick(false)}
                    />
                ) : null}
            </div>
        </div>
    );
};

export default React.memo(CommentList);
