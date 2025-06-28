import { getServerSession } from "next-auth";
import { redirect } from "next/navigation";
import { authOptions } from "@/lib/auth";
import { DashboardHeader } from "@/components/dashboard/dashboard-header";
import { PasswordList } from "@/components/dashboard/password-list";
import { CardList } from "@/components/dashboard/card-list";
import { DashboardStats } from "@/components/dashboard/dashboard-stats";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Key, CreditCard } from "lucide-react";

export default async function DashboardPage() {
  const session = await getServerSession(authOptions);

  if (!session) {
    redirect("/auth/login");
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-background">
      <DashboardHeader user={session.user} />
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-foreground mb-2">
            Welcome back, {session.user?.name?.split(" ")[0]}
          </h1>
          <p className="text-gray-600 dark:text-muted-foreground">
            Manage your passwords and cards securely
          </p>
        </div>

        <DashboardStats />

        <Tabs defaultValue="passwords" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="passwords"
              className="flex items-center space-x-2"
            >
              <Key className="h-4 w-4" />
              <span>Passwords</span>
            </TabsTrigger>
            <TabsTrigger value="cards" className="flex items-center space-x-2">
              <CreditCard className="h-4 w-4" />
              <span>Cards</span>
            </TabsTrigger>
          </TabsList>
          <TabsContent value="passwords" className="mt-6">
            <PasswordList />
          </TabsContent>
          <TabsContent value="cards" className="mt-6">
            <CardList />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
