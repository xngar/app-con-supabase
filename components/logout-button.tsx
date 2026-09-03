"use client";

import { createClient } from "@/lib/supabase/client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { useState } from "react";

export function LogoutButton() {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const logout = async () => {
    setIsLoading(true);
    const supabase = createClient();
    try {
      await supabase.auth.signOut();
      router.push("/auth/login");
      router.refresh();
    } catch (e) {
      console.error("Error signing out:", e);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={logout}
      disabled={isLoading}
      className="gap-1.5 rounded-xl text-muted-foreground hover:text-destructive hover:border-destructive/30"
    >
      <LogOut className="h-4 w-4" />
      <span>Salir</span>
    </Button>
  );
}
