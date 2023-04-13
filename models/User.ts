import mongoose, { Schema, InferSchemaType } from "mongoose"

const userSchema = new Schema ({ 
    display_name: {type: String},
    email: {type: String},
    id: {type: String},
    access_token:  {type: String},
    refresh_token: {type: String},
})

export type UserType = InferSchemaType<typeof userSchema>
export const User = mongoose.model('User', userSchema)