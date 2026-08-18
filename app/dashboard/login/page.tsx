import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Pit Wall — Mahmoud HQ",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      <LoginForm />
    </div>
  );
}
