"use client";

import { MessageSquare, Sparkles, FileText, Code, BookOpen, Settings } from "lucide-react";
import Link from "next/link";
import { Dock, DockIcon, DockItem, DockLabel } from "@/components/ui/dock";

const items = [
  { title: "Ceritain Ide", icon: MessageSquare, href: "/plan" },
  { title: "AI Rekomendasi", icon: Sparkles, href: "/plan" },
  { title: "PRD & Struktur", icon: FileText, href: "/plan" },
  { title: "Prompt Siap Pakai", icon: Code, href: "/plan" },
  { title: "Panduan", icon: BookOpen, href: "/panduanpenggunaan" },
  { title: "Pengaturan", icon: Settings, href: "/apikeys" },
];

export function DockDemo() {
  return (
    <div className="absolute bottom-2 left-1/2 max-w-full -translate-x-1/2">
      <Dock className="items-end pb-3">
        {items.map((item) => (
          <Link key={item.title} href={item.href}>
            <DockItem className="aspect-square rounded-full bg-ink-raised-2">
              <DockLabel>{item.title}</DockLabel>
              <DockIcon>
                <item.icon className="h-5 w-5 text-paper" />
              </DockIcon>
            </DockItem>
          </Link>
        ))}
      </Dock>
    </div>
  );
}
