import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { Button } from "@/components/ui/button"
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Shield, Lock, Key, Smartphone } from "lucide-react"

export default async function HomePage() {
  const session = await getServerSession(authOptions)

  if (session) {
    redirect("/dashboard")
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-800">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex justify-center mb-6">
            <div className="p-4 bg-black dark:bg-white rounded-full">
              <Shield className="h-12 w-12 text-white dark:text-black" />
            </div>
          </div>
          <h1 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">SecureVault</h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 max-w-2xl mx-auto">
            Your personal password manager with military-grade encryption. Keep all your passwords secure and accessible
            from anywhere.
          </p>
          <div className="flex gap-4 justify-center">
            <Button asChild size="lg">
              <Link href="/auth/register">Get Started</Link>
            </Button>
            <Button variant="outline" size="lg" asChild>
              <Link href="/auth/login">Sign In</Link>
            </Button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <Card>
            <CardHeader>
              <Lock className="h-8 w-8 mb-2" />
              <CardTitle>End-to-End Encryption</CardTitle>
              <CardDescription>
                Your passwords are encrypted on your device before being stored. We never see your data in plain text.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Key className="h-8 w-8 mb-2" />
              <CardTitle>Password Generator</CardTitle>
              <CardDescription>
                Generate strong, unique passwords with customizable options. Never reuse passwords again.
              </CardDescription>
            </CardHeader>
          </Card>

          <Card>
            <CardHeader>
              <Smartphone className="h-8 w-8 mb-2" />
              <CardTitle>Multi-Factor Auth</CardTitle>
              <CardDescription>
                Secure your account with TOTP-based two-factor authentication for an extra layer of protection.
              </CardDescription>
            </CardHeader>
          </Card>
        </div>
      </div>
    </div>
  )
}
