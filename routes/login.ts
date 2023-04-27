import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getAccessToken, spotifyApi } from "../api/spotifyAuth";
import { safeParse } from "../utilities/safeParse";
import { verify } from "../middlewares/verify";
import { User, UserType } from "../models/User";

const redirect_uri = process.env.REDIRECT_URI;
const client_id = process.env.CLIENT_ID;
const client_secret = process.env.CLIENT_SECRET;

const router = express.Router();

const LoginRequestSchema = z.object({
  code: z.string(),
});

type LoginRequest = z.infer<typeof LoginRequestSchema>;

const SpotifyResponse = z.object({
  access_token: z.string(),
  token_type: z.literal("Bearer"),
  scope: z.string(),
  expires_in: z.number(),
  refresh_token: z.string(),
});

type SpotifyResponseType = z.infer<typeof SpotifyResponse>;

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) throw "SecretKey is required.";

router.post(
  "/",
  verify(LoginRequestSchema),
  async (req: Request, res: Response) => {
    const loginRequest = req.body as LoginRequest;
    // console.log(loginRequest)
    const tokens = await getAccessToken(loginRequest.code);
    const access_token = tokens?.access_token;
    // console.log(tokens)

    if (!access_token) return res.sendStatus(401);

    const user = (await spotifyApi.getMe()).body;
    if (!user) return res.sendStatus(403);

    console.log("user in login", user)

    const findUser = await User.findOneAndUpdate(
      { spotifyId: user.id },
      {
        access_token: tokens?.access_token,
        refresh_token: tokens?.refresh_token,
      }
    );
    // console.log("finduser in login", findUser)
    if (!findUser)
      await User.create({
        country: user.country,
        display_name: user.display_name,
        email: user.email,
        spotify: user.external_urls.spotify,
        spotifyId: user.id,
        access_token: tokens?.access_token,
        refresh_token: tokens?.refresh_token,
      });

    const loggedInUser = await User.findOne({ spotifyId: user.id });
    // console.log("loggedInUser in login", loggedInUser)
    if (!loggedInUser) return res.sendStatus(500);

    const sessionToken = jwt.sign(
      {
        display_name: loggedInUser.display_name,
        email: loggedInUser.email,
        spotifyId: loggedInUser.id,
        spotify: user.external_urls.spotify,
        _id: loggedInUser?._id,
      },
      secretKey, { expiresIn: '1h'}
    );

    // console.log(sessionToken)
    res.json(sessionToken);
    // res.json(tokens)
  }
);

export default router;

/*
    try {
        const response : AxiosResponse = await axios.get(
            "https://api.spotify.com/v1/me", {
                headers: {
                    "Authorization" : `Bearer ${access_token}`
                }
            })
        const result = response.data
        console.log(response)
    } catch (error) {
        console.log("getme error", error)
    }

    */

// spotifyApi.getMe().then(function(data) {
//     console.log('Some information about the authenticated user', data.body);
//   }, function(err) {
//     console.log('Something went wrong with the authentication!', err);
//   });

// const payload: unknown = jwt.decode(idToken)
// const result = safeParse(Payload, payload)
// if (!result) return res.sendStatus(500)

// const data : UserType = result
