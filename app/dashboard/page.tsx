import { getServerSession } from "next-auth"
import { redirect } from "next/navigation"
import { authOptions } from "@/lib/auth"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { PasswordList } from "@/components/dashboard/password-list"
import { DashboardStats } from "@/components/dashboard/dashboard-stats"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session) {
    redirect("/auth/login")
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <DashboardHeader user={session.user} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            Welcome back, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-600 dark:text-gray-300">Manage your passwords securely</p>
        </div>

        <DashboardStats />
        <PasswordList />
      </div>
    </div>
  )
}
