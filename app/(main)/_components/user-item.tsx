"use client";

import { ChevronsLeftRight } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { auth } from "@/lib/firebase";
import { signOut } from "firebase/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

const UserItem = () => {
  const router = useRouter();
  const user = auth.currentUser;

  const handleSignOut = async () => {
    try {
      await signOut(auth);
      toast.success("Signed out successfully");
      router.push("/");
    } catch (error: any) {
      toast.error(error.message || "Failed to sign out");
    }
  };

  if (!user) return null;

  const getInitials = () => {
    if (user.displayName) {
      return user.displayName
        .split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);
    }
    return user.email?.[0]?.toUpperCase() || "U";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <div
          role="button"
          className="flex items-center text-sm p-3 w-full hover:bg-primary/5"
        >
          <div className="gap-x-2 flex items-center max-w-[150px]">
            <Avatar className="h-5 w-5">
              <AvatarImage src={user.photoURL || undefined} />
              <AvatarFallback>{getInitials()}</AvatarFallback>
            </Avatar>
            <span className="text-start font-medium line-clamp-1">
              {user.displayName || user.email}
            </span>
          </div>
          <ChevronsLeftRight className="rotate-90 ml-2 text-muted-foreground h-4 w-4" />
        </div>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-80 z-99999"
        align="start"
        alignOffset={11}
        forceMount
        side="right"
        sideOffset={8}
      >
        <div className="flex flex-col space-y-4 p-2">
          <p className="text-xs font-medium leading-none text-muted-foreground">
            {user.email}
          </p>
          <div className="flex items-center gap-x-2">
            <div className="rounded-md bg-secondary p-1">
              <Avatar className="h-8 w-8">
                <AvatarImage src={user.photoURL || undefined} />
                <AvatarFallback>{getInitials()}</AvatarFallback>
              </Avatar>
            </div>
            <div className="space-y-1">
              <p className="text-sm line-clamp-1">
                {user.displayName || "User"}
              </p>
            </div>
          </div>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          asChild
          className="w-full cursor-pointer text-muted-foreground"
        >
          <button onClick={handleSignOut} className="w-full text-left">
            Log out
          </button>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default UserItem;