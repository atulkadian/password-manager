"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Key, AlertTriangle, Folder, Calendar, CreditCard } from "lucide-react";

interface Stats {
  totalPasswords: number;
  weakPasswords: number;
  reusedPasswords: number;
  expiredPasswords: number;
  totalCards: number;
  expiredCards: number;
  categories: number;
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalPasswords: 0,
    weakPasswords: 0,
    reusedPasswords: 0,
    expiredPasswords: 0,
    totalCards: 0,
    expiredCards: 0,
    categories: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const [passwordsResponse, cardsResponse] = await Promise.all([
        fetch("/api/passwords/stats"),
        fetch("/api/cards/stats"),
      ]);

      const passwordsData = passwordsResponse.ok
        ? await passwordsResponse.json()
        : {};
      const cardsData = cardsResponse.ok ? await cardsResponse.json() : {};

      setStats({
        totalPasswords: passwordsData.totalPasswords || 0,
        weakPasswords: passwordsData.weakPasswords || 0,
        reusedPasswords: passwordsData.reusedPasswords || 0,
        expiredPasswords: passwordsData.expiredPasswords || 0,
        totalCards: cardsData.totalCards || 0,
        expiredCards: cardsData.expiredCards || 0,
        categories: passwordsData.categories || 0,
      });
    } catch (error) {
      console.error("Failed to fetch stats:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const statCards = [
    {
      title: "Total Passwords",
      value: stats.totalPasswords,
      icon: Key,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Total Cards",
      value: stats.totalCards,
      icon: CreditCard,
      color: "text-purple-600 dark:text-purple-400",
    },
    {
      title: "Weak Passwords",
      value: stats.weakPasswords,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Expired Items",
      value: stats.expiredPasswords + stats.expiredCards,
      icon: Calendar,
      color: "text-orange-600 dark:text-orange-400",
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: Folder,
      color: "text-green-600 dark:text-green-400",
    },
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        {[...Array(5)].map((_, i) => (
          <Card key={i}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-20"></div>
              <div className="h-4 w-4 bg-gray-200 dark:bg-gray-700 rounded animate-pulse"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded animate-pulse w-12"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon;
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {stat.title}
              </CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
