import {
    PENDING,
    FAILED,
    GET_ARTICLES_SUCCESS,
    EDIT_ARTICLE_SUCCESS,
    CREATE_COMMENT_SUCCESS,
    CREATE_ARTICLE_SUCCESS,
    DELETE_ARTICLE_SUCCESS,
    VOTE_ON_ARTICLE_SUCCESS,
    RESET_REQUEST_STATUS,
    DELETE_COMMENT_SUCCESS,
} from '../actions/types';

import getActionType from '../utils/getActionType';

const initialState = {
    byId: {},
    allIds: [],
    errors: {},
    status: 'idle',
    currentReqType: null,
};

const articleReducer = (state = initialState, action) => {
    const type = getActionType(action.type, 'articles');
    let comment, article, articleId, commentId, articles;
    switch (type) {
        case PENDING:
            return { ...state, status: 'pending', errors: {} };
        case FAILED:
            return {
                ...state,
                status: 'failed',
                errors: { [action.payload.errorType]: action.payload },
            };
        case `${RESET_REQUEST_STATUS}_articles`:
            return {
                ...state,
                status: 'idle',
                errors: {},
                currentReqType: null,
            };
        case GET_ARTICLES_SUCCESS:
            articles = action.payload.articles;
            if (articles) {
                return {
                    ...state,
                    byId: { ...state.byId, ...articles },
                    allIds: [...state.allIds, ...Object.keys(articles)],
                    status: 'success',
                    currentReqType: 'GET_ARTICLES',
                    errors: {},
                };
            } else return { ...state, status: 'idle' };
        case CREATE_ARTICLE_SUCCESS:
            article = action.payload;
            return {
                ...state,
                byId: { ...state.byId, [article._id]: article },
                allIds: [...state.allIds, article._id],
                status: 'success',
                errors: {},
            };
        case DELETE_ARTICLE_SUCCESS:
            article = action.payload;
            articleId = article._id;
            const newArticlesById = { ...state.byId };
            delete newArticlesById[articleId];
            const newarticleIdsArray = state.allIds.filter(
                (id) => id !== articleId
            );
            return {
                ...state,
                allIds: newarticleIdsArray,
                byId: newArticlesById,
                status: 'success',
                errors: {},
            };
        case EDIT_ARTICLE_SUCCESS:
            article =
                action.payload.articles[
                    Object.keys(action.payload.articles)[0]
                ];
            articleId = article._id;
            return {
                ...state,
                byId: { ...state.byId, [articleId]: article },
                status: 'success',
                currentReqType: 'EDIT_ARTICLE',
                errors: {},
            };
        case CREATE_COMMENT_SUCCESS:
            comment = action.payload;
            articleId = comment.articleId;
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [articleId]: {
                        ...state.byId[articleId],
                        comments: [
                            ...state.byId[articleId].comments,
                            comment._id,
                        ],
                    },
                },
            };
        case DELETE_COMMENT_SUCCESS:
            articleId = action.payload.articleId;
            commentId = action.payload._id;
            const commentIds = state.byId[articleId].comments;
            const newCommentIds = commentIds.filter((el) => el !== commentId);
            return {
                ...state,
                byId: {
                    ...state.byId,
                    [articleId]: {
                        ...state.byId[articleId],
                        comments: newCommentIds,
                    },
                },
            };
        default:
            return state;
    }
};

export default articleReducer;
