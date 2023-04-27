import express, { Request, Response } from "express";
import mongoose from "mongoose";
import { z } from "zod";
import { verify } from "../middlewares/verify";
import { Playlist, PlaylistType } from "../models/Playlist";
import { User } from "../models/User";
import { verifyToken } from "../middlewares/verifyToken";
import { spotifyApi } from "../api/spotifyAuth";

const router = express.Router();

const { ObjectId } = mongoose.Types;

const playlistZodSchema = z.object({
  user: z.string().transform((val) => new ObjectId(val)),
  name: z.string(),
  description: z.string(),
  spotifyId: z.string(),
  createdAt: z.date().optional(),
  updatedAt: z.date().optional(),
});

type playlistZodType = z.infer<typeof playlistZodSchema>;

type Tracks ={
  artist: string,
  name: string,
  uri: string
}

type CurrentPlaylist ={
  name: string,
  description: string,
  spotify: string,
  tracks: Tracks[]
}

router.get("/", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  try {
    const library = await Playlist.find({ user: res.locals.user });
    if (!library) throw new Error("You haven't created any playlist yet.");
    return res.status(200).json(library);
  } catch (error) {
    return res.sendStatus(400);
  }
});

router.get("/:id", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  try {
    const id = req.params.id;
    console.log("Playlist id", id);
    // find playlist in mongodb
    const foundPlaylist = await Playlist.findOne({ _id: id });
    if (!foundPlaylist) throw new Error("Playlist not found.");
    console.log("foundPlaylist", foundPlaylist);
    //get playlist from spotifyapi
    const playlist = await spotifyApi.getPlaylist(
      foundPlaylist.spotifyId
    );
    console.log("playlist", playlist);
    if (!playlist) return res.status(404).json("Playlist not found.");
    const  currentPlaylist ={
      name: playlist.body.name,
      description: playlist.body.description,
      spotify: playlist.body.external_urls.spotify,
      tracks: playlist.body.tracks.items.map((item) => {
        return ({artist: item.track?.artists[0].name,
          name: item.track?.name,
          uri: item.track?.uri})
       })
    }
    return res.status(200).json(currentPlaylist);
  } catch (error) {
    return res.sendStatus(400);
  }
});

router.post(
  "/recommendations",
  // verify(playlistZodSchema),
  verifyToken,
  async (req: Request, res: Response) => {
    if (!res.locals.user) return res.status(403).json("User not found.");
    console.log(req.body.user);
    if (req.body.user !== res.locals.user)
      return res.status(405).json("User not found.");

    // const playlistData = req.body as playlistZodType

    //get recommendation seeds

    let seed_genres = []
    try {
      const allGenres = await spotifyApi.getAvailableGenreSeeds()
      const genres = allGenres.body.genres
      let number = Math.floor(parseInt(req.body.seed_genres)*(genres.length-1)/360)
      console.log(number)
      seed_genres.push(genres[number])
    } catch (error) {
      console.log("Something went wrong!", error);
      return res.status(400).json(error);
    }

    console.log("seed_genres", seed_genres)

    // Create an array of tracks
   

    let tracks: Tracks[] = [];

    try {
      const data = await spotifyApi.getRecommendations({
        limit: 20,
        // seed_artists: [],
        seed_genres: seed_genres,
        // seed_tracks: [],
        target_danceability: req.body.target_danceability,
        // min_duration_ms: req.body.min_duration_ms,
        // max_duration_ms: req.body.max_duration_ms,
        // target_duration_ms: req.body.target_duration_ms,
        // min_energy: 0.4,

        // min_instrumentalness: req.body.min_instrumentalness,
        // max_instrumentalness: req.body.max_instrumentalness,
        // min_popularity: req.body.min_popularity,

        // max_popularity: req.body.max_popularity,
        min_tempo: req.body.min_tempo,
        max_tempo: req.body.max_tempo,
        // target_tempo: req.body.target_tempo,
      });
      data.body.tracks.map((track) => {
        tracks.push({
          artist: track.artists[0].name,
          name: track.name,
          uri: track.uri,
        });
      });
      // console.log("getRecommendations tracks", tracks);
    } catch (error) {
      console.log("Something went wrong!", error);
      return res.status(400).json(error);
    }
    return res.status(201).json(tracks);

  }
);

router.post(
  "/",
  // verify(playlistZodSchema),
  verifyToken,
  async (req: Request, res: Response) => {
    if (!res.locals.user) return res.status(403).json("User not found.");
    console.log(req.body.user);
    if (req.body.user !== res.locals.user)
      return res.status(405).json("User not found.");
    // Create a private playlist

    const name = req.body.name
    const tracks = req.body.tracks
        
    console.log("tracks", tracks)
    console.log("name", name)
    let spotifyId = "";

    try {
      const data = await spotifyApi.createPlaylist(name, {
        description: req.body.description,
        public: false,
      });
      spotifyId = data.body.id;
      console.log("Created playlist!");
    } catch (error) {
      console.log("Something went wrong!", error);
      return res.status(400).json(error);
    }

    // Add tracks to a playlist

    try {
      const data = await spotifyApi.addTracksToPlaylist(spotifyId, tracks);
    } catch (error) {
      console.log("Something went wrong!", error);
      return res.status(400).json(error);
    }

    /*
    await spotifyApi.addTracksToPlaylist(spotifyId, tracks).then(
      function (data) {
        console.log("Added tracks to playlist!");
      },
      function (err) {
        console.log("Something went wrong!", err);
        return res.status(400).json(err);
      }
    );
    */

    console.log("spotifyId", spotifyId);
    // const newPlaylist = await Playlist.create<PlaylistType>(playlistData)
    const newPlaylist = await Playlist.create({
      user: req.body.user,
      name: req.body.name,
      description: req.body.description,
      spotifyId: spotifyId,
    });
    return res.status(201).json(newPlaylist);
  }
);

router.delete("/:id", verifyToken, async (req: Request, res: Response) => {
  if (!res.locals.user) return res.status(403).json("User not found.");
  // try {
  const id = req.params.id;
  console.log("id in delete", id);
  const foundPlaylist = await Playlist.findByIdAndDelete(id);
  console.log("foundPlaylist in delete", foundPlaylist);
  // if (!foundPlaylist) throw new Error("Playlist not found.")
  if (!foundPlaylist) return res.sendStatus(404).json("Playlist not found.");
  console.log("foundPlaylist", foundPlaylist);
  return res.status(200).json("Playlist  deleted");
  // } catch (error) {
  //     return res.sendStatus(404).json("Playlist not found")
  // }
});

export default router;
