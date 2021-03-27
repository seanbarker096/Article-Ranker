//checks to see if the signed in user owns the document (e.g. for updates and deletes)

const requireOwnerOrAdmin = (ownerId, userId, role) =>
    String(ownerId) === String(userId) || role === 'admin';

module.exports = requireOwnerOrAdmin;
