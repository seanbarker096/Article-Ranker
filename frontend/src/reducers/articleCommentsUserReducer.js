/* eslint-disable import/no-anonymous-default-export */
import {
  GET_ARTICLES_SUCCESS,
  CREATE_COMMENT_SUCCESS,
  CREATE_ARTICLE_SUCCESS,
  EDIT_ARTICLE_SUCCESS,
  VOTE_ON_ARTICLE_SUCCESS,
  EDIT_COMMENT_SUCCESS,
  DELETE_COMMENT_SUCCESS,
  DELETE_ARTICLE_SUCCESS,
} from "../actions/types";
const initialState = {};

const getCommentsByArticleIds = (comments) => {
  let commentObj = {};
  Object.values(comments).forEach((comment) => {
    commentObj = {
      ...commentObj,
      [comment.articleId]: {
        ...commentObj[comment.articleId],
        [comment._id]: comment,
      },
    };
  });
  return commentObj;
};

const nestChildrenInParent = (articles, comments) => {
  let commentsById;
  if (comments) {
    commentsById = getCommentsByArticleIds(comments);
  } else commentsById = {};
  let populatedArticles = {};
  Object.values(articles).forEach((article) => {
    populatedArticles = {
      ...populatedArticles,
      [article._id]: {
        _id: article._id,
        comments: commentsById[article._id] || null,
      },
    };
  });
  return populatedArticles;
};
//when get first get multiple articles we normalize the nested data and store in each
//slice of state for easy acess to each resource elsewhere. However, for requests
//concerning single resources dont need to normalize anywhere
export default (state = initialState, action) => {
  let comment,
    article,
    articleId,
    commentId,
    comments,
    articles,
    users,
    user,
    populatedArticles,
    populatedArticle;
  switch (action.type) {
    case GET_ARTICLES_SUCCESS:
      articles = action.payload.articles;
      comments = action.payload.comments;
      // users = action.payload.users;
      //if articles are in database then populate them. Else return state
      if (articles) {
        populatedArticles = nestChildrenInParent(articles, comments);
        return { ...state, ...populatedArticles };
      } else return state;
    case CREATE_ARTICLE_SUCCESS:
      article = action.payload;
      return { ...state, [article._id]: article };
    case DELETE_ARTICLE_SUCCESS:
      articleId = action.payload._id;
      const newArticlesObj = { ...state };
      delete newArticlesObj[articleId];
      return newArticlesObj;
    case EDIT_ARTICLE_SUCCESS:
      const articlesObj = action.payload.articles;
      articleId =
        action.payload.articles[Object.keys(action.payload.articles)[0]]._id;
      comments = action.payload.comments;
      user = action.payload.users;
      populatedArticle = nestChildrenInParent(articlesObj, comments, user);
      return { ...state, [articleId]: populatedArticle };
    case CREATE_COMMENT_SUCCESS:
      articleId = action.payload.articleId;
      comment = action.payload;
      return {
        ...state,
        [articleId]: {
          ...state[articleId],
          comments: { ...state[articleId].comments, [comment._id]: comment },
        },
      };
    case EDIT_COMMENT_SUCCESS:
      comment = action.payload;
      articleId = action.payload.articleId;
      commentId = comment._id;
      return {
        ...state,
        [articleId]: {
          ...state[articleId],
          comments: { ...state[articleId].comments, [commentId]: comment },
        },
      };
    case DELETE_COMMENT_SUCCESS:
      comment = action.payload;
      commentId = comment._id;
      articleId = comment.articleId;
      const articleComments = { ...state[articleId].comments };
      delete articleComments[commentId];
      return {
        ...state,
        [articleId]: { ...state[articleId], comments: articleComments },
      };
    default:
      return state;
  }
};
