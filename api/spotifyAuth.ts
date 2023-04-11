// import axios, { AxiosResponse } from "axios"
import {z} from "zod"
import SpotifyWebApi from 'spotify-web-api-node';


const redirect_uri = process.env.REDIRECT_URI
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET


const Response = z.object({
    access_token: z.string(),
    token_type: z.literal("Bearer"),
    scope: z.string(),
    expires_in: z.number(),
    refresh_token: z.string()
})

type Response = z.infer <typeof Response>

export const getAccessToken = async (code: string) : Promise <string | null> => {
        const spotifyApi = new SpotifyWebApi({
            redirectUri: redirect_uri,
            clientId: client_id,
            clientSecret: client_secret
            // clientId: process.env.CLIENT_ID,
            // clientSecret: process.env.CLIENT_SECRET
          })

        try {
            const response = await spotifyApi.authorizationCodeGrant(code)
            const result = Response.safeParse(response.body)
            const user = await spotifyApi.getMe()
            console.log(user)

        if (result.success === false){
            console.log(result.error)
            return null
        }
        
        return result.data.access_token
            
        } catch (error) {
            console.log(error) 
            return null
        }
    //       spotifyApi
    //     .authorizationCodeGrant(code)
    //     .then(data => {
    //     console.log(data)
    //     // res.json({
    //     //      accessToken : data.body.access_token,
    //     //      refreshToken : data.body.refresh_token,
    //     //      expiresIn : data.body.expires_in,
    //     //      expires_in : data.body['expires_in'],
    //     // })
    //   })
    //   .catch(error => {
    //     console.error('Error getting Tokens:', error);
    //     // res.send(`Error getting Tokens: ${error}`);
    //   });

    
}