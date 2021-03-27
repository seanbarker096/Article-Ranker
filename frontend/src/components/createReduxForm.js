/* eslint-disable import/no-anonymous-default-export */
import { Field, reduxForm } from "redux-form";
import formField from "./formField";
import validate from "../utils/formValidation";

const createReduxForm = (
  onSubmitCallback,
  onFocusCallback,
  formName,
  initialValues = {},
  formFields,
  submitButtonText = "Submit"
) => {
  let authForm = (props) => {
    //handleSubmit prop coming from Redux Form. onFormSubmit is our custom handler
    const { handleSubmit } = props;

    const renderFields = (formFields) => {
      return formFields.map(({ name, type, label, key }) => (
        <div className="field" key={key}>
          <label>{label}</label>
          <Field name={name} type={type} component={formField} />
        </div>
      ));
    };

    return (
      <form
        onFocus={onFocusCallback}
        onSubmit={handleSubmit(onSubmitCallback)}
        className="ui form error"
      >
        {renderFields(formFields)}
        <button type="submit" className="ui submit button">
          {submitButtonText}
        </button>
      </form>
    );
  };

  return reduxForm({
    validate,
    form: formName,
    destroyOnUnmount: false,
    initialValues,
  })(authForm);
};

export default createReduxForm;
