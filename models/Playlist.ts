import mongoose, { Schema, InferSchemaType } from "mongoose";

const playlistSchema = new Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    name: { type: String, required: true },
    description: { type: String },
    spotify: { type: String },
    spotifyId: { type: String, required: true },
    tracks: [{ artist: String, name: String, uri: String }],
  },
  { timestamps: { createdAt: true, updatedAt: true } }
);

export type PlaylistType = InferSchemaType<typeof playlistSchema> & {
  updatedAt: Date;
  createdAt: Date;
};
export const Playlist = mongoose.model("Playlist", playlistSchema);
