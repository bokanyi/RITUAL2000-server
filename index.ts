import dotenv from "dotenv"
dotenv.config()
import app from "./app"
import mongoose from "mongoose"


const mongoUrl = process.env.MONGO_URL as string
const port = process.env.PORT

const connectDB = async () => {
    try {
        await mongoose.connect(mongoUrl)
        console.log("MongoDB connected")
    } catch (error) {
        console.log(error)
    }
}

connectDB()


app.listen(port, ()=> { console.log(`⚡️ Server is running at http://localhost:${port}`)})