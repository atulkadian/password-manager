import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Password } from "@/lib/models/Password"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const passwords = await Password.find({ userId: session.user.id })

    // Calculate stats
    const totalPasswords = passwords.length
    const categories = new Set(passwords.map((p) => p.category)).size

    // For demo purposes, we'll simulate weak and reused password detection
    // In a real implementation, you'd decrypt and analyze passwords
    const weakPasswords = Math.floor(totalPasswords * 0.1) // 10% weak passwords
    const reusedPasswords = Math.floor(totalPasswords * 0.05) // 5% reused passwords

    return NextResponse.json({
      totalPasswords,
      weakPasswords,
      reusedPasswords,
      categories,
    })
  } catch (error) {
    console.error("Error fetching stats:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
