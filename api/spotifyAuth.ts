// import axios, { AxiosResponse } from "axios"
import {z} from "zod"
import SpotifyWebApi from 'spotify-web-api-node';


const redirect_uri = process.env.REDIRECT_URI
const client_id = process.env.CLIENT_ID
const client_secret = process.env.CLIENT_SECRET


const Response = z.object({
    access_token: z.string(),
    token_type: z.string(),
    scope: z.string(),
    expires_in: z.number(),
    refresh_token: z.string()
})

type ResponseType = z.infer <typeof Response>

export const spotifyApi = new SpotifyWebApi({
    redirectUri: redirect_uri,
    clientId: client_id,
    clientSecret: client_secret
  })

export const getAccessToken = async (code: string) : Promise <ResponseType | null> => {

        try {
            const response = await spotifyApi.authorizationCodeGrant(code)
            const result = Response.safeParse(response.body)

            spotifyApi.setAccessToken(response.body['access_token']);

            // const user = await spotifyApi.getMe()
            // console.log(user)

        if (result.success === false){
            console.log(result.error)
            return null
        }
        
        return result.data
            
        } catch (error) {
            console.log(error) 
            return null
        }

    
}