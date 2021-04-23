import { createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../services/axios';
import createAxios from '../services/createAxios';
import history from '../history';
import normalize from '../utils/normalize';
import {
    deleteOne,
    createOne,
    editOne,
    getOne,
    getMany,
    vote,
    getVotes,
} from './actionFactory';

const storeCsrf = async (res) => {
    localStorage.setItem('csrf-token', res.headers['csrf-token']);
};
///////////////////////////// USER ACTIONS  /////////////////////////////////
export const signIn = createAsyncThunk(
    'users/signIn',
    async (formValues, thunkAPI) => {
        try {
            //get up to date axios isntance with csrf header before making post req
            const axios = createAxios();
            const res = await axios.post('/auth/signin', formValues);
            //call get user in case they are using oAuth
            history.push('/');
            return res.data.data.user;
        } catch (err) {
            console.log('signIn error:', err.response.data);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType: 'SIGN_IN_ERROR',
            });
        }
    }
);

export const signUp = createAsyncThunk(
    'users/signUp',
    async (formValues, thunkAPI) => {
        try {
            const axios = createAxios();
            const res = await axios.post('/auth/signup', formValues);
            //call get user in case they are using oAuth
            history.push('/');
            return res.data.data.user;
        } catch (err) {
            console.log('signUp error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType: 'SIGN_UP_ERROR',
            });
        }
    }
);

export const signOut = createAsyncThunk(
    'users/signOut',
    async (args, thunkAPI) => {
        //cant modify httpOnly cookies so need to make request to backend
        try {
            const res = await axios.get('/auth/signout');
            //clear redux store of user state
            history.push('/signin');
            return res;
        } catch (err) {
            console.log('signOut error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType: 'SIGN_OUT_ERROR',
            });
        }
    }
);

export const refreshJWT = createAsyncThunk(
    'auth/refreshJWT',
    async (args, thunkAPI) => {
        try {
            const res = await axios.get('/auth/refresh-token');
            return res.data;
        } catch (err) {
            console.log('refreshJWT error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType: 'JWT_REFRESH_ERROR',
            });
        }
    }
);

export const getCsrfToken = createAsyncThunk(
    'auth/getCsrfToken',
    async (args, thunkAPI) => {
        try {
            const res = await axios.get('/auth/csrf-token');
            storeCsrf(res);
            return null;
        } catch (err) {
            console.log('refreshJWT error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType: 'GET_CSRF_TOKEN_ERROR',
            });
        }
    }
);

/////////////////////////// USER ACTIONS ///////////////////////////////
export const getUser = createAsyncThunk(
    'users/getUser',
    async (args, thunkAPI) => {
        //jwt tokens attached to request will allow us to get the right user
        try {
            const response = await axios.get('/users/me');
            return response.data.data.user;
        } catch (err) {
            console.log('/getUser error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType: 'GET_USER_ERROR',
            });
        }
    }
);

export const getUserAnalytics = createAsyncThunk(
    'users/getAnalytics',
    async (args, thunkAPI) => {
        const { userId } = args;
        try {
            //get user stats
            // const userStats = (await axios.get(`users/${userId}/stats`)).data.data
            //   .userStats;
            const userActivity = (await axios.get(`users/${userId}/activity`))
                .data.data.userActivity;
            return { userActivity, requestType: 'GET_USER_ANALYTICS' };
        } catch (err) {
            console.log('Get user analytics error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType: 'GET_USER_ANALYTICS_ERROR',
            });
        }
    }
);

export const editUser = editOne(
    'users/editUser',
    'users',
    'EDIT_USER_ERROR',
    null,
    false
);
/////////////////////////// ARTICLE ACTIONS ////////////////////////////
export const getArticles = createAsyncThunk(
    'articles/getArticles',
    async (args, thunkAPI) => {
        try {
            let res = await axios.get('/articles');
            res = res.data.data.docs;
            const normalizedRes = normalize(res, 'articles');
            //normalized data distributed to all action creators to handle their respective parts
            return normalizedRes.entities;
        } catch (err) {
            console.log('Get Articles error', err);
            return thunkAPI.rejectWithValue({
                ...err.repsonse.data,
                errorType: 'GET_ARTICLES_ERROR',
            });
        }
    }
);

export const getArticle = getOne(
    //use getArticles here so we use our already made getArticles reducers
    'articles/getArticles',
    'articles',
    'GET_ARTICLE_ERROR',
    null,
    true
);

export const createArticle = createOne(
    'articles/createArticle',
    'CREATE_ARTICLE_ERROR',
    '/'
);

export const deleteArticle = deleteOne(
    'articles/deleteArticle',
    'articles',
    'DELETE_ARTICLE_ERROR',
    true
);

export const editArticle = editOne(
    'articles/editArticle',
    'articles',
    'EDIT_ARTICLE_ERROR',
    null,
    true
);

/////////////////////////// COMMENT ACTIONS ////////////////////////////

export const createComment = createOne(
    'comments/createComment',
    'CREATE_COMMENT_ERROR'
);

export const editComment = editOne(
    'comments/editComment',
    'comments',
    'EDIT_COMMENT_ERROR'
);

export const deleteComment = deleteOne(
    'comments/deleteComment',
    'comments',
    'DELETE_COMMENT_ERROR',
    true
);

///////////////////////// VOTE ACTIONS /////////////////////////////////

export const voteOnArticle = vote(
    'articlesVotes/voteOnArticle',
    'VOTE_ON_ARTICLE_ERROR'
);
export const voteOnComment = vote(
    'commentsVotes/voteOnComment',
    'VOTE_ON_COMMENT_ERROR'
);
export const getArticlesVotes = getVotes(
    'articlesVotes/getArticlesVotes',
    'GET_ARTICLE_VOTES_ERROR'
);

export const getCommentsVotes = getVotes(
    'commentsVotes/getCommentsVotes',
    'GET_COMMENT_VOTES_ERROR'
);
