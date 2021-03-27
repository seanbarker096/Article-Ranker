import { useDispatch, useSelector } from 'react-redux';
import React, { useState, useCallback } from 'react';

import CommentList from '../comments/CommentList';
import OwnerContent from '../OwnerContent';
import ajaxForm from '../../utils/ajaxForm';
import history from '../../history';
import VoteButtons from '../VoteButtons';
import { voteOnArticle } from '../../actions';
import {
    articleErrorSelector,
    articleApiReqStatusSelector,
} from '../../selectors';

import useRequestStatus from '../../utils/customHooks/useRequestStatus';

const AjaxForm = new ajaxForm('articles');

const Article = ({
    tags,
    title,
    author,
    description,
    articleId,
    owner,
    handleDeleteButtonClick,
    deleteArticleError,
}) => {
    // console.log(articleId);
    const dispatch = useDispatch();
    const [voteError, setVoteError] = useState(null);
    //second arg ensures only renders if error associated with this article
    // const voteError = useSelector((state) =>
    //   articleErrorSelector(state, "VOTE_ON_ARTICLE_ERROR")
    // );
    // const artilceVoteApiReqStatus = useSelector((state) =>
    //   articleApiReqStatusSelector(state)
    // );
    const renderError = () =>
        AjaxForm.renderError(deleteArticleError || voteError, articleId);

    // useRequestStatus(artilceVoteApiReqStatus, null, null, "articles");

    const renderTags = () => {
        return tags.map((tag) => {
            return (
                <div key={tag} className="ui label">
                    {tag}
                </div>
            );
        });
    };

    const handleVoteError = (error) => {
        setVoteError(error);
    };

    const handleEditButtonClick = function () {
        history.push(`/articles/${articleId}/edit`);
    };

    return (
        <div className="ui segment">
            <h2 className="ui left floated header">{title}</h2>
            <div className="ui right floated primary button">
                View full article
                <i className="right chevron icon"></i>
            </div>
            <div className="ui clearing divider"></div>
            <div className="item">
                <div className="image">
                    <i className="ui newspaper outline icon huge" />
                </div>
                <div className="content">
                    <VoteButtons
                        onSubmitActionCreator={voteOnArticle}
                        parentResourceType="articles"
                        parentId={articleId}
                        errorType={'VOTE_ON_ARTICLE_ERROR'}
                        handleVoteError={handleVoteError}
                    />
                    <div className="meta">
                        <span className="author">{author}</span>
                    </div>
                    <div className="description">
                        <p>{description}</p>
                    </div>
                    <div className="extra">{renderTags()}</div>
                </div>
                <div className="ui comments">
                    <h3 className="ui grey header">Comments</h3>
                    <CommentList articleId={articleId} />
                </div>
                {renderError()}
                <OwnerContent ownerId={owner._id}>
                    <div className="owner-options inline">
                        <button
                            className="ui button red"
                            onClick={(e) =>
                                handleDeleteButtonClick(e, articleId)
                            }
                        >
                            Delete
                        </button>
                        <button
                            className="ui button"
                            onClick={(e) => handleEditButtonClick(e, articleId)}
                        >
                            Edit
                        </button>
                    </div>
                </OwnerContent>
            </div>
        </div>
    );
};

export default React.memo(Article);
