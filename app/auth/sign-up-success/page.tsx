import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { CheckCircle2, ArrowRight } from "lucide-react";

export default function Page() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-md">
        <Card className="border-border/50 bg-card/90 shadow-xl backdrop-blur-md text-center">
          <CardHeader className="space-y-2">
            <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <CheckCircle2 className="h-8 w-8" />
            </div>
            <CardTitle className="text-2xl font-bold tracking-tight">
              ¡Registro Exitoso!
            </CardTitle>
            <CardDescription className="text-sm">
              Tu cuenta ha sido creada correctamente en Supabase
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Si tu proyecto tiene confirmación de correo habilitada, por favor revisa tu bandeja de entrada para verificar tu cuenta. De lo contrario, ya puedes iniciar sesión o acceder al panel.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Button asChild className="w-full">
                <Link href="/auth/login">
                  Ir a Iniciar Sesión <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
