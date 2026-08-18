import { Suspense } from "react";
import { LoginForm } from "./LoginForm";

export const metadata = {
  title: "Pit Wall — Mahmoud HQ",
  robots: { index: false, follow: false },
};

export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-base px-4">
      {/* LoginForm reads ?from= via useSearchParams, which needs a Suspense
          boundary to prerender rather than failing the build. */}
      <Suspense fallback={<p className="label-mono">Loading…</p>}>
        <LoginForm />
      </Suspense>
    </div>
  );
}
