// src/validator/albums/schema.js
import Joi from 'joi';

const AlbumPayloadSchema = Joi.object({
  name: Joi.string().required(),
  // Detail: Year harus angka, integer, minimal tahun 1900, dan maksimal tahun sekarang.
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
});

export { AlbumPayloadSchema };