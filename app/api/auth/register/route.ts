import { type NextRequest, NextResponse } from "next/server"
import bcrypt from "bcryptjs"
import { connectToDatabase } from "@/lib/mongodb"
import { User } from "@/lib/models/User"
import { rateLimit } from "@/lib/rate-limit"
import { generateSalt, hashMasterPassword } from "@/lib/encryption"

export async function POST(request: NextRequest) {
  // Rate limiting
  const rateLimitResult = rateLimit(request, 5, 15 * 60 * 1000) // 5 attempts per 15 minutes
  if (!rateLimitResult.success) {
    return NextResponse.json({ error: "Too many registration attempts. Please try again later." }, { status: 429 })
  }

  try {
    const { name, email, password, masterPassword } = await request.json()

    // Validation
    if (!name || !email || !password || !masterPassword) {
      return NextResponse.json({ error: "All fields are required" }, { status: 400 })
    }

    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    if (masterPassword.length < 12) {
      return NextResponse.json({ error: "Master password must be at least 12 characters long" }, { status: 400 })
    }

    await connectToDatabase()

    // Check if user already exists
    const existingUser = await User.findOne({ email })
    if (existingUser) {
      return NextResponse.json({ error: "User with this email already exists" }, { status: 400 })
    }

    // Hash passwords
    const hashedPassword = await bcrypt.hash(password, 12)
    const salt = generateSalt()
    const hashedMasterPassword = await hashMasterPassword(masterPassword, salt)

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      masterPasswordHash: salt + ":" + hashedMasterPassword,
      provider: "credentials",
    })

    return NextResponse.json({ message: "User created successfully", userId: user._id }, { status: 201 })
  } catch (error) {
    console.error("Registration error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
