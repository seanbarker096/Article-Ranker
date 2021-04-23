import { createAsyncThunk } from '@reduxjs/toolkit';

import axios from '../services/axios';
import createAxios from '../services/createAxios';
import history from '../history';
import normalizer from '../utils/normalize';

//;returns most recent axios object to ensure has up to date csrf token

const normalizeResponse = (data, resourceType) => {
    const normalizedRes = normalizer(data, resourceType);
    //normalized data distributed to all action creators to handle their respective parts
    return normalizedRes.entities;
};

const createQueryUrl = (originalUrl, queryObj) => {
    const queryParamsStr = new URLSearchParams(queryObj).toString();
    return `${originalUrl}?${queryParamsStr}`;
};

export const deleteOne = (
    actionType,
    resourceType,
    errorType,
    includeResourceIdInErr,
    pushUrl
) =>
    createAsyncThunk(actionType, async (args, thunkAPI) => {
        //create axios instance with up to date csrf header
        const axios = createAxios();
        const { resourceId } = args;
        try {
            const res = await axios.delete(`/${resourceType}/${resourceId}`);
            //return doc so can remove from state
            if (pushUrl) {
                history.push(pushUrl);
            }
            return res.data.data.doc;
        } catch (err) {
            console.log('Delete resource error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType,
                resourceId: resourceId,
            });
        }
    });

export const createOne = (actionType, errorType, pushUrl) =>
    createAsyncThunk(actionType, async (values, thunkAPI) => {
        const axios = createAxios();
        const { apiUrl, resourceId, ...newResourceValues } = values;
        try {
            const res = await axios.post(apiUrl, newResourceValues);
            if (pushUrl) {
                history.push(pushUrl);
            }
            //if the promise resolved successfully, dispatch the fulfilled action
            ///with the promise value as action.payload. Res will contain a fulfilled promise containing the final dispatched
            // action (either the fulfilled or rejected action object)
            return res.data.data.doc;
        } catch (err) {
            //return a rejected response with a defined payload. It will
            //return the argument in the payload of the rejected action.
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType,
                resourceId,
            });
        }
    });

export const editOne = (
    actionType,
    resourceType,
    errorType,
    pushUrl,
    normalize
) =>
    createAsyncThunk(actionType, async (args, thunkAPI) => {
        const axios = createAxios();
        const { apiUrl, resourceId, ...newResourceVals } = args;
        try {
            const res = await axios.patch(apiUrl, newResourceVals);
            if (pushUrl) {
                history.push(pushUrl);
            }
            if (normalize) {
                return normalizeResponse(res.data.data.doc, resourceType);
            }
            return res.data.data.doc;
        } catch (err) {
            console.log('Edit resource error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType,
                resourceId,
            });
        }
    });

export const getOne = (
    actionType,
    resourceType,
    errorType,
    pushUrl,
    normalize
) =>
    createAsyncThunk(actionType, async (args, thunkAPI) => {
        const { apiUrl, resourceId } = args;
        let normalizedRes;
        try {
            const res = await axios.get(apiUrl);
            if (pushUrl) {
                history.push(pushUrl);
            }
            if (normalize) {
                normalizedRes = normalizer(res.data.data.doc, resourceType);
                //normalized data distributed to all action creators to handle their respective parts
                return normalizedRes.entities;
            }
            return res.data.data.doc;
        } catch (err) {
            console.log('Get resource error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType,
                resourceId,
            });
        }
    });

export const getMany = (
    actionType,
    resourceType,
    errorType,
    pushUrl,
    normalize
) =>
    createAsyncThunk(actionType, async (args, thunkAPI) => {
        const { apiUrl, queryOptions } = args;
        let normalizedRes;
        if (queryOptions) {
            //for operators e.g. greater than should be in format "variable[gt]=4"
            apiUrl = createQueryUrl(apiUrl, queryOptions);
        }
        try {
            const res = await axios.get(apiUrl);
            if (pushUrl) {
                history.push(pushUrl);
            }
            if (normalize) {
                normalizedRes = normalizer(res.data.data.doc, resourceType);
                //normalized data distributed to all action creators to handle their respective parts
                return normalizedRes.entities;
            }
            return res.data.data.doc;
        } catch (err) {
            console.log('Get many error:', err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType,
            });
        }
    });

export const vote = (actionType, errorType) =>
    createAsyncThunk(actionType, async (args, thunkAPI) => {
        const axios = createAxios();
        const { apiUrl, voteType, resourceId } = args;
        try {
            const res = await axios.post(apiUrl);
            const { voterId, votersVote } = res;
            const voteDoc = res.data.data.doc;
            return { voteDoc, votersVote, voterId };
        } catch (err) {
            console.log(errorType, err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType,
                resourceId,
            });
        }
    });

export const getVotes = (actionType, errorType) =>
    createAsyncThunk(actionType, async (args, thunkAPI) => {
        try {
            const { resourceType, ids } = args;
            let apiUrl = `${resourceType}/votes?`;

            //create query string with article/comment ids
            ids.forEach((id) => {
                apiUrl = apiUrl.concat(`ids[]=${id}&`);
            });
            const res = (await axios.get(apiUrl)).data.data.docs;
            const normalizedRes = normalizeResponse(res, 'articlesVotes');
            //normalized data distributed to all action creators to handle their respective parts
            return normalizedRes;
        } catch (err) {
            console.log(errorType, err);
            return thunkAPI.rejectWithValue({
                ...err.response.data,
                errorType,
            });
        }
    });
