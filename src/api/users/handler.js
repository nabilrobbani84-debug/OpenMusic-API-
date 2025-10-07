// src/api/users/handler.js
import autoBind from 'auto-bind';
import InvariantError from '../../exceptions/InvariantError.js';
import NotFoundError from '../../exceptions/NotFoundError.js';

class UsersHandler {
  constructor(service, validator) {
    this._service = service;
    this._validator = validator;
    autoBind(this);
  }

  async postUserHandler(request, h) {
    try {
      // 1. Validasi Payload menggunakan validator yang sudah diimpor
      this._validator.validateUserPayload(request.payload); 
      
      const { username, password, fullname } = request.payload;
      
      // 2. Tambahkan User (Service akan handle cek duplikasi username)
      const userId = await this._service.addUser({ username, password, fullname });

      const response = h.response({
        status: 'success',
        message: 'User berhasil ditambahkan',
        data: {
          userId,
        },
      });
      response.code(201);
      return response;
    } catch (error) {
      // 3. Penanganan Error Kustom (InvariantError, dll.)
      if (error instanceof InvariantError || error instanceof NotFoundError) {
        // Global error handler di server.js akan menangani ini,
        // tetapi untuk kepastian dan konsistensi, kita tetap menggunakan try-catch.
        throw error;
      }

      // 4. Fallback untuk Server Error (500) - Akan ditangkap Global Handler
      throw error; 
    }
  }
  
  async getUserByIdHandler(request, h) {
    try {
      const { id } = request.params;
      const user = await this._service.getUserById(id);
      
      return {
        status: 'success',
        data: {
          user,
        },
      };
    } catch (error) {
      // 5. Penanganan Error Kustom
      if (error instanceof NotFoundError) {
        // Global error handler di server.js akan menangani ini,
        // tetapi kita bisa melempar errornya saja.
        throw error; 
      }
      
      throw error;
    }
  }
}

export default UsersHandler;