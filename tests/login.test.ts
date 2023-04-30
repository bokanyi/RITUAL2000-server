import dotenv from "dotenv"
dotenv.config({ path: ".env.test" })
import supertest from "supertest"
import app from "../app"
import { connect, disconnect, clear } from "./testdb"
import { User } from "../models/User"
jest.mock("../api/spotifyAuth") 
import { getAccessToken, spotifyApi } from "../api/spotifyAuth"


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


    const currentUserProfile = {
      body: {
        birthdate: "string",
        country: 'string',
        display_name: 'fake_user',
        email: 'hello@gmail.com',
        explicit_content: { filter_enabled: false, filter_locked: false },
        external_urls: {
          spotify: 'https://open.spotify.com/user/12345abcd'
        },
        followers: { href: null, total: 0 },
        href: 'https://api.spotify.com/v1/users/12345abcd',
        id: '12345abcd',
        images: [],
        product: 'premium',
        type: 'user' as const,
        uri: 'spotify:user:12345abcd'
      },
      headers: {
        'content-type': 'application/json; charset=utf-8',
        'cache-control': 'private, max-age=0',
        vary: 'Authorization',
        'x-robots-tag': 'noindex, nofollow',
        'access-control-allow-origin': '*',
        'access-control-allow-headers': 'Accept, App-Platform, Authorization, Content-Type, Origin, Retry-After, Spotify-App-Version, X-Cloud-Trace-Context, client-token, content-access-token',
        'access-control-allow-methods': 'GET, POST, OPTIONS, PUT, DELETE, PATCH',
        'access-control-allow-credentials': 'true',
        'access-control-max-age': '604800',
        'content-encoding': 'gzip',
        'strict-transport-security': 'max-age=31536000',
        'x-content-type-options': 'nosniff',
        date: 'Fri, 28 Apr 2023 18:42:08 GMT',
        server: 'envoy',
        via: 'HTTP/2 edgeproxy, 1.1 google',
        'alt-svc': 'h3=":443"; ma=2592000,h3-29=":443"; ma=2592000',
        connection: 'close',
        'transfer-encoding': 'chunked'
      },
      statusCode: 200
    }
    
    const mockedGetIdToken = jest.mocked(getAccessToken)
    mockedGetIdToken.mockReturnValueOnce(Promise.resolve(token))

    const mockedUser = jest.mocked((spotifyApi.getMe))
    mockedUser.mockReturnValueOnce(Promise.resolve(currentUserProfile))
  
    // when
    const response = await testApp.post("/api/login").send({code})
    // then
    const dbContent = await User.find()
    expect(dbContent).toHaveLength(1)
    expect(response.status).toBe(200)
  })
})
