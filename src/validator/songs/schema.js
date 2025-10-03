// src/validator/songs/schema.js
import Joi from 'joi';

const SongPayloadSchema = Joi.object({
  title: Joi.string().required(),
  // Detail: Year harus angka, integer, minimal tahun 1900, dan maksimal tahun sekarang.
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  
  // Detail: duration harus angka, integer, dan bersifat opsional (tidak ada .required())
  // Gunakan .optional() atau cukup hilangkan .required()
  duration: Joi.number().integer().optional(), 
  
  // Detail: albumId harus berupa string dan bersifat opsional.
  albumId: Joi.string().optional(),
});

export { SongPayloadSchema };