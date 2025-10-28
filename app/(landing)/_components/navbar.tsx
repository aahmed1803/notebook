"use client";

import { useState } from "react";
import { useScrollTop } from "@/app/hooks/use-scroll-top";
import { cn } from "@/lib/utils";
import Logo from "./logo";
import { ModeToggle } from "@/components/mode-toggle";
import { useAuth } from "@/app/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/spinner";
import Link from "next/link";
import { SignInModal } from "@/components/auth/sign-in-modal";
import { UserButton } from "@/components/auth/user-button";

const Navbar = () => {
  const scrolled = useScrollTop();
  const { isAuthenticated, isLoading } = useAuth();
  const [showSignIn, setShowSignIn] = useState(false);

  return (
    <>
      <div
        className={cn(
          "z-50 bg-background dark:bg-[#1f1f1f] fixed top-0 flex items-center w-full p-6",
          scrolled && "border-b shadow-sm"
        )}
      >
        <Logo />
        <div
          className="md:ml-auto md:justify-end justify-between w-full flex 
        items-center gap-x-2"
        >
          <ModeToggle />
          {isLoading && <Spinner />}
          {!isAuthenticated && !isLoading && (
            <>
              <Button variant="ghost" size="sm" onClick={() => setShowSignIn(true)}>
                Log In
              </Button>
              <Button size="sm" onClick={() => setShowSignIn(true)}>
                Get Jotion Free
              </Button>
            </>
          )}
          {isAuthenticated && !isLoading && (
            <>
              <Button variant="ghost" size="sm" asChild>
                <Link href="/documents">Enter Jotion</Link>
              </Button>
              <UserButton afterSignOutUrl="/" />
            </>
          )}
        </div>
      </div>
      <SignInModal isOpen={showSignIn} onClose={() => setShowSignIn(false)} />
    </>
  );
};

export default Navbar;