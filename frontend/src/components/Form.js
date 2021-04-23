import { useDispatch, useSelector } from 'react-redux';
import { useState, useRef, useEffect } from 'react';
import ajaxForm from '../utils/ajaxForm';
import useRequestStatus from '../utils/customHooks/useRequestStatus';

const ArticleForm = ({
    formFields,
    initialValues,
    errorType,
    resourceType,
    actionCreator,
    apiUrl,
    resourceId,
    handleCancelClick,
}) => {
    //in some cases article will be accessed via re-routing with param in url
    const AjaxForm = new ajaxForm(resourceType);
    const dispatch = useDispatch();
    const [formValues, updateFormValues] = useState(initialValues);
    const formError = useSelector(
        (state) => state.entities[resourceType].errors[errorType]
    );
    const requestStatus = useSelector(
        (state) => state.entities[resourceType].status
    );

    const stateRef = useRef();
    stateRef.current = requestStatus;

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (requestStatus === 'idle') {
            e.preventDefault();
            if (formValues.tags) {
                formValues.tags = formValues.tags.trim().split(',');
            }
            dispatch(
                actionCreator({
                    //new or updated formValues
                    ...formValues,
                    //if param in url then add to apiUrl
                    apiUrl,
                    resourceId: resourceId || null,
                })
            );
        }
    };

    useRequestStatus(stateRef.current, null, null, resourceType);

    const handleFieldChange = (e) =>
        AjaxForm.handleFieldChange(e, updateFormValues, formValues);

    const renderError = () => AjaxForm.renderError(formError);

    //if user enters form following error or submission, update state accordingly
    const handleFocus = (e) =>
        AjaxForm.handleFocus(e, stateRef.current, dispatch);

    const renderFields = () => {
        return formFields.map(({ name, type, label, key }) => {
            //convert tags back to string for displaying
            if (name === 'tags' && Array.isArray(formValues[name])) {
                formValues[name] = formValues[name].join();
            }
            return (
                <div className="field" key={key}>
                    <label>{label}</label>
                    <div className="ui input">
                        <input
                            onChange={handleFieldChange}
                            onFocus={handleFocus}
                            name={name}
                            type={type}
                            value={formValues[name]}
                        />
                    </div>
                </div>
            );
        });
    };

    return (
        <div>
            {renderError()}
            <form
                onFocus={handleFocus}
                className="ui form"
                onSubmit={handleSubmit}
            >
                {renderFields()}
                <button className="ui button primary">Submit</button>
                <button
                    onClick={handleCancelClick}
                    className="ui button secondary"
                >
                    Cancel
                </button>
            </form>
        </div>
    );
};

export default ArticleForm;
