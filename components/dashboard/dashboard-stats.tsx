"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Shield, Key, AlertTriangle, Folder } from "lucide-react"

interface Stats {
  totalPasswords: number
  weakPasswords: number
  reusedPasswords: number
  categories: number
}

export function DashboardStats() {
  const [stats, setStats] = useState<Stats>({
    totalPasswords: 0,
    weakPasswords: 0,
    reusedPasswords: 0,
    categories: 0,
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    fetchStats()
  }, [])

  const fetchStats = async () => {
    try {
      const response = await fetch("/api/passwords/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const statCards = [
    {
      title: "Total Passwords",
      value: stats.totalPasswords,
      icon: Key,
      color: "text-blue-600 dark:text-blue-400",
    },
    {
      title: "Weak Passwords",
      value: stats.weakPasswords,
      icon: AlertTriangle,
      color: "text-red-600 dark:text-red-400",
    },
    {
      title: "Reused Passwords",
      value: stats.reusedPasswords,
      icon: Shield,
      color: "text-yellow-600 dark:text-yellow-400",
    },
    {
      title: "Categories",
      value: stats.categories,
      icon: Folder,
      color: "text-green-600 dark:text-green-400",
    },
  ]

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
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
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      {statCards.map((stat, index) => {
        const Icon = stat.icon
        return (
          <Card key={index}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <Icon className={`h-4 w-4 ${stat.color}`} />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
