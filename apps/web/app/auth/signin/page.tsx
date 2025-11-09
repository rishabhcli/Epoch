import { Metadata } from "next";
import { SignInForm } from "@/components/auth/signin-form";

export const metadata: Metadata = {
  title: "Sign In",
  description: "Sign in to your Epoch Pod account",
};

export default function SignInPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-4xl font-bold tracking-tight">Epoch Pod</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            Sign in to your account
          </p>
        </div>

        <SignInForm />

        <div className="text-center text-sm text-gray-600 dark:text-gray-400">
          <p>
            We&apos;ll send you a magic link to sign in without a password.
          </p>
        </div>
      </div>
    </div>
  );
}
