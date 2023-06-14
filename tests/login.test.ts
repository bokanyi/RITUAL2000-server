import dotenv from "dotenv"
dotenv.config({ path: ".env.test" })
import supertest from "supertest"
import app from "../app"
import { connect, disconnect, clear } from "./testdb"
import { User } from "../models/User"
jest.mock("../api/spotifyAuth") 
import { getAccessToken, getMe, spotifyApi } from "../api/spotifyAuth"


beforeAll(async () => await connect())
beforeEach(async () => await clear())
afterAll(async () => await disconnect())

const testApp = supertest(app)


describe("login tests", () => {
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

  
  it("should return 200 and save new user to the database", async () => {
    // given
    const code = "as56df5w5a8d823djak"
    const token = {
      access_token: 'BQAsYN9lCCLRZ46ASANcisJ_w60DvrphGVslvONZBFnhoPxJSZrjPD0DGwW6DK0Gfg6aF-aAmIYq_9yvHizibbl4U_7HDxZ-LxFx4j22L_cD11oRhhI_UQWhNds6oQLDDIXFwnfmJW706BXjhqDtPQBsn_A7Wszo-K2eOqHjML-DV_wysen7t1VXhlEUV7XYGIU82ayGb53_GCI4nlcRy397qQrrXRr3riMIkerAtn11ZQHeS9BMV4j-EP53oP3KCm1I1Xd2l4LpOg_vexcCImoLaelI8xWm',
      token_type: "Bearer",
      scope: 'playlist-read-private streaming playlist-modify-private playlist-modify-public user-read-email user-read-private',
      expires_in: 3600,
      refresh_token: 'AQBiuJar3LVS_1IMPD1m1IIKgGaMbnc4KjtARlxOIx2uq66yKjYEMgTU7spJWk-uSwYBtmjHwD0razWR0Vs_SwbQN6E0mhKGSV3obrtxTWbFpq0YRWKQvhw4n9jjxHyDtPo'
    }


    const currentUserProfile ={
      country: 'HU',
      display_name: 'Imre',
      email: 'bokanyimi@gmail.com',
      external_urls: {
        spotify: 'https://open.spotify.com/user/ri2p862rozmvd7mdzdoqnr4ow'
      },
      id: 'ri2p862rozmvd7mdzdoqnr4ow'
    }
    
    const mockedGetIdToken = jest.mocked(getAccessToken)
    mockedGetIdToken.mockReturnValueOnce(Promise.resolve(token))

    const mockedUser = jest.mocked(getMe)
    mockedUser.mockReturnValueOnce(Promise.resolve(currentUserProfile))
  
    // when
    const response = await testApp.post("/api/login").send({code})
    // then
    const dbContent = await User.find()
    expect(dbContent).toHaveLength(1)
    expect(response.status).toBe(200)
  })
})
