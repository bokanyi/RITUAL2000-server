import express, { Request, Response } from 'express'
import jwt from 'jsonwebtoken'
import { z } from "zod"
import { getAccessToken } from '../api/spotifyAuth'
import { safeParse } from '../utilities/safeParse'
import { verify } from '../middlewares/verify'
import { User, UserType } from '../models/User'

const router = express.Router()

const LoginRequestSchema = z.object ({
    code: z.string(),
  })

type LoginRequest = z.infer<typeof LoginRequestSchema> 

const Payload = z.object({
    sub: z.string(),
    email: z.string().email(),
    picture: z.string(),
    name: z.string()
  })

type Payload = z.infer<typeof Payload>

const secretKey = process.env.JWT_SECRET_KEY
if (!secretKey) throw "SecretKey is required."

router.post('/', verify(LoginRequestSchema), async (req: Request, res: Response) => {
    const loginRequest = req.body as LoginRequest
  
    const access_token = await getAccessToken(loginRequest.code)
    if (!access_token) return res.sendStatus(401)

    console.log(access_token)
  
    // const payload: unknown = jwt.decode(idToken)
    // const result = safeParse(Payload, payload)
    // if (!result) return res.sendStatus(500)
    
    // const data : UserType = result
    // const findUser = await User.findOne({sub: data.sub})
    // if (!findUser) await User.create(data)
    
    // const user = await User.findOne({sub: data.sub})
    // if (!user) return res.sendStatus(500)
    
    // const sessionToken = jwt.sign({data: user}, secretKey)
    // res.json(sessionToken) 
    res.json(access_token)
  })
  
  export default router
