import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { verify } from "../middlewares/verify";
import { Playlist, PlaylistType } from "../models/Playlist";
import { verifyToken } from "../middlewares/verifyToken";
import { getAvailableGenreSeeds, getRecommendations, createPlaylist, addTracksToPlaylist, getPlaylist } from "../api/spotifyAuth";
import { safeParse } from "../utilities/safeParse";

const router = express.Router();

const { ObjectId } = mongoose.Types;

const playlistZodSchema = z.object({
  user: z.string().transform((val) => new ObjectId(val)),
  name: z.string(),
  description: z.string(),
  spotify: z.string(),
  spotifyId: z.string(),
  tracks: z.array(z.object({
    artist: z.string(),
    name: z.string(),
    uri: z.string()
  })),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});


type playlistZodType = z.infer<typeof playlistZodSchema>;

const recommendationZodSchema = z.object({
  user: z.string(),
  seed_genres: z.string(),
  target_danceability: z.number(),
  // min_instrumentalness: z.number(),
  // max_instrumentalness: z.number(),
  // min_popularity: z.number(),
  min_tempo: z.number(),
  max_tempo: z.number(),
})

// type recommendationZodType = z.infer<typeof recommendationZodSchema>;

const playlistRequiestZodSchema = z.object({
  user: z.string(),
  name: z.string(),
  description: z.string(),
  tracks: z.array(z.string()),
})


router.get("/", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  const library = await Playlist.find({ user: res.locals.user });
  if (!library) throw new Error("You haven't created any playlist yet.");
  return res.status(200).json(library);
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  const id = req.params.id;
  console.log("Playlist id", id);
  // find playlist in mongodb
  const foundPlaylist = await Playlist.findOne({ _id: id });
  if (!foundPlaylist) throw new Error("Playlist not found.");
  console.log("foundPlaylist", foundPlaylist);
  return res.status(200).json(foundPlaylist);
});

router.post(
  "/recommendations",
  verify(recommendationZodSchema), //TRPC library
  verifyToken,
  async (req: Request, res: Response) => {
    if (!res.locals.user) return res.status(403).json("User not found.");
    console.log(req.body.user);
    if (req.body.user !== res.locals.user)
      return res.status(405).json("User not found.");

    //Get recommendation seeds

    let seed_genres = []
    const genres = await getAvailableGenreSeeds()
    if (!genres) return res.status(400).json("Something went wrong!");
    let number = Math.floor(parseInt(req.body.seed_genres)*(genres.length-1)/360)
    console.log(number)
    seed_genres.push(genres[number])

    console.log("seed_genres", seed_genres)

    // Create an array of tracks

    const data = await getRecommendations(seed_genres, req.body.target_danceability, req.body.min_tempo, req.body.max_tempo )
    
    if (!data) return res.status(400).json("Something went wrong!");

    const tracks = data.map((track) => (
       {
        artist: track.artists[0].name,
        name: track.name,
        uri: track.uri,
       }
    ));
    return res.status(201).json(tracks);
  }
);

router.post(
  "/",
  verify(playlistRequiestZodSchema),
  verifyToken,
  async (req: Request, res: Response) => {
    if (!res.locals.user) return res.status(403).json("User not found.");
    console.log(req.body.user);
    if (req.body.user !== res.locals.user)
      return res.status(405).json("User not found.");

    // Create a private playlist

    const name = req.body.name
    const tracks = req.body.tracks
    const description = req.body.description

        
    console.log("tracks", tracks)
    console.log("name", name)
    let spotifyId = "";

    const data = await createPlaylist(name, description)
    
    if (!data) return res.status(400).json("Something went wrong!");
    spotifyId = data.id;
    console.log("Created playlist!");
    console.log("Created playlist!", data);
  
    console.log("spotifyId", spotifyId);

    // Add tracks to a playlist

    const playlistOnSpotify = await addTracksToPlaylist(spotifyId, tracks);

    
    //Get the playlist data and save to mongo

    const playlist = await getPlaylist(spotifyId);
    
    console.log("playlist", playlist);
    if (!playlist) return res.status(404).json("Playlist not found.");

    const newPlaylist = {
      user: req.body.user,
      name: playlist.name,
      description: playlist.description,
      spotify: playlist.external_urls.spotify,
      spotifyId: spotifyId,
      tracks: playlist.tracks.items.map((item) => {
        return ({artist: item.track?.artists[0].name,
          name: item.track?.name,
          uri: item.track?.uri})
       })
    }
    const result = safeParse(playlistZodSchema, newPlaylist )
    if (!result) {
      return res.sendStatus(500);
    }
    const savedPlaylist = await Playlist.create<PlaylistType>(result)
    return res.status(200).json(savedPlaylist);

  }
);

router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  const id = req.params.id;
  console.log("id in delete", id);
  const foundPlaylist = await Playlist.findByIdAndDelete(id);
  console.log("foundPlaylist in delete", foundPlaylist);
  // if (!foundPlaylist) throw new Error("Playlist not found.")
  if (!foundPlaylist) return res.sendStatus(404).json("Playlist not found.");
  console.log("foundPlaylist", foundPlaylist);
  return res.status(200).json("Playlist deleted.");

});

export default router;
