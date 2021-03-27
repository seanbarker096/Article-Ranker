import isEmail from "../utils/isEmail";
// eslint-disable-next-line import/no-anonymous-default-export
export default (formValues) => {
  const errors = {};
  Object.keys(formValues).forEach((key) => {
    if (!formValues[key]) {
      errors[key] = "You must provide a value";
    }
  });
  if (formValues.email && !isEmail(formValues.email))
    errors.email = "Please provide a valid email";
  return errors;
};
