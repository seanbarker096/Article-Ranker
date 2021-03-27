import { PENDING, FAILED } from "../actions/types";

export default (type, resource) => {
  if (type.includes("pending") && type.includes(`${resource}/`)) {
    return PENDING;
  } else if (type.includes("rejected") && type.includes(`${resource}/`)) {
    return FAILED;
  } else return type;
};
