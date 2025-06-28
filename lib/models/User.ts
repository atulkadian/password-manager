import mongoose from "mongoose"

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },
  masterPasswordHash: {
    type: String,
    required: true,
  },
  image: {
    type: String,
  },
  provider: {
    type: String,
    enum: ["credentials"],
    default: "credentials",
  },
  twoFactorEnabled: {
    type: Boolean,
    default: false,
  },
  twoFactorSecret: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
})

UserSchema.index({ email: 1 })

export const User = mongoose.models.User || mongoose.model("User", UserSchema)
