import express, { Express } from "express";
import cors from "cors"
import login from './routes/login'
import playlist from './routes/playlist'
import user from './routes/user'

const app: Express = express()

app.use(express.json())
app.use(cors())

app.use("/api/login", login)
app.use("/api/playlist", playlist)
app.use("/api/user", user)

export default app