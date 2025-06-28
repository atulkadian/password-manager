import mongoose from "mongoose";

// Delete the existing model if it exists to prevent caching issues
if (mongoose.models.Card) {
  delete mongoose.models.Card;
}

const CardSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  cardName: {
    type: String,
    required: true,
  },
  encryptedCardNumber: {
    type: String,
    required: true,
  },
  expiryMonth: {
    type: String,
    required: true,
  },
  expiryYear: {
    type: String,
    required: true,
  },
  encryptedCVV: {
    type: String,
    required: true,
  },
  encryptedPIN: {
    type: String,
  },
  cardholderName: {
    type: String,
    required: true,
  },
  bankName: {
    type: String,
  },
  cardType: {
    type: String,
    enum: ["Credit", "Debit"],
    default: "Credit",
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
});

CardSchema.index({ userId: 1 });
CardSchema.index({ userId: 1, cardType: 1 });
CardSchema.index({ userId: 1, cardName: 1 });

export const Card = mongoose.model("Card", CardSchema);
