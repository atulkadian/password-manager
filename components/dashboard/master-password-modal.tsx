"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Eye, EyeOff, Lock, Shield } from "lucide-react"

interface MasterPasswordModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onSubmit: (password: string) => void
  title?: string
  description?: string
}

export function MasterPasswordModal({
  open,
  onOpenChange,
  onSubmit,
  title = "Enter Master Password",
  description = "Please enter your master password to continue",
}: MasterPasswordModalProps) {
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  // Reset state when modal opens/closes
  useEffect(() => {
    if (open) {
      setPassword("")
      setError("")
      setIsLoading(false)
      setShowPassword(false)
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!password.trim()) {
      setError("Master password is required")
      return
    }

    setIsLoading(true)
    setError("")

    try {
      await onSubmit(password)
      onOpenChange(false)
    } catch (error: any) {
      setError(error.message || "Invalid master password")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = () => {
    setPassword("")
    setError("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
            <Shield className="h-6 w-6 text-primary" />
          </div>
          <DialogTitle className="text-xl">{title}</DialogTitle>
          <DialogDescription className="text-center">{description}</DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="masterPassword" className="flex items-center space-x-2">
              <Lock className="h-4 w-4" />
              <span>Master Password</span>
            </Label>
            <div className="relative">
              <Input
                id="masterPassword"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Enter your master password"
                className="pr-10"
                autoFocus
                required
              />
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </Button>
            </div>
          </div>

          <DialogFooter className="flex-col space-y-2 sm:flex-row sm:space-y-0">
            <Button type="button" variant="outline" onClick={handleCancel} className="w-full sm:w-auto bg-transparent">
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading || !password.trim()} className="w-full sm:w-auto">
              {isLoading ? "Verifying..." : "Continue"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
