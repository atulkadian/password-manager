import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { connectToDatabase } from "@/lib/mongodb"
import { Password } from "@/lib/models/Password"
import { rateLimit } from "@/lib/rate-limit"

export async function GET(request: NextRequest) {
  // CSV export if requested
  if (request.nextUrl.pathname.endsWith("/export") || request.headers.get("accept")?.includes("text/csv")) {
    try {
      const session = await getServerSession(authOptions)
      if (!session?.user || !(session.user as any).id) {
        return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
      }

      await connectToDatabase()
      const passwords = await Password.find({ userId: (session.user as any).id }).sort({ updatedAt: -1 }).select("-__v")

      // CSV header
      let csv = "title,username,website,category,notes,expiryDate,createdAt,updatedAt,encryptedPassword\n"
      for (const p of passwords) {
        csv += `"${p.title.replace(/"/g, '""')}","${p.username.replace(/"/g, '""')}","${(p.website||'').replace(/"/g, '""')}","${(p.category||'').replace(/"/g, '""')}","${(p.notes||'').replace(/"/g, '""')}","${p.expiryDate ? new Date(p.expiryDate).toISOString() : ''}","${new Date(p.createdAt).toISOString()}","${new Date(p.updatedAt).toISOString()}","${p.encryptedPassword.replace(/"/g, '""')}"\n`
      }
      return new Response(csv, {
        status: 200,
        headers: {
          "Content-Type": "text/csv",
          "Content-Disposition": "attachment; filename=securevault-passwords.csv"
        }
      })
    } catch (error) {
      console.error("Error exporting passwords as CSV:", error)
      return NextResponse.json({ error: "Internal server error" }, { status: 500 })
    }
  }

  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    await connectToDatabase()

    const passwords = await Password.find({ userId: (session.user as any).id }).sort({ updatedAt: -1 }).select("-__v")

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
    if (!session?.user || !(session.user as any).id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { title, username, encryptedPassword, website, category, notes } = await request.json()

    // Validation
    if (!title || !username || !encryptedPassword) {
      return NextResponse.json({ error: "Title, username, and password are required" }, { status: 400 })
    }

    await connectToDatabase()

    const password = await Password.create({
      userId: (session.user as any).id,
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
