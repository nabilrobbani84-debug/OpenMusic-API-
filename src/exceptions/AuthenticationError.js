// src/exceptions/AuthenticationError.js
import ClientError from './ClientError.js';

class AuthenticationError extends ClientError {
  constructor(message) {
    super(message, 401); // 401 Unauthorized
    this.name = 'AuthenticationError';
  }
}

export default AuthenticationError;