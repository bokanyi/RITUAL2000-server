import { NextFunction, Request, Response } from 'express'
import jwt from "jsonwebtoken"

export const verifyToken = (req: Request, res: Response, next: NextFunction) => {
  const header = req.headers["authorization"]
  if ( !header ) return res.status(401).json("Missing header.")
  const token = header.split(" ")[1]
  if ( !token ) return res.status(401).json("Missing token.")
  const secretKey = process.env.JWT_SECRET_KEY as string

  try {
    const decoded = jwt.verify(token, secretKey) as jwt.JwtPayload
    res.locals.user = decoded._id
  } catch (error) {
    console.log(error)
  }
  next()
}