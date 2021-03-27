import { createArticle } from "../../actions";
import Form from "../Form";
import articleFormFields from "./articleFormFields";
import history from "../../history";

const createFieldsObject = (articleFormFields) => {
  const formFieldValues = {};

  articleFormFields.forEach((fieldObj) => {
    formFieldValues[fieldObj.name] = "";
  });
  return formFieldValues;
};

const initialValues = createFieldsObject(articleFormFields);

const CreateArticleForm = () => (
  <Form
    formFields={articleFormFields}
    initialValues={initialValues}
    errorType="CREATE_ARTICLE_ERROR"
    resourceType="articles"
    actionCreator={createArticle}
    apiUrl="/articles"
    handleCancelClick={() => history.push("/")}
  />
);

export default CreateArticleForm;
