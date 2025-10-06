// src/validator/collaborations/schema.js
import Joi from 'joi';

// Schema untuk payload penambahan/penghapusan kolaborator
const CollaborationPayloadSchema = Joi.object({
  playlistId: Joi.string().required(), // Memastikan playlistId adalah string dan harus ada
  userId: Joi.string().required(),     // Memastikan userId adalah string dan harus ada
});

export default {
  CollaborationPayloadSchema,
};