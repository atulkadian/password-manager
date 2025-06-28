import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Password } from "@/lib/models/Password"

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const password = await Password.findOneAndDelete({
      _id: params.id,
      userId: session.user.id,
    })

    if (!password) {
      return NextResponse.json({ error: "Password not found" }, { status: 404 })
    }

    return NextResponse.json({ message: "Password deleted successfully" })
  } catch (error) {
    console.error("Error deleting password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function PUT(request: NextRequest, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, username, encryptedPassword, website, category, notes } = await request.json()

    await connectToDatabase()

    const password = await Password.findOneAndUpdate(
      { _id: params.id, userId: session.user.id },
      {
        title,
        username,
        encryptedPassword,
        website,
        category,
        notes,
        updatedAt: new Date(),
      },
      { new: true },
    )

    if (!password) {
      return NextResponse.json({ error: "Password not found" }, { status: 404 })
    }

    return NextResponse.json(password)
  } catch (error) {
    console.error("Error updating password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
