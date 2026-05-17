"use client";

import { RiLogoutBoxRLine, RiUserLine } from "@remixicon/react";
import { useRouter } from "next/navigation";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { authClient } from "@/lib/auth-client";

function getInitials(name: string | undefined | null): string {
  if (!name) return "?";
  const parts = name.trim().split(/\s+/);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.slice(0, 2).toUpperCase();
}

export function HeaderAuthNav() {
  const { data: session, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />;
  }

  if (session) {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger
          className="rounded-none focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
          aria-label="User menu"
        >
          <Avatar size="default">
            {session.user.image && (
              <AvatarImage
                src={session.user.image}
                alt={session.user.name ?? "User avatar"}
              />
            )}
            <AvatarFallback>{getInitials(session.user.name)}</AvatarFallback>
          </Avatar>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" sideOffset={8}>
          <DropdownMenuItem onClick={() => router.push("/profile")}>
            <RiUserLine size={14} />
            Profile
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem
            onClick={async () => {
              await authClient.signOut();
              router.push("/");
            }}
          >
            <RiLogoutBoxRLine size={14} />
            Sign out
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  }

  return (
    <Button onClick={() => router.push("/login")} size="default">
      Log in
    </Button>
  );
}
