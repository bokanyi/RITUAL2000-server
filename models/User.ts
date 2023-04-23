import mongoose, { Schema, InferSchemaType } from "mongoose"

const userSchema = new Schema ({ 
    country: {type: String},
    display_name: {type: String},
    email: {type: String},
    spotify: {type: String},
    spotifyId: {type: String},
    access_token:  {type: String},
    refresh_token: {type: String},
})

export type UserType = InferSchemaType<typeof userSchema>
export const User = mongoose.model('User', userSchema)