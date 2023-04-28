import dotenv from "dotenv"
dotenv.config({ path: ".env.test" })
import supertest from "supertest"
import app from "../app"
import { connect, disconnect, clear } from "./testdb"
import { User } from "../models/User"
import { Playlist } from "../models/Playlist"

beforeAll(async () => await connect())
beforeEach(async () => await clear())
afterAll(async () => await disconnect())

const testApp = supertest(app)

describe("POST /api/playlist/recommendations", () => {
  it("should return status 401 when user data not sent and body is empty", async () => {
    // when
    const response = await testApp.post("/api/playlist/recommendations")
    // then
    expect(response.status).toBe(401)
  })
})

/*

describe("POST /api/playlist/recommendations", () => {
  it("should return status 401 when user data not sent and body is empty", async () => {
    //given
    const user = await User.create({ sub: "1234567", email: "test@user.com" })
    await Review.create({ user: user._id, movieId: "1234", message: "test" })
    // when
    const response = await testApp.post("/api/playlist/recommendations")
    // then
    expect(response.status).toBe(401)
  })
})


describe("POST /api/review", () => {
  it("should return status 400 when req body is empty", async () => {
    // when
    const response = await testApp.post("/api/review")
    // then
    expect(response.status).toBe(400)
  })

  it("should save the review to database", async () => {
    // given
    const user = await User.create({ sub: "1234567", email: "test@user.com" })
    const review = { user: user._id, movieId: "1234", message: "test" }
    // when
    const response = await testApp.post("/api/review").send(review)
    // then
    const dbContent = await Review.find()
    // expect(dbContent).toHaveLength(1)
    expect(response.body._id).toBeTruthy()
    expect(response.status).toBe(201)
  })

  it("should return status 400 when the req body is incomplete", async () => {
    // given
    const review = { movieId: "1234" }
    // when
    const response = await testApp.post("/api/review").send(review)
    // then
    expect(response.status).toBe(400)
  })
})

describe("GET /api/review/", () => {
  it("should return the review list of the movie", async () => {
    // given
    const user = await User.create({ sub: "1234567", email: "test@user.com" })
    await Review.create({ user: user._id, movieId: "1234", message: "test" })
    // when
    const response = await testApp.get("/api/review/movie/1234")
    // then
    expect(Array.isArray(response.body)).toBeTruthy()
    expect(response.body.length).toEqual(1)
    expect(response.body[0].message).toBe("test")
    expect(response.status).toBe(200)
  })

  it("should return the review list of the user", async () => {
    // given
    const user = await User.create({ sub: "1234567", email: "test@user.com" })
    await Review.create({ user: user._id, movieId: "1234", message: "test" })
    // when
    const response = await testApp.get(`/api/review/user/${user._id}`)
    // then
    expect(Array.isArray(response.body)).toBeTruthy()
    expect(response.body).toHaveLength(1)
    expect(response.body[0].message).toBe("test")
    expect(response.status).toBe(200)
  })
})

describe("DELETE /api/review/", () => {
  it("should delete the review and return 'Review deleted' message", async () => {
    // given
    const user = await User.create({ sub: "1234567", email: "test@user.com" })
    const review = await Review.create({ user: user._id, movieId: "1234", message: "test" })
    // when
    const response = await testApp.delete(`/api/review/${review._id}`)
    // then
    expect(response.body).toBe("Review deleted.")
    expect(response.status).toBe(200)
  })

  it("should return status 404 when the review not found in database", async () => {
    // when
    const response = await testApp.delete(`/api/review/123456789`)
    // then
    expect(response.body).toBe("Review not found.")
    expect(response.status).toBe(404)
  })
})

*/