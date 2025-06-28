"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Search,
  MoreHorizontal,
  Eye,
  EyeOff,
  Copy,
  Edit,
  Trash2,
  User,
  Lock,
  Globe,
  Calendar,
  AlertTriangle,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { decryptPassword } from "@/lib/encryption";
import { MasterPasswordModal } from "./master-password-modal";
import { PasswordStrengthIndicator } from "./password-strength-indicator";
import { EditPasswordDialog } from "./edit-password-dialog";

interface PasswordEntry {
  _id: string;
  title: string;
  username: string;
  encryptedPassword: string;
  website: string;
  category: string;
  notes: string;
  expiryDate?: string;
  createdAt: string;
  updatedAt: string;
}

interface PendingAction {
  type: "view" | "copy";
  passwordId: string;
  encryptedPassword: string;
}

export function PasswordList() {
  const [passwords, setPasswords] = useState<PasswordEntry[]>([]);
  const [filteredPasswords, setFilteredPasswords] = useState<PasswordEntry[]>(
    []
  );
  const [searchTerm, setSearchTerm] = useState("");
  const [visiblePasswords, setVisiblePasswords] = useState<Map<string, string>>(
    new Map()
  );
  const [isLoading, setIsLoading] = useState(true);
  const [showMasterPasswordModal, setShowMasterPasswordModal] = useState(false);
  const [pendingAction, setPendingAction] = useState<PendingAction | null>(
    null
  );
  const [editingPassword, setEditingPassword] = useState<PasswordEntry | null>(
    null
  );
  const [showEditDialog, setShowEditDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchPasswords();
  }, []);

  useEffect(() => {
    const filtered = passwords.filter(
      (password) =>
        password.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.website.toLowerCase().includes(searchTerm.toLowerCase()) ||
        password.category.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredPasswords(filtered);
  }, [passwords, searchTerm]);

  const fetchPasswords = async () => {
    try {
      const response = await fetch("/api/passwords");
      if (response.ok) {
        const data = await response.json();
        setPasswords(data);
      }
    } catch (error) {
      console.error("Failed to fetch passwords:", error);
      toast({
        title: "Error",
        description: "Failed to load passwords",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleMasterPasswordSubmit = async (masterPassword: string) => {
    if (!pendingAction) return;

    try {
      const decrypted = await decryptPassword(
        pendingAction.encryptedPassword,
        masterPassword
      );

      if (pendingAction.type === "view") {
        setVisiblePasswords((prev) => {
          const newMap = new Map(prev);
          if (newMap.has(pendingAction.passwordId)) {
            newMap.delete(pendingAction.passwordId);
          } else {
            newMap.set(pendingAction.passwordId, decrypted);
          }
          return newMap;
        });
      } else if (pendingAction.type === "copy") {
        await copyToClipboard(decrypted, "Password");
      }

      setPendingAction(null);
    } catch (error) {
      throw new Error("Invalid master password");
    }
  };

  const requestMasterPassword = (
    type: "view" | "copy",
    passwordId: string,
    encryptedPassword: string
  ) => {
    setPendingAction({ type, passwordId, encryptedPassword });
    setShowMasterPasswordModal(true);
  };

  const togglePasswordVisibility = (
    passwordId: string,
    encryptedPassword: string
  ) => {
    if (visiblePasswords.has(passwordId)) {
      // Hide password
      setVisiblePasswords((prev) => {
        const newMap = new Map(prev);
        newMap.delete(passwordId);
        return newMap;
      });
    } else {
      // Show password - request master password
      requestMasterPassword("view", passwordId, encryptedPassword);
    }
  };

  const copyToClipboard = async (text: string, type: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast({
        title: "Copied!",
        description: `${type} copied to clipboard`,
      });
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy to clipboard",
        variant: "destructive",
      });
    }
  };

  const copyPassword = (encryptedPassword: string) => {
    requestMasterPassword("copy", "", encryptedPassword);
  };

  const editPassword = (password: PasswordEntry) => {
    setEditingPassword(password);
    setShowEditDialog(true);
  };

  const deletePassword = async (passwordId: string) => {
    if (!confirm("Are you sure you want to delete this password?")) return;

    try {
      const response = await fetch(`/api/passwords/${passwordId}`, {
        method: "DELETE",
      });

      if (response.ok) {
        setPasswords((prev) => prev.filter((p) => p._id !== passwordId));
        setVisiblePasswords((prev) => {
          const newMap = new Map(prev);
          newMap.delete(passwordId);
          return newMap;
        });
        toast({
          title: "Success",
          description: "Password deleted successfully",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to delete password",
        variant: "destructive",
      });
    }
  };

  const isExpired = (expiryDate?: string) => {
    if (!expiryDate) return false;
    return new Date(expiryDate) < new Date();
  };

  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const expiry = new Date(expiryDate);
    const now = new Date();
    const daysUntilExpiry = Math.ceil(
      (expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysUntilExpiry <= 30 && daysUntilExpiry > 0;
  };

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Your Passwords</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="p-4 border rounded-lg animate-pulse">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mb-2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Your Passwords</CardTitle>
            <div className="relative w-64">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title, username, website..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          {filteredPasswords.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-muted-foreground">
                {passwords.length === 0
                  ? "No passwords saved yet"
                  : "No passwords match your search"}
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPasswords.map((password) => {
                const decryptedPassword = visiblePasswords.get(password._id);
                const expired = isExpired(password.expiryDate);
                const expiringSoon = isExpiringSoon(password.expiryDate);

                return (
                  <Card
                    key={password._id}
                    className={`hover:shadow-md transition-shadow ${
                      expired
                        ? "border-red-200 dark:border-red-800"
                        : expiringSoon
                        ? "border-yellow-200 dark:border-yellow-800"
                        : ""
                    }`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex-1">
                          <h3 className="font-semibold text-lg mb-1">
                            {password.title}
                          </h3>
                          <div className="flex items-center space-x-2">
                            <Badge variant="secondary" className="text-xs">
                              {password.category}
                            </Badge>
                            {expired && (
                              <Badge variant="destructive" className="text-xs">
                                Expired
                              </Badge>
                            )}
                            {expiringSoon && !expired && (
                              <Badge
                                variant="outline"
                                className="text-xs border-yellow-500 text-yellow-600"
                              >
                                Expires Soon
                              </Badge>
                            )}
                          </div>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0"
                            >
                              <MoreHorizontal className="h-4 w-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem
                              onClick={() => editPassword(password)}
                            >
                              <Edit className="mr-2 h-4 w-4" />
                              Edit
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() => deletePassword(password._id)}
                              className="text-red-600"
                            >
                              <Trash2 className="mr-2 h-4 w-4" />
                              Delete
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>

                      <div className="space-y-3">
                        {/* Website */}
                        {password.website && (
                          <div className="flex items-center space-x-2 text-sm text-muted-foreground">
                            <Globe className="h-4 w-4" />
                            <span className="truncate">{password.website}</span>
                          </div>
                        )}

                        {/* Username */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm truncate">
                              {password.username}
                            </span>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copyToClipboard(password.username, "Username")
                            }
                            className="h-8 w-8 p-0"
                            title="Copy username"
                          >
                            <Copy className="h-3 w-3" />
                          </Button>
                        </div>

                        {/* Password */}
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2 flex-1">
                            <Lock className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm font-mono">
                              {decryptedPassword
                                ? decryptedPassword
                                : "••••••••"}
                            </span>
                          </div>
                          <div className="flex space-x-1">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                togglePasswordVisibility(
                                  password._id,
                                  password.encryptedPassword
                                )
                              }
                              className="h-8 w-8 p-0"
                              title="Toggle password visibility"
                            >
                              {visiblePasswords.has(password._id) ? (
                                <EyeOff className="h-3 w-3" />
                              ) : (
                                <Eye className="h-3 w-3" />
                              )}
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() =>
                                copyPassword(password.encryptedPassword)
                              }
                              className="h-8 w-8 p-0"
                              title="Copy password"
                            >
                              <Copy className="h-3 w-3" />
                            </Button>
                          </div>
                        </div>

                        {/* Password Strength Indicator */}
                        {decryptedPassword && (
                          <PasswordStrengthIndicator
                            password={decryptedPassword}
                            className="mt-2"
                          />
                        )}

                        {/* Expiry Date */}
                        {password.expiryDate && (
                          <div
                            className={`flex items-center space-x-2 text-sm ${
                              expired
                                ? "text-red-600"
                                : expiringSoon
                                ? "text-yellow-600"
                                : "text-muted-foreground"
                            }`}
                          >
                            {expired || expiringSoon ? (
                              <AlertTriangle className="h-4 w-4" />
                            ) : (
                              <Calendar className="h-4 w-4" />
                            )}
                            <span>
                              {expired ? "Expired" : "Expires"}:{" "}
                              {new Date(
                                password.expiryDate
                              ).toLocaleDateString()}
                            </span>
                          </div>
                        )}

                        {/* Notes */}
                        {password.notes && (
                          <div className="text-xs text-muted-foreground bg-gray-50 dark:bg-gray-800 p-2 rounded">
                            {password.notes}
                          </div>
                        )}

                        {/* Date */}
                        <div className="text-xs text-muted-foreground pt-2 border-t">
                          Added{" "}
                          {new Date(password.createdAt).toLocaleDateString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </CardContent>
      </Card>

      <MasterPasswordModal
        open={showMasterPasswordModal}
        onOpenChange={setShowMasterPasswordModal}
        onSubmit={handleMasterPasswordSubmit}
        title="Enter Master Password"
        description={
          pendingAction?.type === "view"
            ? "Enter your master password to view this password"
            : "Enter your master password to copy this password"
        }
      />

      <EditPasswordDialog
        open={showEditDialog}
        onOpenChange={setShowEditDialog}
        password={editingPassword}
        onPasswordUpdated={fetchPasswords}
      />
    </>
  );
}
