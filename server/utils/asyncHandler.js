/**
 * Wraps an async route handler to catch errors and pass to next()
 * Usage: router.get('/path', asyncHandler(myController))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;
