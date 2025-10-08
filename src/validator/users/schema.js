// src/validator/users/schema.js
import Joi from 'joi';

// Skema untuk pendaftaran pengguna baru (POST /users)
const PostUserPayloadSchema = Joi.object({
  username: Joi.string()
    .required()
    // .min(5) Dihapus
    .max(50)  
    .pattern(/^[a-z0-9_]+$/)
    .messages({
      // PERBAIKAN: Mengganti pesan error agar mencakup underscore
      'string.pattern.base': 'username hanya boleh mengandung huruf kecil, angka, dan underscore',
      'string.max': 'username maksimal 50 karakter',
      'any.required': 'username harus diisi',
    }),
  password: Joi.string().required().messages({
    // 'string.min': 'password minimal 8 karakter', Dihapus
    'any.required': 'password harus diisi',
  }),
  fullname: Joi.string().required().messages({
    'any.required': 'fullname harus diisi',
  }),
});

export default {
  PostUserPayloadSchema,
};