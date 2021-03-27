export const commentsSelectorSelector = (state) => state.entities.comments.byId;
export const commentOnArticleSelector = (state, articleId) =>
  state.entities.articleCommentUser[articleId].comments;
export const commentApiReqStatusSelector = (state) =>
  state.entities.comments.status;
export const commentErrSelector = (state, type) =>
  state.entities.comments.errors[type];

//article selectors
export const articleApiReqStatusSelector = (state) =>
  state.entities.articles.status;
export const articleSelector = (state, articleId) =>
  state.entities.articles.byId[articleId];
export const articleApiReqTypeSelector = (state) =>
  state.entities.articles.currentReqType;
export const articleErrorSelector = (state, type) =>
  state.entities.articles.errors[type];

//vote selectors
export const voteApiReqStatusSelector = (state, resourceType, resourceId) => {
  let status;
  if (resourceId) {
    status = state.entities.votes[`${resourceType}Votes`].status[resourceId];
  }
  //may be that no votes made, so no api status for a specific resource.
  //hence if status for resouceId undefined, return non-resource specific status
  if (!status) {
    return state.entities.votes[`${resourceType}Votes`].status;
  }
  return status;
};
export const voteErrorSelector = (
  state,
  errorType,
  resourceType,
  resourceId
) => {
  let errorObj;
  // console.log("error resourceid", resourceId);
  if (resourceId) {
    errorObj = state.entities.votes[`${resourceType}Votes`].errors[errorType];
    if (errorObj) {
      errorObj = errorObj[resourceId];
    }
    //error wont be associated with resource that tried to select error so return null
    if (!errorObj) return null;
  }
  return errorObj;
};
export const voteSelector = (state, resourceType, resourceId) =>
  state.entities.votes[`${resourceType}Votes`].byParentId[resourceId];

//user selectors
export const getUserSelector = (state) => state.entities.users.currentUser;
export const userApiReqStatusSelector = (state) => state.entities.users.status;
export const userAnalyticsApiReqStatusSelector = (state) =>
  state.entities.users.status["GET_USER_ANALYTICS"];
export const userAnalyticsDataSelector = (state) =>
  state.entities.users.currentUserAnalytics;
export const userApiErrorSelector = (state, errorType) =>
  state.entities.users.errors[errorType];
