import mongoose from "mongoose"

const PasswordSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  title: {
    type: String,
    required: true,
  },
  username: {
    type: String,
    required: true,
  },
  encryptedPassword: {
    type: String,
    required: true,
  },
  website: {
    type: String,
  },
  category: {
    type: String,
    enum: ["Personal", "Work", "Finance", "Social", "Shopping", "Other"],
    default: "Personal",
  },
  notes: {
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

PasswordSchema.index({ userId: 1 })
PasswordSchema.index({ userId: 1, category: 1 })
PasswordSchema.index({ userId: 1, title: 1 })

export const Password = mongoose.models.Password || mongoose.model("Password", PasswordSchema)
