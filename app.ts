import express, { Express } from "express";
import cors from "cors"
import login from './routes/login'

const app: Express = express()

app.use(express.json())
app.use(cors())

app.use("/api/login", login)

export default app