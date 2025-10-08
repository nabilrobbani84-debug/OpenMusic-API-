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
      this._validator.validateUserPayload(request.payload); 
      
      const { username, password, fullname } = request.payload;
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