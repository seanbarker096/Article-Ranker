export default (ownerId, currentUserId) => {
  return ownerId === currentUserId;
};
