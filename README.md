# PLAYLIST GENERATOR APP server

This is a Spotify based music playlist generator app, server side. Endpoints for login, get, create, delete playlists, and delete the user from the database. The server connect to a mongo database where user data and playlists are stored. The server communicate with the Spotity API to get account information, track recommendations, create playlist with the user settings, and get back data from the playlist.

## tools

Axios
Cors
Express
Jsonwebtoken
Zod
Spotify-web-api
Mongoose
MongoDB memory server
Jest
Supertest

### environment variables

MONGO_URL to connect a database
PORT 
JWT_SECRET_KEY 
CLIENT_ID we need to create a spotify app to get client id
CLIENT_SECRET we need to create a spotify app to get client secret
REDIRECT_URI=http://localhost:5173/login

