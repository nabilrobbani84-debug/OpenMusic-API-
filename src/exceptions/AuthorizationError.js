// src/exceptions/AuthorizationError.js
import ClientError from './ClientError.js';

class AuthorizationError extends ClientError {
  constructor(message) {
    super(message, 403); // 403 Forbidden
    this.name = 'AuthorizationError';
  }
}

export default AuthorizationError;