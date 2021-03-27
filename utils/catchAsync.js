//higher order function which takes route-handler code, appends.catch and returns it again
module.exports = (fn) => (req, res, next) => {
    fn(req, res, next).catch(next);
};
