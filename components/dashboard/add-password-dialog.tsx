"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { encryptPassword } from "@/lib/encryption"
import { PasswordGenerator } from "./password-generator"
import { MasterPasswordModal } from "./master-password-modal"
import { PasswordStrengthIndicator } from "./password-strength-indicator"
import { RefreshCw } from "lucide-react"

interface AddPasswordDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddPasswordDialog({ open, onOpenChange }: AddPasswordDialogProps) {
  const [formData, setFormData] = useState({
    title: "",
    username: "",
    password: "",
    website: "",
    category: "Personal",
    notes: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [showGenerator, setShowGenerator] = useState(false)
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false)
  const { toast } = useToast()

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setShowMasterPasswordModal(true)
  }

  const handleMasterPasswordSubmit = async (masterPassword: string) => {
    setIsLoading(true)

    try {
      const encryptedPassword = await encryptPassword(formData.password, masterPassword)

      const response = await fetch("/api/passwords", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ...formData,
          encryptedPassword,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save password")
      }

      toast({
        title: "Success",
        description: "Password saved successfully",
      })

      setFormData({
        title: "",
        username: "",
        password: "",
        website: "",
        category: "Personal",
        notes: "",
      })
      onOpenChange(false)
      window.location.reload() // Refresh to show new password
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to save password",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setShowMasterPasswordModal(false)
    }
  }

  const handleGeneratedPassword = (password: string) => {
    setFormData((prev) => ({ ...prev, password }))
    setShowGenerator(false)
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Add New Password</DialogTitle>
            <DialogDescription>Add a new password entry to your vault</DialogDescription>
          </DialogHeader>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">Title</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleChange("title", e.target.value)}
                placeholder="e.g., Gmail Account"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="website">Website</Label>
              <Input
                id="website"
                value={formData.website}
                onChange={(e) => handleChange("website", e.target.value)}
                placeholder="e.g., https://gmail.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="username">Username/Email</Label>
              <Input
                id="username"
                value={formData.username}
                onChange={(e) => handleChange("username", e.target.value)}
                placeholder="e.g., john@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <div className="flex space-x-2">
                <Input
                  id="password"
                  type="password"
                  value={formData.password}
                  onChange={(e) => handleChange("password", e.target.value)}
                  placeholder="Enter password"
                  required
                />
                <Button type="button" variant="outline" size="icon" onClick={() => setShowGenerator(true)}>
                  <RefreshCw className="h-4 w-4" />
                </Button>
              </div>
              {formData.password && <PasswordStrengthIndicator password={formData.password} />}
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select value={formData.category} onValueChange={(value) => handleChange("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Personal">Personal</SelectItem>
                  <SelectItem value="Work">Work</SelectItem>
                  <SelectItem value="Finance">Finance</SelectItem>
                  <SelectItem value="Social">Social</SelectItem>
                  <SelectItem value="Shopping">Shopping</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="notes">Notes (Optional)</Label>
              <Textarea
                id="notes"
                value={formData.notes}
                onChange={(e) => handleChange("notes", e.target.value)}
                placeholder="Additional notes..."
                rows={3}
              />
            </div>

            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Password"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      <PasswordGenerator
        open={showGenerator}
        onOpenChange={setShowGenerator}
        onPasswordGenerated={handleGeneratedPassword}
      />

      <MasterPasswordModal
        open={showMasterPasswordModal}
        onOpenChange={setShowMasterPasswordModal}
        onSubmit={handleMasterPasswordSubmit}
        title="Encrypt Password"
        description="Enter your master password to encrypt and save this password"
      />
    </>
  )
}
