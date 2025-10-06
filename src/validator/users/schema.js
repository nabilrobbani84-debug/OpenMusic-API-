// src/validator/users/schema.js
import Joi from 'joi';

// Skema untuk pendaftaran pengguna baru (POST /users)
const PostUserPayloadSchema = Joi.object({
  username: Joi.string()
    .required()
    .min(5)
    .max(50)
    .pattern(/^[a-z0-9]+$/) // Membatasi hanya huruf kecil dan angka
    .messages({
      'string.pattern.base': 'username hanya boleh mengandung huruf kecil dan angka',
      'string.min': 'username minimal 5 karakter',
      'string.max': 'username maksimal 50 karakter',
      'any.required': 'username harus diisi',
    }),
  password: Joi.string().required().min(8).messages({
    'string.min': 'password minimal 8 karakter',
    'any.required': 'password harus diisi',
  }),
  fullname: Joi.string().required().messages({
    'any.required': 'fullname harus diisi',
  }),
});

export default {
  PostUserPayloadSchema,
};