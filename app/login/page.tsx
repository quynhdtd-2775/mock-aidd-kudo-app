import type { Metadata } from "next";
import { LoginForm } from "./login-form";

export const metadata: Metadata = {
  title: "Log in",
};

export default function LoginPage() {
  return (
    <div className="flex flex-1 items-center justify-center bg-zinc-50 px-6 py-16 dark:bg-black">
      <div className="flex w-full max-w-sm flex-col gap-6 rounded-xl border border-zinc-200 bg-white p-8 dark:border-zinc-800 dark:bg-zinc-950">
        <div className="flex flex-col gap-1.5 text-center">
          <h1 className="text-2xl font-semibold text-zinc-950 dark:text-zinc-50">
            Log in
          </h1>
          <p className="text-sm text-zinc-600 dark:text-zinc-400">
            Enter your email and password to continue.
          </p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
