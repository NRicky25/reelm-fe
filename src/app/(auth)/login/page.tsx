import { AuthForm } from "@/components/ui/auth-form";

export const metadata = { title: "Sign in" };

export default function LoginPage() {
  return <AuthForm mode="login" />;
}
