"use client"

import { Progress } from "@/components/ui/progress"
import { Shield, ShieldAlert, ShieldCheck, ShieldX } from "lucide-react"

interface PasswordStrengthIndicatorProps {
  password: string
  className?: string
}

export function PasswordStrengthIndicator({ password, className }: PasswordStrengthIndicatorProps) {
  const calculateStrength = (password: string) => {
    if (!password) return { score: 0, label: "No password", color: "text-gray-400" }

    let score = 0
    const checks = {
      length: password.length >= 8,
      lowercase: /[a-z]/.test(password),
      uppercase: /[A-Z]/.test(password),
      numbers: /\d/.test(password),
      symbols: /[^A-Za-z0-9]/.test(password),
      longLength: password.length >= 12,
    }

    // Calculate score
    if (checks.length) score += 20
    if (checks.lowercase) score += 15
    if (checks.uppercase) score += 15
    if (checks.numbers) score += 15
    if (checks.symbols) score += 20
    if (checks.longLength) score += 15

    // Determine strength level
    if (score < 30) {
      return { score, label: "Very Weak", color: "text-red-500", bgColor: "bg-red-500" }
    } else if (score < 50) {
      return { score, label: "Weak", color: "text-orange-500", bgColor: "bg-orange-500" }
    } else if (score < 70) {
      return { score, label: "Fair", color: "text-yellow-500", bgColor: "bg-yellow-500" }
    } else if (score < 85) {
      return { score, label: "Good", color: "text-blue-500", bgColor: "bg-blue-500" }
    } else {
      return { score, label: "Strong", color: "text-green-500", bgColor: "bg-green-500" }
    }
  }

  const strength = calculateStrength(password)

  const getIcon = () => {
    if (strength.score < 30) return <ShieldX className="h-3 w-3" />
    if (strength.score < 50) return <ShieldAlert className="h-3 w-3" />
    if (strength.score < 85) return <Shield className="h-3 w-3" />
    return <ShieldCheck className="h-3 w-3" />
  }

  if (!password) return null

  return (
    <div className={`space-y-1 ${className}`}>
      <div className="flex items-center justify-between text-xs">
        <div className={`flex items-center space-x-1 ${strength.color}`}>
          {getIcon()}
          <span>Password Strength: {strength.label}</span>
        </div>
        <span className="text-muted-foreground">{strength.score}%</span>
      </div>
      <div className="relative">
        <Progress value={strength.score} className="h-1.5" />
        <div
          className={`absolute top-0 left-0 h-full rounded-full transition-all ${strength.bgColor}`}
          style={{ width: `${strength.score}%` }}
        />
      </div>
    </div>
  )
}
