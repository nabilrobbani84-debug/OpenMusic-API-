// src/validator/playlists/schema.js
import Joi from 'joi';

// Skema untuk membuat playlist (POST /playlists)
const PostPlaylistPayloadSchema = Joi.object({
  name: Joi.string().required().max(50), // Batasi panjang nama playlist
  targetEmail: Joi.string().email().required(),
});

// Skema untuk menambahkan lagu ke playlist (POST /playlists/{playlistId}/songs)
const PostPlaylistSongPayloadSchema = Joi.object({
  songId: Joi.string().required(), // Memastikan songId adalah string dan harus ada
});

export default {
  PostPlaylistPayloadSchema,
  PostPlaylistSongPayloadSchema,
};