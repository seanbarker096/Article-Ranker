import { useSelector, useDispatch } from "react-redux";

import { editArticle, getArticle } from "../../actions";
import Form from "../Form";
import useRequestStatus from "../../utils/customHooks/useRequestStatus";
import articleFormFields from "./articleFormFields";
import {
  articleSelector,
  articleApiReqStatusSelector,
  articleApiReqTypeSelector,
} from "../../selectors";
import { useEffect } from "react";
import history from "../../history";

const formFieldNames = [];

articleFormFields.forEach((fieldObj) => {
  formFieldNames.push(fieldObj.name);
});

const EditArticleForm = (props) => {
  const dispatch = useDispatch();
  const resourceId = props.match.params.id;
  const articleApiReqStatus = useSelector((state) =>
    articleApiReqStatusSelector(state)
  );
  const articleApiReqType = useSelector((state) =>
    articleApiReqTypeSelector(state)
  );
  const article = useSelector((state) => articleSelector(state, resourceId));
  useEffect(() => {
    //get article when component mounts
    dispatch(getArticle({ apiUrl: `/articles/${resourceId}`, resourceId }));
  }, [resourceId, dispatch]);

  useEffect(() => {
    if (
      articleApiReqStatus === "success" &&
      articleApiReqType === "EDIT_ARTICLE"
    ) {
      history.push("/");
    }
  }, [articleApiReqStatus, articleApiReqType]);

  useRequestStatus(articleApiReqStatus, null, null, "articles");

  const initialValues = {};

  const renderArticle = () => {
    if (article) {
      Object.keys(article).forEach((key) => {
        if (formFieldNames.includes(key)) {
          initialValues[key] = article[key];
        }
      });
      return (
        <Form
          formFields={articleFormFields}
          initialValues={initialValues}
          errorType="EDIT_ARTICLE_ERROR"
          resourceType="articles"
          actionCreator={editArticle}
          apiUrl={`/articles/${resourceId}`}
          handleCancelClick={() => history.push("/")}
        />
      );
    } else return "Loading...";
  };
  //return child component
  return <div>{renderArticle()}</div>;
};

export default EditArticleForm;
