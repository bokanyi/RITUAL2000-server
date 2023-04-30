import dotenv from "dotenv"
dotenv.config({ path: ".env.test" })
import supertest from "supertest"
import app from "../app"
import { connect, disconnect, clear } from "./testdb"
import { User } from "../models/User"
import { Playlist } from "../models/Playlist"
import jwt from "jsonwebtoken";
jest.mock("../api/spotifyAuth") 
import { spotifyApi } from "../api/spotifyAuth"

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) throw "SecretKey is required.";

beforeAll(async () => await connect())
beforeEach(async () => await clear())
afterAll(async () => await disconnect())

const testApp = supertest(app)

describe("POST /api/playlist/recommendations", () => {
  it("should return status 401 when user data not sent and body is empty", async () => {
    // when
    const response = await testApp.post("/api/playlist/recommendations")
    // then
    expect(response.status).toBe(401)
  })
/*
  it("should return status 201 with recommendations ", async () => {
     //given
     const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId:"1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign({
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,   
    }, secretKey)
  
     const body = ({ user: user._id, 
      seed_genres: ["classical"],
      target_danceability: 0.6,
      // min_instrumentalness: 0.2,
      // max_instrumentalness: 0.8,
      // min_popularity: 50,
      min_tempo: 120,
      max_tempo: 200, })
  
      const recommendations ={
        headers: {},
        body: {
          tracks: [
            {
              "album": {
                "album_type": "compilation",
                "total_tracks": 9,
                "available_markets": ["CA", "BR", "IT"],
                "external_urls": {
                  "spotify": "string"
                },
                "href": "string",
                "id": "2up3OPMp9Tb4dAKM2erWXQ",
                "images": [
                  {
                    "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
                    "height": 300,
                    "width": 300
                  }
                ],
                "name": "string",
                "release_date": "1981-12",
                "release_date_precision": "year",
                "restrictions": {
                  "reason": "market"
                },
                "type": "album",
                "uri": "spotify:album:2up3OPMp9Tb4dAKM2erWXQ",
                "copyrights": [
                  {
                    "text": "string",
                    "type": "string"
                  }
                ],
                "external_ids": {
                  "isrc": "string",
                  "ean": "string",
                  "upc": "string"
                },
                genres: ["Egg punk", "Noise rock"],
                "label": "string",
                "popularity": 0,
                "album_group": "compilation",
                "artists": [
                  {
                    "external_urls": {
                      "spotify": "string"
                    },
                    "href": "string",
                    "id": "string",
                    "name": "string",
                    "type": "artist",
                    "uri": "string"
                  }
                ]
              },
              artists: [
                {
                  "external_urls": {
                    "spotify": "string"
                  },
                  "followers": {
                    "href": "string",
                    "total": 0
                  },
                  genres: ["Prog rock", "Grunge"],
                  "href": "string",
                  "id": "string",
                  "images": [
                    {
                      "url": "https://i.scdn.co/image/ab67616d00001e02ff9ca10b55ce82ae553c8228",
                      "height": 300,
                      "width": 300
                    }
                  ],
                  "name": "string",
                  "popularity": 0,
                  "type": "artist",
                  "uri": "string"
                }
              ],
              "available_markets": ["string"],
              "disc_number": 0,
              "duration_ms": 0,
              "explicit": false,
              "external_ids": {
                "isrc": "string",
                "ean": "string",
                "upc": "string"
              },
              "external_urls": {
                "spotify": "string"
              },
              "href": "string",
              "id": "string",
              "is_playable": false,
              "linked_from": {
              },
              "restrictions": {
                "reason": "string"
              },
              "name": "string",
              "popularity": 0,
              "preview_url": "string",
              "track_number": 0,
              "type": "track",
              "uri": "string",
              "is_local": false
            }
          ]
        },
        statusCode: 200
      } 
  
      const mockedUser = jest.mocked((spotifyApi.getRecommendations))
      mockedUser.mockReturnValueOnce(Promise.resolve(recommendations))
  
    // when
    const response = await testApp.post("/api/playlist/recommendations")
    .set('Authorization', `Bearer ${token}`)
    .send(body)
    // then
    expect(response.status).toBe(201)
  })
  */

})

describe("GET /api/playlist/", () => {
  it("should return the user's playlists", async () => {
    // given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId:"1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign({
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,   
    }, secretKey)

    await Playlist.create({
      user: user._id,
      name: "test 2000",
      description: "description",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      tracks: [{
        artist: "artist",
        name: "track",
        uri: "uri",
      }]})

    // when
    const response = await testApp.get("/api/playlist").set('Authorization', `Bearer ${token}`)
    // then
    expect(Array.isArray(response.body)).toBeTruthy()
    expect(response.body.length).toEqual(1)
    expect(response.body[0].name).toBe("test 2000")
    expect(response.status).toBe(200)
  })

  it("should return a selected playlist", async () => {
    // given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId:"1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign({
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,   
    }, secretKey)

    const playlist_1 = await Playlist.create({
      user: user._id,
      name: "test 2000",
      description: "description",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      tracks: [{
        artist: "artist",
        name: "track",
        uri: "uri",
      }]})
    // when
    const response = await testApp.get(`/api/playlist/${playlist_1._id}`).set('Authorization', `Bearer ${token}`)
    // then
    expect(Object(response.body)).toBeTruthy()
    expect(response.body.name).toBe("test 2000")
    expect(response.status).toBe(200)
  })


})

describe("DELETE /api/playlist/", () => {
  
  it("should delete the playlist and return 'Playlist deleted' message", async () => {
    // given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId:"1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign({
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,   
    }, secretKey)

    const playlist_1 = await Playlist.create({
      user: user._id,
      name: "test 2000",
      description: "description",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      tracks: [{
        artist: "artist",
        name: "track",
        uri: "uri",
      }]})
    // when
    const response = await testApp.delete(`/api/playlist/${playlist_1._id}`).set('Authorization', `Bearer ${token}`)
    // then
    expect(response.body).toBe("Playlist deleted.")
    expect(response.status).toBe(200)
  })

  /*
  it("should return status 404 when the playlist not found in database", async () => {
    // given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId:"1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign({
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,   
    }, secretKey)
    // when
    const response = await testApp.delete(`/api/playlist/123456789`)
    .set('Authorization', `Bearer ${token}`)
    // then
    expect(response.body).toBe("Playlist not found.")
    expect(response.status).toBe(404)
  })
  */
})


