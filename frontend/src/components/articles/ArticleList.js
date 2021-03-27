import React, { useEffect, useRef, useCallback } from "react";
import { useSelector, useDispatch } from "react-redux";

import { getArticles, deleteArticle, getArticlesVotes } from "../../actions";
import {
  articleApiReqStatusSelector,
  voteApiReqStatusSelector,
  voteErrorSelector,
} from "../../selectors";
import Article from "./Article";
import ajaxForm from "../../utils/ajaxForm";
import useRequestStatus from "../../utils/customHooks/useRequestStatus";

const AjaxForm = new ajaxForm("articles");

const ArticleList = (props) => {
  const dispatch = useDispatch();
  const articlesApiReqStatus = useSelector((state) =>
    articleApiReqStatusSelector(state)
  );
  const articleVotesApiReqStatus = useSelector((state) =>
    voteApiReqStatusSelector(state, "articles")
  );
  const articles = useSelector((state) => state.entities.articles.byId);
  const getArticlesError = useSelector(
    (state) => state.entities.articles.errors.GET_ARTICLES_ERROR
  );
  const getArticleVotesError = useSelector((state) =>
    voteErrorSelector(state, "GET_ARTICLE_VOTES_ERROR", "articles")
  );
  const deleteArticleError = useSelector(
    (state) => state.entities.articles.errors.DELETE_ARTICLE_ERROR
  );

  const getArticlesApiState = useRef();
  const articleVoteApiState = useRef();
  const articlesStateRef = useRef();
  getArticlesApiState.current = articlesApiReqStatus;
  articleVoteApiState.current = articleVotesApiReqStatus;
  articlesStateRef.current = articles;

  useRequestStatus(getArticlesApiState.current, null, null, "articles");
  useRequestStatus(articleVoteApiState.current, null, null, "articlesVotes");

  useEffect(() => {
    dispatch(getArticles());
  }, [dispatch]);

  //get votes once articles have been fetched and added to store
  useEffect(() => {
    const articleIds =
      Object.keys(articlesStateRef.current).length !== 0
        ? Object.keys(articlesStateRef.current)
        : null;
    if (articleIds) {
      dispatch(getArticlesVotes({ resourceType: "articles", ids: articleIds }));
    }
  }, [dispatch, articles]);

  const handleDeleteButtonClick = useCallback(
    (e, articleId) => {
      e.stopPropagation();
      dispatch(deleteArticle({ resourceId: articleId }));
    },
    [dispatch]
  );

  const renderGetArticleError = () => AjaxForm.renderError(getArticlesError);
  const renderGetArticleVotesError = () =>
    AjaxForm.renderError(getArticleVotesError);

  const renderArticles = () => {
    return Object.values(articles).map((article) => {
      return (
        <Article
          articleId={article._id}
          key={article._id}
          handleDeleteButtonClick={handleDeleteButtonClick}
          deleteArticleError={deleteArticleError}
          {...article}
        />
      );
    });
  };

  return (
    <>
      {renderGetArticleError()}
      {renderGetArticleVotesError()}
      <div className="ui divided items">{renderArticles()}</div>
    </>
  );
};

export default ArticleList;
