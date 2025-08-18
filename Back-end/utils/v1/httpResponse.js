// utils/httpResponse.js

function httpSuccess(res, statusCode = 200, message = "Success", data = {}) {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
}

function httpError(res, statusCode = 500, message = "Something went wrong", errors = null) {
  return res.status(statusCode).json({
    success: false,
    message,
    errors,
  });
}

module.exports = {
  httpSuccess,
  httpError,
};
