"use client";

import { useState } from "react";
import { ArrowRight } from "lucide-react";
import Link from "next/link";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import { useAuth } from "@/app/hooks/use-auth";
import { SignInModal } from "@/components/auth/sign-in-modal";

export const Heading = () => {
  const { isAuthenticated, isLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <div className="max-w-3xl space-y-4">
        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold">
          Your Ideas, Documents, & Plans. Unified. Welcome to{" "}
          <span className="underline">Jotion</span>
        </h1>
        <h3 className="text-base sm:text-xl md:text-2xl font-medium">
          Jotion is the connected workspace where <br />
          better, faster work happens.
        </h3>
        {isLoading && (
          <div className="w-full flex items-center justify-center">
            <Spinner size="lg" />
          </div>
        )}
        {isAuthenticated && !isLoading && (
          <Button asChild>
            <Link href="/documents">
              Enter Jotion
              <ArrowRight className="h-4 w-4 ml-2" />
            </Link>
          </Button>
        )}
        {!isAuthenticated && !isLoading && (
          <Button onClick={() => setShowSignIn(true)}>
            Get Jotion free
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        )}
      </div>
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
};