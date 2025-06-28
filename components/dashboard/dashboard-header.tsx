"use client";

import { useState } from "react";
import { signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "@/components/theme-toggle";
import { Shield, Settings, LogOut, Menu, CreditCard, Key } from "lucide-react";
import { AddPasswordDialog } from "./add-password-dialog";
import { AddCardDialog } from "./add-card-dialog";

interface DashboardHeaderProps {
  user: any;
}

export function DashboardHeader({ user }: DashboardHeaderProps) {
  const [showAddPasswordDialog, setShowAddPasswordDialog] = useState(false);
  const [showAddCardDialog, setShowAddCardDialog] = useState(false);

  const handleSignOut = () => {
    signOut({ callbackUrl: "/" });
  };

  return (
    <header className="bg-white dark:bg-card border-b border-gray-200 dark:border-border">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Shield className="h-6 w-6 md:h-8 md:w-8" />
              <span className="text-lg md:text-xl font-bold">SecureVault</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 md:space-x-4">
            {/* Add Buttons - Hidden on mobile, shown in dropdown */}
            <div className="hidden md:flex space-x-2">
              <Button
                onClick={() => setShowAddPasswordDialog(true)}
                variant="outline"
              >
                <Key className="h-4 w-4 mr-2" />
                Add Password
              </Button>
              <Button onClick={() => setShowAddCardDialog(true)}>
                <CreditCard className="h-4 w-4 mr-2" />
                Add Card
              </Button>
            </div>

            {/* Theme Toggle - Hidden on mobile */}
            <div className="hidden md:block">
              <ThemeToggle />
            </div>

            {/* Mobile Menu */}
            <div className="md:hidden">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <Menu className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48">
                  <DropdownMenuItem
                    onClick={() => setShowAddPasswordDialog(true)}
                  >
                    <Key className="mr-2 h-4 w-4" />
                    Add Password
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => setShowAddCardDialog(true)}>
                    <CreditCard className="mr-2 h-4 w-4" />
                    Add Card
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    Settings
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Desktop User Menu */}
            <div className="hidden md:block">
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="ghost"
                    className="relative h-8 w-8 rounded-full"
                  >
                    <Avatar className="h-8 w-8">
                      <AvatarImage
                        src={user?.image || "/placeholder.svg"}
                        alt={user?.name}
                      />
                      <AvatarFallback>
                        {user?.name?.charAt(0)?.toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">
                        {user?.name}
                      </p>
                      <p className="text-xs leading-none text-muted-foreground">
                        {user?.email}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <Settings className="mr-2 h-4 w-4" />
                    <span>Settings</span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>

            {/* Mobile User Avatar */}
            <div className="md:hidden">
              <Avatar className="h-8 w-8">
                <AvatarImage
                  src={user?.image || "/placeholder.svg"}
                  alt={user?.name}
                />
                <AvatarFallback>
                  {user?.name?.charAt(0)?.toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
          </div>
        </div>
      </div>

      <AddPasswordDialog
        open={showAddPasswordDialog}
        onOpenChange={setShowAddPasswordDialog}
      />
      <AddCardDialog
        open={showAddCardDialog}
        onOpenChange={setShowAddCardDialog}
      />
    </header>
  );
}
