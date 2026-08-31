import { Suspense } from "react";
import { LoginForm } from "./LoginForm";
import { ThemeToggle } from "@/components/hq/ThemeToggle";

export const metadata = {
  title: "Sign in — Studio dashboard",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="relative flex min-h-screen items-center justify-center bg-base px-4">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6">
        <ThemeToggle />
      </div>
      {/* LoginForm reads ?from= via useSearchParams, which needs a Suspense
          boundary to prerender rather than failing the build. */}
      <Suspense fallback={<p className="label-mono">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
