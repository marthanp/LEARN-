"use client";

import { useClerk } from "@clerk/nextjs";
import type { ButtonHTMLAttributes } from "react";

export default function ClerkSignOutButton({
  children,
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement>) {
  const { signOut } = useClerk();

  return (
    <button
      {...props}
      type="button"
      onClick={() => void signOut({ redirectUrl: "/login" })}
    >
      {children}
    </button>
  );
}
