"use client";

import { useSession, signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";

export function CtaButton() {
  const { data: session } = useSession();
  const router = useRouter();

  function handleClick() {
    if (session?.user?.email) {
      router.push("/plan");
    } else {
      signIn("google");
    }
  }

  return (
    <button
      onClick={handleClick}
      className="inline-flex items-center gap-2 rounded-xl bg-signal px-8 py-4 font-display text-base font-semibold text-ink transition-colors hover:bg-[#bef264]"
    >
      Start Building
      <ArrowRight className="h-5 w-5" />
    </button>
  );
}
