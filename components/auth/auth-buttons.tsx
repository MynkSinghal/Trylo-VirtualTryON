'use client';

import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/auth-context";
import { LogIn, LogOut, UserPlus } from "lucide-react";
import Link from "next/link";

export function AuthButtons() {
  const { user, signOut, loading } = useAuth();

  if (loading) return null;

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <Link href="/dashboard">
          <Button variant="ghost" className="text-gray-300 hover:text-white">
            Dashboard
          </Button>
        </Link>
        <Button 
          onClick={signOut}
          variant="ghost" 
          className="text-gray-300 hover:text-white"
        >
          <LogOut className="w-4 h-4 mr-2" />
          Sign Out
        </Button>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2">
      <Link href="/login">
        <Button variant="ghost" className="text-gray-300 hover:text-white">
          <LogIn className="w-4 h-4 mr-2" />
          Login
        </Button>
      </Link>
      <Link href="/signup">
        <Button variant="ghost" className="text-gray-300 hover:text-white">
          <UserPlus className="w-4 h-4 mr-2" />
          Sign Up
        </Button>
      </Link>
    </div>
  );
} 