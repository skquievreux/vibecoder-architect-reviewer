"use client";

import { signIn } from "next-auth/react";
import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Card, Title, Text, TextInput, Button } from "@tremor/react";
import { Github, LogIn } from "lucide-react";

import { Suspense } from "react";

function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // ... (rest of the component logic)

  // NOTE: Logic is preserved, just wrapped.
  const callbackUrl = searchParams.get("callbackUrl") || "/";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleCredentialsSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const result = await signIn("credentials", {
        email,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid email or password");
      } else {
        router.push(callbackUrl);
        router.refresh();
      }
    } catch (error) {
      setError("An error occurred. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const handleGithubSignIn = async () => {
    setIsLoading(true);
    await signIn("github", { callbackUrl });
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900 px-4">
      <Card className="max-w-md w-full">
        <div className="text-center mb-6">
          <Title className="text-2xl font-bold">VibeCoder Architect</Title>
          <Text className="mt-2">Sign in to your account</Text>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
            <Text className="text-red-800">{error}</Text>
          </div>
        )}

        <form onSubmit={handleCredentialsSignIn} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-medium mb-2">
              Email
            </label>
            <TextInput
              id="email"
              type="email"
              placeholder="your@email.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium mb-2">
              Password
            </label>
            <TextInput
              id="password"
              type="password"
              placeholder="••••••••"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </div>

          <Button
            type="submit"
            className="w-full"
            disabled={isLoading}
            icon={LogIn}
          >
            {isLoading ? "Signing in..." : "Sign in with Email"}
          </Button>
        </form>

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white dark:bg-gray-800 text-gray-500">
              Or continue with
            </span>
          </div>
        </div>

        <Button
          onClick={handleGithubSignIn}
          variant="secondary"
          className="w-full"
          disabled={isLoading}
          icon={Github}
        >
          Sign in with GitHub
        </Button>

        <Text className="mt-6 text-center text-sm text-gray-600">
          Don&apos;t have an account? Contact your administrator.
        </Text>
      </Card>
    </div>
  );
}

export default function SignInPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <SignInForm />
    </Suspense>
  );
}
