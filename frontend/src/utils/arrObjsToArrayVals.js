import errorsReducer from "../reducers/errorsReducer";

/* eslint-disable import/no-anonymous-default-export */
export default (arrOfObjs) => {
  if (!Array.isArray(arrOfObjs))
    throw Error(
      "arrObjsToArrayVals error: You must provide an array of objects as the input arguement"
    );
  if (arrOfObjs.length < 1)
    throw errorsReducer(
      "arrObjsToArrayVals error: Input array must have a length equal to more than zero"
    );
  const objOfArrs = {};
  //define object with key for each array
  for (let key in arrOfObjs[0]) {
    objOfArrs[key] = [];
  }
  arrOfObjs.forEach((obj) => {
    for (let key in objOfArrs) {
      objOfArrs[key] = [...objOfArrs[key], obj[key]];
    }
  });
  return objOfArrs;
};
