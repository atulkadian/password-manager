import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Card } from "@/lib/models/Card";

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const card = await Card.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    });

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Card deleted successfully" });
  } catch (error) {
    console.error("Error deleting card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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

    await connectToDatabase();

    const card = await Card.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      {
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
        updatedAt: new Date(),
      },
      { new: true }
    );

    if (!card) {
      return NextResponse.json({ error: "Card not found" }, { status: 404 });
    }

    return NextResponse.json(card);
  } catch (error) {
    console.error("Error updating card:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
