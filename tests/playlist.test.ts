import dotenv from "dotenv";
dotenv.config({ path: ".env.test" });
import supertest from "supertest";
import app from "../app";
import { connect, disconnect, clear } from "./testdb";
import { User } from "../models/User";
import { Playlist } from "../models/Playlist";
import jwt from "jsonwebtoken";
jest.mock("../api/spotifyAuth");
import {
  getAvailableGenreSeeds,
  getRecommendations,
  createPlaylist,
  addTracksToPlaylist,
  getPlaylist,
} from "../api/spotifyAuth";

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) throw "SecretKey is required.";

beforeAll(async () => await connect());
beforeEach(async () => await clear());
afterAll(async () => await disconnect());

const testApp = supertest(app);

describe("GET /api/playlist/", () => {
  it("should return the user's playlists", async () => {
    // given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign(
      {
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,
      },
      secretKey
    );

    await Playlist.create({
      user: user._id,
      name: "test 2000",
      description: "description",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      tracks: [
        {
          artist: "artist",
          name: "track",
          uri: "uri",
        },
      ],
    });

    // when
    const response = await testApp
      .get("/api/playlist")
      .set("Authorization", `Bearer ${token}`);
    // then
    expect(Array.isArray(response.body)).toBeTruthy();
    expect(response.body.length).toEqual(1);
    expect(response.body[0].name).toBe("test 2000");
    expect(response.status).toBe(200);
  });

  it("should return a selected playlist", async () => {
    // given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign(
      {
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,
      },
      secretKey
    );

    const playlist_1 = await Playlist.create({
      user: user._id,
      name: "test 2000",
      description: "description",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      tracks: [
        {
          artist: "artist",
          name: "track",
          uri: "uri",
        },
      ],
    });
    // when
    const response = await testApp
      .get(`/api/playlist/${playlist_1._id}`)
      .set("Authorization", `Bearer ${token}`);
    // then
    expect(Object(response.body)).toBeTruthy();
    expect(response.body.name).toBe("test 2000");
    expect(response.status).toBe(200);
  });
});

describe("POST /api/playlist/recommendations", () => {
  it("should return status 400 when user data not sent and body is empty", async () => {
    // when
    const response = await testApp.post("/api/playlist/recommendations");
    // then
    expect(response.status).toBe(400);
    
  });

  it("should return status 201 with recommendations ", async () => {
    //given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });

    const token = jwt.sign(
      {
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,
      },
      secretKey
    );

    const body = {
      user: user._id,
      seed_genres: "0",
      target_danceability: 0.6,
      // min_instrumentalness: 0.2,
      // max_instrumentalness: 0.8,
      // min_popularity: 50,
      min_tempo: 120,
      max_tempo: 200,
    };

    const genres = [
      'acoustic',          'afrobeat',       'alt-rock',
      'alternative',       'ambient',        'anime',
      'black-metal',       'bluegrass',      'blues',
      'bossanova',         'brazil',         'breakbeat',
      'british',           'cantopop',       'chicago-house',
      'children',          'chill',          'classical',
      'club',              'comedy',         'country',
      'dance',             'dancehall',      'death-metal',
      'deep-house',        'detroit-techno', 'disco',
      'disney',            'drum-and-bass',  'dub',
      'dubstep',           'edm',            'electro',
      'electronic',        'emo',            'folk',
      'forro',             'french',         'funk',
      'garage',            'german',         'gospel',
      'goth',              'grindcore',      'groove',
      'grunge',            'guitar',         'happy',
      'hard-rock',         'hardcore',       'hardstyle',
      'heavy-metal',       'hip-hop',        'holidays',
      'honky-tonk',        'house',          'idm',
      'indian',            'indie',          'indie-pop',
      'industrial',        'iranian',        'j-dance',
      'j-idol',            'j-pop',          'j-rock',
      'jazz',              'k-pop',          'kids',
      'latin',             'latino',         'malay',
      'mandopop',          'metal',          'metal-misc',
      'metalcore',         'minimal-techno', 'movies',
      'mpb',               'new-age',        'new-release',
      'opera',             'pagode',         'party',
      'philippines-opm',   'piano',          'pop',
      'pop-film',          'post-dubstep',   'power-pop',
      'progressive-house', 'psych-rock',     'punk',
      'punk-rock',         'r-n-b',          'rainy-day',
      'reggae',            'reggaeton',      'road-trip',
      'rock']

    const recommendations = [
      {
        artists: [
          {
            name: "test2000",
          },
        ],
        name: "Welcome Home, Son",
        uri: "spotify:track:13PUJCvdTSCT1dn70tlGdm",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Story of My Life",
        uri: "spotify:track:4nVBt6MZDDP6tRVdQTgxJg",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Beauty And A Beat",
        uri: "spotify:track:0KTsmr6JOuhxZuiXUha1xC",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Best Thing I Never Had (made famous by Beyoncé)",
        uri: "spotify:track:1u3PLSZ2YkkUBuapHKz29w",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Somebody That I Used To Know",
        uri: "spotify:track:14K3uhvuNqH8JUKcOmeea6",
      },
    ];
    const mockedRecommendations = jest.mocked(getRecommendations);
    mockedRecommendations.mockReturnValueOnce(Promise.resolve(recommendations));

    const mockedGenres = jest.mocked(getAvailableGenreSeeds);
    mockedGenres.mockReturnValueOnce(Promise.resolve(genres));

    // when
    console.log("body in test", body)
    const response = await testApp
      .post("/api/playlist/recommendations")
      .set("Authorization", `Bearer ${token}`)
      .send(body);
    // then
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(5);
    expect(response.body[0].artist).toBe("test2000");
  });
});

