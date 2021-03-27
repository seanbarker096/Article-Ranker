export default (parentKey, parentId, childrenObj) => {
  //need to memoze this so only changes if inputs (i.e. the store state has changed)
  const matchedChildren = {};
  Object.values(childrenObj).forEach((child) => {
    if (child[parentKey] === parentId) {
      return (matchedChildren[child._id] = child);
    }
  });
  return matchedChildren;
};
