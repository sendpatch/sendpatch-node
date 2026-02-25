export class SendPatchError extends Error {
  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

export class HttpRequestError extends SendPatchError {
  statusCode: number;
  responseBody?: unknown;

  constructor(message: string, statusCode: number, responseBody?: unknown) {
    super(message);
    this.statusCode = statusCode;
    this.responseBody = responseBody;
  }
}

export class ValidationError extends HttpRequestError {
  errorType: string;

  constructor(message: string, responseBody?: unknown) {
    super(message, 422, responseBody);
    this.errorType = 'validation';
  }
}

export class AuthenticationError extends HttpRequestError {
  constructor(message: string, responseBody?: unknown) {
    super(message, 401, responseBody);
  }
}

export class PermissionError extends HttpRequestError {
  constructor(message: string, responseBody?: unknown) {
    super(message, 403, responseBody);
  }
}

export class RateLimitError extends HttpRequestError {
  constructor(message: string, responseBody?: unknown) {
    super(message, 429, responseBody);
  }
}

export class TimeoutError extends SendPatchError {
  constructor() {
    super('Request timed out');
  }
}
