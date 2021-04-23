import {
    voteErrorSelector,
    voteApiReqStatusSelector,
    voteSelector,
} from '../selectors';

import useRequestStatus from '../utils/customHooks/useRequestStatus';
import { useDispatch, useSelector } from 'react-redux';
import { useEffect, useRef } from 'react';

const VoteButtons = ({
    onSubmitActionCreator,
    parentResourceType,
    parentId,
    errorType,
    handleVoteError,
}) => {
    const dispatch = useDispatch();
    const voteError = useSelector((state) =>
        voteErrorSelector(state, errorType, parentResourceType, parentId)
    );
    const voteApiReqStatus = useSelector((state) =>
        voteApiReqStatusSelector(state, parentResourceType, parentId)
    );
    const votes = useSelector((state) =>
        voteSelector(state, parentResourceType, parentId)
    );
    const stateRef = useRef();
    stateRef.current = voteError;

    const voteSum = votes ? votes.voteSum : 0;
    useEffect(() => {
        handleVoteError(stateRef.current);
    }, [handleVoteError, parentId, voteError]);

    //still causing re-render
    useRequestStatus(
        voteApiReqStatus,
        null,
        null,
        `${parentResourceType}Votes`
    );

    const handleVoteButtonClick = function (e) {
        if (e.target.id === 'sum') return;
        if (voteApiReqStatus === 'idle') {
            let voteCode;
            let voteType;
            if (e.target.id === 'upVote') {
                voteCode = 1;
                voteType = 'upVote';
            } else if (e.target.id === 'downVote') {
                voteCode = 2;
                voteType = 'downVote';
            }
            dispatch(
                onSubmitActionCreator({
                    apiUrl: `/${parentResourceType}/${parentId}/votes/${voteCode}`,
                    voteType,
                    resourceId: parentId,
                })
            );
        }
    };

    return (
        <>
            <div
                onClick={(e) => handleVoteButtonClick(e)}
                className="voteButtons"
            >
                <span className="voteButton_voteSum" id="sum">
                    {voteSum}
                </span>
                <button
                    style={{ marginBottom: 5 }}
                    className="ui mini icon button voteButton"
                    id="upVote"
                >
                    <i className="angle up icon" id="upVote"></i>
                </button>
                <button
                    className="mini ui icon button voteButton"
                    id="downVote"
                >
                    <i className="angle down icon" id="downVote"></i>
                </button>
            </div>
        </>
    );
};

export default VoteButtons;
