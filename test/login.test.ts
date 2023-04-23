import dotenv from "dotenv"
dotenv.config({ path: ".env.test" })
import supertest from "supertest"
import app from "../app"
import { connect, disconnect, clear } from "./testdb"
import { User } from "../models/User"
jest.mock("../api/google")
// import { getIdToken } from "../api/google"

beforeAll(async () => await connect())
beforeEach(async () => await clear())
afterAll(async () => await disconnect())

/* 
const testApp = supertest(app)

describe("google login tests", () => {
  it("should return 401 when the code is wrong", async () => {
    // given
    const code = "as56df5w5a8d823djak"
    // when
    const response = await testApp.post("/api/login").send({code})
    // then
    const dbContent = await User.find()
    expect(dbContent).toHaveLength(0)
    expect(response.status).toBe(401)
  })

  it("should return 200 and get the token", async () => {
    // given
    const code = "as56df5w5a8d823djak"
    const token = "eyJhbGciOiJSUzI1NiIsImtpZCI6Ijk4NmVlOWEzYjc1MjBiNDk0ZGY1NGZlMzJlM2U1YzRjYTY4NWM4OWQiLCJ0eXAiOiJKV1QifQ.eyJpc3MiOiJodHRwczovL2FjY291bnRzLmdvb2dsZS5jb20iLCJhenAiOiI0MjIyMTY3ODA2NDYtcGdzM29zMXU0bzNhMG42bjdzY3A2NDd2N2JxaWJ0cm0uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJhdWQiOiI0MjIyMTY3ODA2NDYtcGdzM29zMXU0bzNhMG42bjdzY3A2NDd2N2JxaWJ0cm0uYXBwcy5nb29nbGV1c2VyY29udGVudC5jb20iLCJzdWIiOiIxMTYzMDEzNzAzNDY1NjcyNzg1NDciLCJlbWFpbCI6ImNpZmthdEBnbWFpbC5jb20iLCJlbWFpbF92ZXJpZmllZCI6dHJ1ZSwiYXRfaGFzaCI6IkNveDZNb2hKZUgxcFl2cmJ3VXpsX2ciLCJuYW1lIjoiS2F0YWxpbiBDemlmZmVyaSIsInBpY3R1cmUiOiJodHRwczovL2xoMy5nb29nbGV1c2VyY29udGVudC5jb20vYS9BR05teXhiZFdXVll6SmlMWGRDUjQtMTBoUjBhYmoxNGhmamotMmxDTEtwWFVuaz1zOTYtYyIsImdpdmVuX25hbWUiOiJLYXRhbGluIiwiZmFtaWx5X25hbWUiOiJDemlmZmVyaSIsImxvY2FsZSI6Imh1IiwiaWF0IjoxNjc5NjU3NDAwLCJleHAiOjE2Nzk2NjEwMDB9.D2M7y5Xh648J-LxRJHHGfMGtM7BTOWQLUTDUgLi3aW-VLRvsjTIxpN835FQXjssAhNHDqX9u1ZWKax9gDhsbWjWf_Fjjk3lYjN_EaQ0x2pAv8Ktm062CO0FE81YvnRZYmMjENuMEgKAaM-5oOtFYRlhaKg-KSdqtNGq1lGWiNDcbkbBeTIqeZV272GNn5jvOdC8oblBaVts-jj1VpOgYFWjkX8-tqJdEanTCk4yAX7bZJFY1ejG_TLOnOrrvlv5cllKZbAosIxSSAW146UAIGZ1wYmHLUrfYLrw19HnfOkZtWKQNQ43pvOdwvUMkXz8xl3zk24SDjj5neq1Necfzqg"
    const mockedGetIdToken = jest.mocked(getIdToken)
    mockedGetIdToken.mockReturnValueOnce(Promise.resolve(token))
    // when
    const response = await testApp.post("/api/login").send({code})
    // then
    const dbContent = await User.find()
    expect(dbContent).toHaveLength(1)
    expect(response.status).toBe(200)
  })
})

*/