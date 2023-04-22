import { NextFunction, Request, Response } from 'express'
import jwt from "jsonwebtoken"
import {z} from "zod"
import { safeParse } from '../utilities/safeParse'

const env = z.object({JWT_SECRET_KEY: z.string()}).parse(process.env)

const userZodSchema = z.object ({
  display_name: z.string(),
  email: z.string(),
  spotifyId: z.string(),
  _id: z.string()
  
})

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const autHeader = req.headers["authorization"]
  console.log("auth in middleware",autHeader)
  if ( !autHeader ) return res.status(401).json("Missing header.")
  const token = autHeader.split(" ")[1]
  if ( !token ) return res.status(401).json("Missing token.")
  console.log("token in middleware",token)
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET_KEY)
    const result = safeParse(userZodSchema, decoded)
    if (!result) return res.sendStatus(500)
    res.locals.user = result._id
    console.log("result in middleware", result)
    next()
  } catch (error) {
    console.log(error)
  }
}