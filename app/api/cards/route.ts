import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Card } from "@/lib/models/Card";
import { rateLimit } from "@/lib/rate-limit";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const cards = await Card.find({ userId: session.user.id })
      .sort({ updatedAt: -1 })
      .select("-__v");

    return NextResponse.json(cards);
  } catch (error) {
    console.error("Error fetching cards:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(request, 10, 60 * 1000); // 10 cards per minute
  if (!rateLimitResult.success) {
    return NextResponse.json(
      { error: "Too many requests. Please try again later." },
      { status: 429 }
    );
  }

  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const {
      cardName,
      encryptedCardNumber,
      expiryMonth,
      expiryYear,
      encryptedCVV,
      encryptedPIN,
      cardholderName,
      bankName,
      cardType,
      notes,
    } = await request.json();

    // Validation
    if (
      !cardName ||
      !encryptedCardNumber ||
      !expiryMonth ||
      !expiryYear ||
      !encryptedCVV ||
      !cardholderName
    ) {
      return NextResponse.json(
        { error: "Required fields are missing" },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const card = await Card.create({
      userId: session.user.id,
      cardName,
      encryptedCardNumber,
      expiryMonth,
      expiryYear,
      encryptedCVV,
      encryptedPIN: encryptedPIN || "",
      cardholderName,
      bankName: bankName || "",
      cardType: cardType || "Credit",
      notes: notes || "",
    });

    return NextResponse.json(card, { status: 201 });
  } catch (error) {
    console.error("Error creating card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
