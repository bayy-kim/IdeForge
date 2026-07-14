"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface StepNavProps {
  prevLabel?: string;
  prevHref?: string;
  nextLabel?: string;
  nextDisabled?: boolean;
  nextLoading?: boolean;
  onNext?: () => void;
}

export function StepNav({
  prevLabel,
  prevHref,
  nextLabel,
  nextDisabled,
  nextLoading,
  onNext,
}: StepNavProps) {
  return (
    <div className="sticky bottom-0 z-40 mt-8 border-t border-line bg-ink/90 backdrop-blur-sm">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-6 py-4">
        <div>
          {prevHref && (
            <Link
              href={prevHref}
              className="inline-flex items-center gap-1.5 font-mono text-xs text-muted transition-colors hover:text-paper"
            >
              <ChevronLeft className="h-4 w-4" />
              {prevLabel || "Sebelumnya"}
            </Link>
          )}
        </div>
        <div>
          {nextLabel && (
            <Button onClick={onNext} disabled={nextDisabled || nextLoading}>
              {nextLoading ? (
                <span className="inline-flex items-center gap-1.5">
                  <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  Memuat...
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5">
                  {nextLabel}
                  <ChevronRight className="h-4 w-4" />
                </span>
              )}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
