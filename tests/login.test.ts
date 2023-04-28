import dotenv from "dotenv"
dotenv.config({ path: ".env.test" })
import supertest from "supertest"
import app from "../app"
import { connect, disconnect, clear } from "./testdb"
import { User } from "../models/User"
jest.mock("../api/spotifyAuth") 
import { getAccessToken, spotifyApi } from "../api/spotifyAuth"
// import SpotifyWebApi from 'spotify-web-api-node';


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

  
  it("should return 200 and get the token", async () => {
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
   

    //mockedUser.mockReturnValueOnce(Promise.resolve.CurrentUsersProfileResponse.body(currentUserProfile))
    // when
    const response = await testApp.post("/api/login").send({code})
    // then
    const dbContent = await User.find()
    expect(dbContent).toHaveLength(1)
    expect(response.status).toBe(200)
  })



})


/* 
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


/*
{
      body: {
        country: 'HU',
        display_name: 'Imre',
        email: 'bokanyimi@gmail.com',
        explicit_content: { filter_enabled: false, filter_locked: false },
        external_urls: {
          spotify: 'https://open.spotify.com/user/ri2p862rozmvd7mdzdoqnr4ow'
        },
        followers: { href: null, total: 0 },
        href: 'https://api.spotify.com/v1/users/ri2p862rozmvd7mdzdoqnr4ow',
        id: 'ri2p862rozmvd7mdzdoqnr4ow',
        images: [],
        product: 'premium',
        type: 'user',
        uri: 'spotify:user:ri2p862rozmvd7mdzdoqnr4ow'
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

    */