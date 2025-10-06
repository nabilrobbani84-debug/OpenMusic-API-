// src/exceptions/InvariantError.js
import ClientError from './ClientError.js';

class InvariantError extends ClientError {
  constructor(message) {
    // Memanggil constructor ClientError (parent class) dengan message dan status code 400.
    // ClientError default-nya sudah 400, namun ditambahkan secara eksplisit untuk kejelasan.
    super(message, 400); 
    this.name = 'InvariantError';
  }
}

export default InvariantError;