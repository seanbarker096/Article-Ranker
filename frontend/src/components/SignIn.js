import { useDispatch, useSelector } from 'react-redux';
import { useRef } from 'react';
import createReduxForm from './createReduxForm';
import { signIn, getUser } from '../actions';
import { reset } from 'redux-form';
import { unwrapResult } from '@reduxjs/toolkit';

import { RESET_REQUEST_STATUS } from '../actions/types';
import ajaxForm from '../utils/ajaxForm';
import useRequestStatus from '../utils/customHooks/useRequestStatus';

const AjaxForm = new ajaxForm('users', signIn);

let SignIn = () => {
    const dispatch = useDispatch();
    const reqStatus = useSelector((state) => state.entities.users.status);
    const signInError = useSelector(
        (state) => state.entities.users.errors.SIGN_IN_ERROR
    );
    const stateRef = useRef();
    stateRef.current = reqStatus;

    const onFormSubmit = async (formValues) => {
        if (reqStatus === 'idle') {
            //await sign in before getting user if it was successful
            const res = await dispatch(signIn(formValues));
            try {
                //unwrapResult will throw error if promise was rejected
                unwrapResult(res);
                //will reach here if request was successful
                dispatch(getUser());
            } catch (err) {
                //do nothing. Failure is handled by our createAsyncThunk which dispatches rejected action to store
                console.log(err);
            }
        }
    };

    //passed down to custom hook and runs if sign in succesful
    const resetForm = async () => {
        //clear redux form
        dispatch(reset('signIn'));
    };
    useRequestStatus(stateRef.current, null, null, 'users', resetForm);

    const renderError = () => AjaxForm.renderError(signInError);
    const initialVals = {
        email: '',
        password: '',
    };

    const signInFields = [
        {
            name: 'email',
            key: 'email',
            type: 'email',
            label: 'E-mail',
        },
        {
            name: 'password',
            key: 'password',
            type: 'password',
            label: 'Password',
        },
    ];

    //if user enters form following error or submission, update state accordingly
    let SignInForm = createReduxForm(
        onFormSubmit,
        null,
        'signIn',
        initialVals,
        signInFields
    );
    return (
        <div>
            <h2 className="ui center aligned icon header">
                <i className="circular user icon"></i>
                Sign In
            </h2>
            {renderError(signInError)}
            <SignInForm />
            <div className="ui horizontal divider">OR</div>
            <h2 className="ui center aligned icon header">
                <i className="circular google icon"></i>
                <a href="api/v1/auth/google" className="ui button black">
                    "Sign In With Google"
                </a>
            </h2>
        </div>
    );
};

export default SignIn;
