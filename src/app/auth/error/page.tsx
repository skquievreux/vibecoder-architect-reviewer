"use client";

import { useSearchParams } from "next/navigation";
import { Card, Title, Text, Button } from "@tremor/react";
import { AlertCircle, ArrowLeft } from "lucide-react";
import Link from "next/link";

const errorMessages: Record<string, string> = {
  Configuration: "There is a problem with the server configuration.",
  AccessDenied: "You do not have permission to sign in.",
  Verification: "The verification token has expired or has already been used.",
  OAuthSignin: "Error in constructing an authorization URL.",
  OAuthCallback: "Error in handling the response from an OAuth provider.",
  OAuthCreateAccount: "Could not create OAuth provider user in the database.",
  EmailCreateAccount: "Could not create email provider user in the database.",
  Callback: "Error in the OAuth callback handler route.",
  OAuthAccountNotLinked:
    "Email on the account is already linked, but not with this OAuth account.",
  EmailSignin: "Failed to send the verification email.",
  CredentialsSignin: "Sign in failed. Check the details you provided are correct.",
  SessionRequired: "Please sign in to access this page.",
  Default: "Unable to sign in.",
};

import { Suspense } from "react";

function AuthErrorContent() {
  const searchParams = useSearchParams();
  const error = searchParams.get("error");

  const errorMessage = error
    ? errorMessages[error] || errorMessages.Default
    : errorMessages.Default;

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-red-100 dark:bg-red-900/20">
            <AlertCircle className="h-6 w-6 text-red-600 dark:text-red-500" />
          </div>
          <Title className="mt-4 text-2xl font-bold">Authentication Error</Title>
          <Text className="mt-2 text-gray-600 dark:text-gray-400">
            {errorMessage}
          </Text>
        </div>

        <div className="mt-6 space-y-3">
          <Link href="/auth/signin" className="block">
            <Button variant="primary" className="w-full" icon={ArrowLeft}>
              Back to Sign In
            </Button>
          </Link>
          <Link href="/" className="block">
            <Button variant="secondary" className="w-full">
              Go to Homepage
            </Button>
          </Link>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-800 rounded-lg">
            <Text className="text-xs text-gray-600 dark:text-gray-400">
              Error code: {error}
            </Text>
          </div>
        )}
      </Card>
    </div>
  );
}

export default function AuthErrorPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <AuthErrorContent />
    </Suspense>
  );
}
