"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Slider } from "@/components/ui/slider"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Copy, RefreshCw } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { PasswordStrengthIndicator } from "./password-strength-indicator"

interface PasswordGeneratorProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  onPasswordGenerated: (password: string) => void
}

export function PasswordGenerator({ open, onOpenChange, onPasswordGenerated }: PasswordGeneratorProps) {
  const [password, setPassword] = useState("")
  const [length, setLength] = useState([16])
  const [options, setOptions] = useState({
    uppercase: true,
    lowercase: true,
    numbers: true,
    symbols: true,
    excludeSimilar: false,
  })
  const { toast } = useToast()

  const generatePassword = () => {
    let charset = ""

    if (options.lowercase) charset += "abcdefghijklmnopqrstuvwxyz"
    if (options.uppercase) charset += "ABCDEFGHIJKLMNOPQRSTUVWXYZ"
    if (options.numbers) charset += "0123456789"
    if (options.symbols) charset += "!@#$%^&*()_+-=[]{}|;:,.<>?"

    if (options.excludeSimilar) {
      charset = charset.replace(/[il1Lo0O]/g, "")
    }

    if (!charset) {
      toast({
        title: "Error",
        description: "Please select at least one character type",
        variant: "destructive",
      })
      return
    }

    let result = ""
    for (let i = 0; i < length[0]; i++) {
      result += charset.charAt(Math.floor(Math.random() * charset.length))
    }

    setPassword(result)
  }

  const copyPassword = async () => {
    try {
      await navigator.clipboard.writeText(password)
      toast({
        title: "Copied!",
        description: "Password copied to clipboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy password",
        variant: "destructive",
      })
    }
  }

  const handleUsePassword = () => {
    if (password) {
      onPasswordGenerated(password)
    }
  }

  const handleOptionChange = (option: keyof typeof options, checked: boolean) => {
    setOptions((prev) => ({ ...prev, [option]: checked }))
  }

  // Generate initial password when dialog opens
  useEffect(() => {
    if (open && !password) {
      generatePassword()
    }
  }, [open])

  // Regenerate password when options change
  useEffect(() => {
    if (password) {
      generatePassword()
    }
  }, [length, options])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Password Generator</DialogTitle>
          <DialogDescription>Generate a strong, secure password</DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          <div className="space-y-2">
            <Label>Generated Password</Label>
            <div className="flex space-x-2">
              <Input value={password} readOnly className="font-mono" placeholder="Click generate to create password" />
              <Button variant="outline" size="icon" onClick={copyPassword} disabled={!password}>
                <Copy className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={generatePassword}>
                <RefreshCw className="h-4 w-4" />
              </Button>
            </div>
            {password && <PasswordStrengthIndicator password={password} />}
          </div>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label>Length: {length[0]}</Label>
              <Slider value={length} onValueChange={setLength} max={50} min={4} step={1} className="w-full" />
            </div>

            <div className="space-y-3">
              <Label>Character Types</Label>
              <div className="space-y-2">
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="uppercase"
                    checked={options.uppercase}
                    onCheckedChange={(checked) => handleOptionChange("uppercase", checked as boolean)}
                  />
                  <Label htmlFor="uppercase">Uppercase (A-Z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="lowercase"
                    checked={options.lowercase}
                    onCheckedChange={(checked) => handleOptionChange("lowercase", checked as boolean)}
                  />
                  <Label htmlFor="lowercase">Lowercase (a-z)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="numbers"
                    checked={options.numbers}
                    onCheckedChange={(checked) => handleOptionChange("numbers", checked as boolean)}
                  />
                  <Label htmlFor="numbers">Numbers (0-9)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="symbols"
                    checked={options.symbols}
                    onCheckedChange={(checked) => handleOptionChange("symbols", checked as boolean)}
                  />
                  <Label htmlFor="symbols">Symbols (!@#$%^&*)</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="excludeSimilar"
                    checked={options.excludeSimilar}
                    onCheckedChange={(checked) => handleOptionChange("excludeSimilar", checked as boolean)}
                  />
                  <Label htmlFor="excludeSimilar">Exclude similar characters (il1Lo0O)</Label>
                </div>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleUsePassword} disabled={!password}>
            Use This Password
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
