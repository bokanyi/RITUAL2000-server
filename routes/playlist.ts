import express, { Request, Response } from "express"
import mongoose from "mongoose"
import { z } from "zod"
import { verify } from "../middlewares/verify"
import { Playlist, PlaylistType } from "../models/Playlist"
import { User } from "../models/User"
import { verifyToken } from "../middlewares/verifyToken"
import { spotifyApi } from '../api/spotifyAuth'


const router = express.Router()

const { ObjectId } = mongoose.Types

const playlistZodSchema = z.object({
    user: z.string().transform((val) => new ObjectId(val)),
    name: z.string(),
    description: z.string(), 
    spotifyId: z.string(),
    createdAt: z.date().optional(), 
    updatedAt: z.date().optional(), 
})
type playlistZodType = z.infer <typeof playlistZodSchema>

router.get('/', verifyToken, async (req:Request, res:Response) => {
    if ( !res.locals.user ) return res.status(403).json("User not found.")

    try {
        const playlists = await Playlist.find({ user: res.locals.user })
        if (!playlists) throw new Error("You haven't created any playlist yet.")
        return res.status(200).json(playlists)
    } catch (error) {
        return res.sendStatus(400)
    }
})

router.get('/:id', async (req:Request, res:Response) => {
    try {
        const id = req.params.id
        const foundPlaylist = await Playlist.findOne({ _id: id })
        if (!foundPlaylist) throw new Error("Playlist not found.")
        return res.status(200).json(foundPlaylist)
    } catch (error) {
        return res.sendStatus(400)
    }
})


router.post('/', 
// verify(playlistZodSchema), 
verifyToken, async (req:Request, res:Response) => {
    if ( !res.locals.user ) return res.status(403).json("User not found.")
    if ( req.body.user !== res.locals.user ) return res.status(403).json("User not found.")

    // const playlistData = req.body as playlistZodType

    // Create an array of tracks

    let tracks : string[] = []
    
    await spotifyApi.getRecommendations({
        limit: 10,
        // seed_artists: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'],
        seed_genres: req.body.seed_genres,
        // seed_tracks: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'],
        target_danceability: req.body.target_danceability,
        // min_energy: 0.4,
        min_instrumentalness: req.body.min_instrumentalness,
        max_instrumentalness: req.body.max_instrumentalness,
        min_popularity: req.body.min_popularity,
        min_tempo: req.body.min_tempo,
        max_tempo: req.body.max_tempo,

        /*
        limit: 50,
        // market: "HU",
        // seed_artists: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'],
        seed_genres: req.body.seed_genres,
        // seed_tracks: ['6mfK6Q2tzLMEchAr0e9Uzu', '4DYFVNKZ1uixa6SQTvzQwJ'],
        target_danceability: req.body.target_danceability,
        // min_energy: 0.4,
        min_instrumentalness: req.body.min_instrumentalness,
        max_instrumentalness: req.body.max_instrumentalness,
        min_popularity: req.body.min_popularity,
        min_tempo: req.body.min_tempo,
        max_tempo: req.body.max_tempo,
        */
      })
    .then(function(data) {
        console.log("getRecommendations data", data)
        data.body.tracks.map((track) => {
            tracks.push(track.uri)
        } )
    console.log("getRecommendations tracks", tracks);
    }, function(err) {
    console.log("Something went wrong!", err);
    });

    // Create a private playlist

    let spotifyId = '' 
    await spotifyApi.createPlaylist(req.body.name, { 'description': req.body.description, 'public': false })
    .then(function(data) {
        spotifyId = data.body.id
        console.log('Created playlist!');
    }, function(err) {
        console.log('Something went wrong!', err);
    });

    
    // Add tracks to a playlist

    await spotifyApi.addTracksToPlaylist( spotifyId, tracks)
    .then(function(data) {
        console.log('Added tracks to playlist!');
    }, function(err) {
        console.log('Something went wrong!', err);
    });

    console.log("spotifyId", spotifyId)
    // const newPlaylist = await Playlist.create<PlaylistType>(playlistData)
    const newPlaylist = await Playlist.create({
        user: req.body.user,
        name: req.body.name,
        spotifyId: spotifyId,
        description: req.body.description
    })
    return res.status(201).json(newPlaylist)
})

export default router