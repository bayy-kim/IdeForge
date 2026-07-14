"use client";

import Link from "next/link";
import { BookOpen, MessageSquare, FileText, Code } from "lucide-react";
import { useSession, signOut } from "next-auth/react";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";
import { LoginPopover } from "@/components/login-popover";

const dockItems = [
  { title: "Plan", icon: MessageSquare, href: "/plan" },
  { title: "Panduan", icon: BookOpen, href: "/panduanpenggunaan" },
  { title: "PRD", icon: FileText, href: "/plan" },
  { title: "Prompt", icon: Code, href: "/plan" },
];

export function HomeNavbar() {
  const { data: session } = useSession();
  const isLoggedIn = !!session?.user?.email;

  return (
    <header className="border-b border-line bg-ink/80 backdrop-blur-sm">
      <div className="mx-auto flex max-w-5xl items-center justify-between px-6 py-4">
        <Link href="/" className="font-display text-lg font-bold tracking-tight text-paper">
          idē<span className="text-signal">forge</span>
        </Link>

        <div className="flex items-center gap-4">
          <Dock className="items-end pb-3" panelHeight={48}>
            {dockItems.map((item) => (
              <Link key={item.title} href={item.href}>
                <DockItem className="aspect-square rounded-full bg-ink-raised-2">
                  <DockLabel>{item.title}</DockLabel>
                  <DockIcon>
                    <item.icon className="h-4 w-4 text-paper" />
                  </DockIcon>
                </DockItem>
              </Link>
            ))}
          </Dock>

          {isLoggedIn ? (
            <button
              onClick={() => signOut({ callbackUrl: "/" })}
              className="shrink-0 rounded-full border border-line px-3 py-1.5 font-mono text-xs text-muted transition-colors hover:border-danger/40 hover:text-danger"
            >
              Logout
            </button>
          ) : (
            <LoginPopover />
          )}
        </div>
      </div>
    </header>
  );
}
