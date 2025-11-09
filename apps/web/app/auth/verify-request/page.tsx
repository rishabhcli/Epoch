import { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Check your email",
  description: "A sign in link has been sent to your email address",
};

export default function VerifyRequestPage() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12 dark:bg-gray-900 sm:px-6 lg:px-8">
      <div className="w-full max-w-md space-y-8 text-center">
        <div>
          <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 dark:bg-blue-900">
            <svg
              className="h-8 w-8 text-blue-600 dark:text-blue-400"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
              />
            </svg>
          </div>
          <h1 className="mt-6 text-3xl font-bold tracking-tight">
            Check your email
          </h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            A sign in link has been sent to your email address.
          </p>
        </div>

        <div className="rounded-lg bg-gray-100 p-6 dark:bg-gray-800">
          <p className="text-sm text-gray-600 dark:text-gray-400">
            Click the link in the email to sign in to your account. The link
            will expire in 24 hours.
          </p>
        </div>

        <div className="text-sm">
          <Link
            href="/auth/signin"
            className="font-medium text-blue-600 hover:text-blue-500 dark:text-blue-400"
          >
            Back to sign in
          </Link>
        </div>
      </div>
    </div>
  );
}
