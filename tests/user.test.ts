import dotenv from "dotenv"
dotenv.config({ path: ".env.test" })
import supertest from "supertest"
import app from "../app"
import { connect, disconnect, clear } from "./testdb"
import { User } from "../models/User"
import jwt from "jsonwebtoken";

const secretKey = process.env.JWT_SECRET_KEY;
if (!secretKey) throw "SecretKey is required.";

beforeAll(async () => await connect())
beforeEach(async () => await clear())
afterAll(async () => await disconnect())

const testApp = supertest(app)

describe("DELETE /api/user", () => {
  
    it("should delete the user and return 'Your account has benne deleted.", async () => {
      // given
      const user = await User.create({
        country: "HU",
        display_name: "ASD123",
        email: "user@email.asd",
        spotify: "1234asdf",
        spotifyId:"1234asdf",
        access_token: "1234asdf",
        refresh_token: "1234asdf",
      });
      const token = jwt.sign({
          display_name: user.display_name,
          email: user.email,
          spotifyId: user.spotifyId,
          spotify: user.spotify,
          _id: user?._id,   
      }, secretKey)
  
      const body = {user : user._id}
      // when
      const response = await testApp.delete(`/api/user/${user._id}`).set('Authorization', `Bearer ${token}`).send(body)
      // then
      expect(response.body).toBe(`Your account has benne deleted.`)
      expect(response.status).toBe(200)
    })
  
  })
  