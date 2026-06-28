// ============================================================
// Arab Unity School Operations Platform
// Service Error Helper
// ============================================================
//
// Purpose:
// Provides reusable service-layer error builders so all modules
// throw consistent errors handled by the global error middleware.
//
// ============================================================

function create(message, statusCode = 500, errors = null) {
  const error = new Error(message);
  error.statusCode = statusCode;
  error.errors = errors;
  return error;
}

function badRequest(message = "Bad request.", errors = null) {
  return create(message, 400, errors);
}

function unauthorized(message = "Unauthorized.") {
  return create(message, 401);
}

function forbidden(message = "Forbidden.") {
  return create(message, 403);
}

function notFound(message = "Resource not found.") {
  return create(message, 404);
}

function conflict(message = "Duplicate record found.") {
  return create(message, 409);
}

module.exports = {
  create,
  badRequest,
  unauthorized,
  forbidden,
  notFound,
  conflict,
};