describe("POST api/playlist/", () =>{
  it("should return status 400 when user data not sent and body is empty", async () => {
    // when
    const response = await testApp.post("/api/playlist/recommendations");
    // then
    expect(response.status).toBe(400);
  });

  /*
  it("should return status 200 with saved playlist data ", async () => {
    //given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });

    const token = jwt.sign(
      {
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,
      },
      secretKey
    );

    const body = {
      user: user._id,
      seed_genres: "0",
      target_danceability: 0.6,
      // min_instrumentalness: 0.2,
      // max_instrumentalness: 0.8,
      // min_popularity: 50,
      min_tempo: 120,
      max_tempo: 200,
    };

    const genres = [
    ]

    const recommendations = [
      {
        artists: [
          {
            name: "test2000",
          },
        ],
        name: "Welcome Home, Son",
        uri: "spotify:track:13PUJCvdTSCT1dn70tlGdm",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Story of My Life",
        uri: "spotify:track:4nVBt6MZDDP6tRVdQTgxJg",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Beauty And A Beat",
        uri: "spotify:track:0KTsmr6JOuhxZuiXUha1xC",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Best Thing I Never Had (made famous by Beyoncé)",
        uri: "spotify:track:1u3PLSZ2YkkUBuapHKz29w",
      },
      {
        artists: [
          {
            name: "",
          },
        ],
        name: "Somebody That I Used To Know",
        uri: "spotify:track:14K3uhvuNqH8JUKcOmeea6",
      },
    ];
    
    const mockedGenres = jest.mocked(createPlaylist);
    createPlaylist.mockReturnValueOnce(Promise.resolve(genres));
    
    const mockedRecommendations = jest.mocked(addTracksToPlaylist);
    addTracksToPlaylist.mockReturnValueOnce(Promise.resolve(recommendations));

    // when
    console.log("body in test", body)
    const response = await testApp
      .post("/api/playlist/")
      .set("Authorization", `Bearer ${token}`)
      .send(body);
    // then
    expect(response.status).toBe(201);
    expect(response.body).toHaveLength(5);
    expect(response.body[0].artist).toBe("test2000");
  });
  */
})

describe("DELETE /api/playlist/", () => {
  it("should delete the playlist and return 'Playlist deleted' message", async () => {
    // given
    const user = await User.create({
      country: "HU",
      display_name: "ASD123",
      email: "user@email.asd",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      access_token: "1234asdf",
      refresh_token: "1234asdf",
    });
    const token = jwt.sign(
      {
        display_name: user.display_name,
        email: user.email,
        spotifyId: user.spotifyId,
        spotify: user.spotify,
        _id: user?._id,
      },
      secretKey
    );

    const playlist_1 = await Playlist.create({
      user: user._id,
      name: "test 2000",
      description: "description",
      spotify: "1234asdf",
      spotifyId: "1234asdf",
      tracks: [
        {
          artist: "artist",
          name: "track",
          uri: "uri",
        },
      ],
    });
    // when
    const response = await testApp
      .delete(`/api/playlist/${playlist_1._id}`)
      .set("Authorization", `Bearer ${token}`);
    // then
    const dbContent = await Playlist.find()
    expect(response.body).toBe("Playlist deleted.");
    expect(response.status).toBe(200);
    //adatbazisbol kitorlodotte
    expect(dbContent).toBe([])// vagy toHaveLength(0)
    
  });

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
});
