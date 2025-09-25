// src/validator/albums/schema.js

import Joi from 'joi';

const AlbumPayloadSchema = Joi.object({
  // Sesuaikan properti-properti di sini
  name: Joi.string().required(),
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
});

// Perbaikan: Menggunakan Named Export
export { AlbumPayloadSchema };