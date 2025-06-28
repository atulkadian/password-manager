import { type NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { connectToDatabase } from "@/lib/mongodb";
import { Card } from "@/lib/models/Card";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectToDatabase();

    const cards = await Card.find({ userId: session.user.id });

    // Calculate stats
    const totalCards = cards.length;

    // Calculate expired cards
    const now = new Date();
    const expiredCards = cards.filter((card) => {
      const expiry = new Date(
        Number.parseInt(card.expiryYear),
        Number.parseInt(card.expiryMonth) - 1
      );
      return expiry < now;
    }).length;

    return NextResponse.json({
      totalCards,
      expiredCards,
    });
  } catch (error) {
    console.error("Error fetching card stats:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
