export const GET_USER_SUCCESS = "users/getUser/fulfilled";

//Article actions
export const GET_ARTICLES_SUCCESS = "articles/getArticles/fulfilled";
export const GET_ARTICLE_COMMENTS = "GET_ARTICLE_COMMENTS";
export const GET_COMMENTS_BY_ARTICLEID = "GET_COMMENTS_BY_ARTICLE_ID";
export const CREATE_ARTICLE_SUCCESS = "articles/createArticle/fulfilled";
export const DELETE_ARTICLE_SUCCESS = "articles/deleteArticle/fulfilled";
export const GET_ARTICLE_SUCCESS = "articles/getArticle/fulfilled";
export const EDIT_ARTICLE_SUCCESS = "articles/editArticle/fulfilled";

//comment actions
export const CREATE_COMMENT_SUCCESS = "comments/createComment/fulfilled";
export const EDIT_COMMENT_SUCCESS = "comments/editComment/fulfilled";
export const DELETE_COMMENT_SUCCESS = "comments/deleteComment/fulfilled";

//auth actions
export const REFRESH_JWT_SUCCESS = "auth/refreshJWT/fulfilled";

//user actions
export const SIGN_IN_SUCCESS = "users/signIn/fulfilled";
export const SIGN_UP_SUCCESS = "users/signUp/fulfilled";
export const SIGN_OUT_SUCCESS = "users/signOut/fulfilled";
export const GET_USER_ANALYTICS_SUCCESS = "users/getAnalytics/fulfilled";
export const EDIT_USER_SUCCESS = "users/editUser/fulfilled";

//vote actions
export const VOTE_ON_ARTICLE_SUCCESS = "articlesVotes/voteOnArticle/fulfilled";
export const VOTE_ON_COMMENT_SUCCESS = "commentsVotes/voteOnComment/fulfilled";
export const GET_ARTICLES_VOTES_SUCCESS =
  "articlesVotes/getArticlesVotes/fulfilled";
export const GET_COMMENTS_VOTES_SUCCESS =
  "commentsVotes/getCommentsVotes/fulfilled";

//generic
export const RESET_REQUEST_STATUS = "RESET_REQUEST_STATUS";
export const PENDING = "PENDING";
export const FAILED = "FAILED";
