import express, { Request, Response } from "express";
import jwt from "jsonwebtoken";
import { z } from "zod";
import { getAccessToken, getMe } from "../api/spotifyAuth";
import { safeParse } from "../utilities/safeParse";
import { verify } from "../middlewares/verify";
import { User, UserType } from "../models/User";

// const redirect_uri = process.env.REDIRECT_URI;
// const client_id = process.env.CLIENT_ID;
// const client_secret = process.env.CLIENT_SECRET;

const router = express.Router();

const LoginRequestSchema = z.object({
  code: z.string(),
});



type LoginRequest = z.infer<typeof LoginRequestSchema>;

const SpotifyResponse = z.object({
  access_token: z.string(),
  token_type: z.string(),
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
    if (!tokens) return res.sendStatus(401)
    const result = safeParse(SpotifyResponse, tokens)
    if (!result) return res.sendStatus(500)
    const access_token = result.access_token;
    console.log(tokens)

    if (!access_token) return res.sendStatus(401);
   
    const user = await getMe()

    console.log("user in login", user)

    if (!user) return res.status(500).json("Spotify account couldn`t be loaded.")
    const foundUser = await User.findOneAndUpdate(
      { spotifyId: user.id},
      {
        access_token: tokens?.access_token,
        refresh_token: tokens?.refresh_token,
      }
    );
   

    if (!foundUser)
       await User.create<UserType>({
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
      secretKey, { expiresIn: "1h"}
    );

    // console.log(sessionToken)
    res.json(sessionToken);
  }
);

export default router;
