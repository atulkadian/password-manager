import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Password } from "@/lib/models/Password"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const passwords = await Password.find({ userId: session.user.id }).sort({ updatedAt: -1 }).select("-__v")

    return NextResponse.json(passwords)
  } catch (error) {
    console.error("Error fetching passwords:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(request, 20, 60 * 1000) // 20 passwords per minute
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many requests. Please try again later." }, { status: 429 })
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, username, encryptedPassword, website, category, notes } = await request.json()

    // Validation
    if (!title || !username || !encryptedPassword) {
      return NextResponse.json({ error: "Title, username, and password are required" }, { status: 400 })
    }

    await connectToDatabase()

    const password = await Password.create({
      userId: session.user.id,
      title,
      username,
      encryptedPassword,
      website: website || "",
      category: category || "Personal",
      notes: notes || "",
    })

    return NextResponse.json(password, { status: 201 })
  } catch (error) {
    console.error("Error creating password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
