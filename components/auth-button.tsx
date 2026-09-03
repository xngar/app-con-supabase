import Link from "next/link";
import { Button } from "./ui/button";
import { createClient } from "@/lib/supabase/server";
import { LogoutButton } from "./logout-button";
import { LayoutDashboard, LogIn, UserPlus } from "lucide-react";

export async function AuthButton() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  return user ? (
    <div className="flex items-center gap-3">
      <Button asChild size="sm" variant="default" className="gap-1.5 rounded-xl shadow-sm">
        <Link href="/dashboard">
          <LayoutDashboard className="h-4 w-4" />
          <span>Dashboard</span>
        </Link>
      </Button>
      <LogoutButton />
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Button asChild size="sm" variant="outline" className="rounded-xl">
        <Link href="/auth/login" className="flex items-center gap-1.5">
          <LogIn className="h-4 w-4" />
          <span>Iniciar Sesión</span>
        </Link>
      </Button>
      <Button asChild size="sm" variant="default" className="rounded-xl shadow-sm">
        <Link href="/auth/sign-up" className="flex items-center gap-1.5">
          <UserPlus className="h-4 w-4" />
          <span>Registrarse</span>
        </Link>
      </Button>
    </div>
  );
}
