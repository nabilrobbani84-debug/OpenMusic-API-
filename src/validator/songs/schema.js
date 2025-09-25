// src/validator/songs/schema.js (Contoh Perbaikan)
import Joi from 'joi';

const SongPayloadSchema = Joi.object({
  // WAJIB menggunakan .required() untuk properti yang harus ada.
  // Jika tidak ada, Joi akan gagal validasi sebelum kode Anda mencoba mengaksesnya.
  title: Joi.string().required(), 
  year: Joi.number().integer().min(1900).max(new Date().getFullYear()).required(),
  genre: Joi.string().required(),
  performer: Joi.string().required(),
  duration: Joi.number().default(0), // Gunakan .default(0) jika durasi bisa null/undefined.
  albumId: Joi.string().optional(), // Gunakan .optional() jika albumId boleh tidak ada.
});

export { SongPayloadSchema };