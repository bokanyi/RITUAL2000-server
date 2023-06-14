import { z } from "zod";
import SpotifyWebApi from "spotify-web-api-node";
import { safeParse } from "../utilities/safeParse";

const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const Response = z.object({
  access_token: z.string(),
  token_type: z.string(),
  scope: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
});

type ResponseType = z.infer<typeof Response>;

const User = z.object({
  country: z.string(),
  display_name: z.string(),
  email: z.string(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  id: z.string(),
});

const Genres = z.array(z.string());

const Recommendations = z.array(
  z.object({
    artists: z.array(
      z.object({
        name: z.string(),
      })
    ),
    name: z.string(),
    uri: z.string(),

  })
);


const Playlist = z.object({
  name: z.string(),
  description: z.string(),
  external_urls: z.object({
    spotify: z.string(),
  }),
  id: z.string(),
  tracks: z.object({
    items: z.array(z.object({
          track: z.object(
            {
              artists: z.array(z.object({
                name: z.string(),
              })),
              name: z.string(),
              uri: z.string(),
            })
          ,
        })
      ),
  })
});

const createdPlaylist = z.object({
    id: z.string(),
})

export const spotifyApi = new SpotifyWebApi({
  redirectUri: redirect_uri,
  clientId: client_id,
  clientSecret: client_secret,
});

export const getAccessToken = async (
  code: string
): Promise<ResponseType | null> => {
  try {
    const response = await spotifyApi.authorizationCodeGrant(code);
    const result = Response.safeParse(response.body);

    spotifyApi.setAccessToken(response.body["access_token"]);

    // const user = await spotifyApi.getMe()
    // console.log(user)

    if (result.success === false) {
      console.log(result.error);
      return null;
    }

    return result.data;
  } catch (error) {
    console.log(error);
    return null;
  }
};

export const getMe = async () => {
    const data = await spotifyApi.getMe();
    // console.log( "spotifyApi.getMe user", data)
    const result = safeParse(User, data.body);
    console.log("safeparse result:", result)
    if (!result) return null
    return result;
 
};

export const getAvailableGenreSeeds = async () => {
  const allGenres = await spotifyApi.getAvailableGenreSeeds();
  //   const genres = allGenres.body.genres
  const result = safeParse(Genres, allGenres.body.genres);

  return result;
};

export const getRecommendations = async (
  seed_genres: string[],
  target_danceability: number,
  min_tempo: number,
  max_tempo: number
) => {
  const data = await spotifyApi.getRecommendations({
    limit: 20,
    // seed_artists: [],
    seed_genres: seed_genres,
    // seed_tracks: [],
    target_danceability: target_danceability,
    // min_duration_ms: req.body.min_duration_ms,
    // max_duration_ms: req.body.max_duration_ms,
    // target_duration_ms: req.body.target_duration_ms,
    // min_energy: 0.4,

    // min_instrumentalness: req.body.min_instrumentalness,
    // max_instrumentalness: req.body.max_instrumentalness,
    // min_popularity: req.body.min_popularity,

    // max_popularity: req.body.max_popularity,
    min_tempo: min_tempo,
    max_tempo: max_tempo,
    // target_tempo: req.body.target_tempo,
  });
  //   console.log("recommendations", data.body.tracks[0].artists)
  const result = safeParse(Recommendations, data.body.tracks);
//   console.log("recommendations", result)
  return result;
};

export const createPlaylist = async (name: string, description: string) => {
  const data = await spotifyApi.createPlaylist(name, {
    description: description,
    public: false,
  });
  const playlist = safeParse(createdPlaylist, data.body);
  return playlist;
};

export const addTracksToPlaylist = async (
  spotifyId: string,
  tracks: string[]
) => {
  const data = await spotifyApi.addTracksToPlaylist(spotifyId, tracks);
};

export const getPlaylist = async (spotifyId: string) => {
  const data = await spotifyApi.getPlaylist(spotifyId);
  const playlist = safeParse(Playlist, data.body);
    // console.log("playlist in getplaylist", playlist)
  return playlist;
};
