"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import Link from "next/link";
import { signOut, signIn } from "next-auth/react";
import { X, Menu, History, Settings, LogOut, Download, GitBranch, Plus, User, Check, ShieldAlert } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SidebarMenuProps {
  planId?: string;
  isLoggedIn: boolean;
  userEmail?: string | null;
  hasServerKey: boolean;
  localKey: string;
  onSaveKey: (key: string) => void;
  onPushGithub?: () => void;
}

export function SidebarMenu({
  planId,
  isLoggedIn,
  userEmail,
  hasServerKey,
  localKey,
  onSaveKey,
  onPushGithub,
}: SidebarMenuProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [tempKey, setTempKey] = useState(localKey);
  const [mounted, setMounted] = useState(false);
  const sidebarRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- standard mounted-check for portal SSR safety
    setMounted(true);
  }, []);

  // Reset tempKey whenever sidebar is opened so it reflects the latest localKey
  function handleOpen() {
    setTempKey(localKey);
    setIsOpen(true);
  }
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  // Handle click outside to close
  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (sidebarRef.current && !sidebarRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () => document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  function handleSaveKey() {
    onSaveKey(tempKey.trim());
    setShowApiKeyInput(false);
  }

  return (
    <>
      {/* Hamburger Trigger Button */}
      <button
        onClick={handleOpen}
        className="flex h-9 w-9 items-center justify-center rounded-xl border border-line text-muted hover:text-paper hover:bg-ink-raised transition-all duration-200"
        aria-label="Buka menu navigasi"
      >
        <Menu className="h-5 w-5" />
      </button>

      {/* Sidebar Backdrop + Panel — portaled to <body> so it always positions
          relative to the real viewport, not whatever ancestor happens to sit
          above it (e.g. the header's backdrop-blur, which otherwise silently
          traps position:fixed descendants and breaks this drawer). */}
      {mounted &&
        createPortal(
          <AnimatePresence>
            {isOpen && (
              <>
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={{ duration: 0.25 }}
                  className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                  ref={sidebarRef}
                  initial={{ x: "100%" }}
                  animate={{ x: 0 }}
                  exit={{ x: "100%" }}
                  transition={{ type: "spring", damping: 28, stiffness: 300 }}
                  className="fixed right-0 top-0 bottom-0 z-50 w-full max-w-[340px] border-l border-line bg-ink-raised shadow-2xl flex flex-col"
                >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-line px-5 py-4">
          <span className="font-display font-bold text-paper text-sm uppercase tracking-wider">
            Menu Navigasi
          </span>
          <button
            onClick={() => setIsOpen(false)}
            className="flex h-8 w-8 items-center justify-center rounded-lg border border-line text-muted hover:text-paper hover:bg-ink transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Content Wrapper */}
        <div className="flex-1 overflow-y-auto p-5 scrollbar-none flex flex-col gap-6">
          {/* User Profile Info */}
          <div className="rounded-xl border border-line bg-ink p-4 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-signal-dim border border-signal/20 text-signal">
              <User className="h-5 w-5" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="font-mono text-[10px] uppercase text-muted tracking-wider">
                Status Pengguna
              </p>
              {isLoggedIn ? (
                <p className="truncate text-xs font-semibold text-paper" title={userEmail || ""}>
                  {userEmail}
                </p>
              ) : (
                <button
                  onClick={() => signIn("google", { callbackUrl: window.location.href })}
                  className="text-left text-xs font-semibold text-signal hover:underline"
                >
                  Login ke Akun
                </button>
              )}
            </div>
          </div>

          {/* Quick Navigation links */}
          <div className="flex flex-col gap-1.5">
            <span className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1 px-1">
              Navigasi Cepat
            </span>
            {[
              { href: "/plan", icon: <Plus className="h-4 w-4 text-signal shrink-0" />, label: "Buat Plan Baru" },
              { href: "/history", icon: <History className="h-4 w-4 text-trace shrink-0" />, label: "Riwayat Rencana" },
              { href: "/apikeys", icon: <Settings className="h-4 w-4 text-muted shrink-0" />, label: "Pengaturan Lengkap" },
            ].map((item, i) => (
              <motion.div
                key={item.href}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 + i * 0.05, duration: 0.3, ease: [0.16, 1, 0.3, 1] }}
              >
                <Link
                  href={item.href}
                  onClick={() => setIsOpen(false)}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink hover:border-line transition-all"
                >
                  {item.icon}
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            ))}
          </div>

          {/* Project Actions (Download & GitHub) */}
          {planId && (
            <div className="flex flex-col gap-1.5 border-t border-line pt-5">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted mb-1 px-1">
                Aksi Project
              </span>
              <a
                href={`/api/plans/${planId}/download`}
                onClick={() => setIsOpen(false)}
                className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink hover:border-line transition-all"
              >
                <Download className="h-4 w-4 text-muted shrink-0" />
                <span>Download ZIP Project</span>
              </a>
              {onPushGithub && (
                <button
                  onClick={() => {
                    setIsOpen(false);
                    onPushGithub();
                  }}
                  className="flex items-center gap-3 rounded-lg border border-transparent px-3 py-2 text-xs font-mono text-muted hover:text-paper hover:bg-ink hover:border-line transition-all w-full text-left"
                >
                  <GitBranch className="h-4 w-4 text-muted shrink-0" />
                  <span>Push ke GitHub</span>
                </button>
              )}
            </div>
          )}

          {/* API Key Panel Inline */}
          <div className="flex flex-col gap-2 border-t border-line pt-5">
            <div className="flex items-center justify-between px-1">
              <span className="font-mono text-[9px] uppercase tracking-widest text-muted">
                Kunci API Gemini
              </span>
              <button
                onClick={() => setShowApiKeyInput(!showApiKeyInput)}
                className="text-[10px] text-signal hover:underline font-mono"
              >
                {showApiKeyInput ? "Sembunyikan" : "Ubah Key"}
              </button>
            </div>

            <div className="rounded-xl border border-line bg-ink p-4 flex flex-col gap-2.5">
              <div className="flex items-center gap-2 text-xs">
                {hasServerKey ? (
                  <>
                    <Check className="h-4 w-4 text-trace shrink-0" />
                    <span className="text-muted leading-tight">Menggunakan API Key bawaan Server.</span>
                  </>
                ) : localKey ? (
                  <>
                    <Check className="h-4 w-4 text-trace shrink-0" />
                    <span className="text-trace font-mono truncate max-w-[200px]" title={localKey}>
                      Key: {localKey.slice(0, 10)}...
                    </span>
                  </>
                ) : (
                  <>
                    <ShieldAlert className="h-4 w-4 text-danger shrink-0 animate-pulse" />
                    <span className="text-danger leading-tight font-medium">API Key Belum Diset</span>
                  </>
                )}
              </div>

              {showApiKeyInput && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className="flex flex-col gap-2 mt-1 overflow-hidden"
                >
                  <input
                    type="password"
                    placeholder="AIzaSy..."
                    value={tempKey}
                    onChange={(e) => setTempKey(e.target.value)}
                    className="w-full rounded border border-line bg-ink-raised px-3 py-2 text-xs text-paper focus:border-signal focus:outline-none font-mono"
                  />
                  <button
                    onClick={handleSaveKey}
                    className="w-full rounded bg-signal px-3 py-2 text-xs font-semibold text-ink hover:bg-[#bef264] transition-colors"
                  >
                    Simpan Key
                  </button>
                </motion.div>
              )}
            </div>
          </div>
        </div>

        {/* Footer with Logout */}
        {isLoggedIn && (
          <div className="border-t border-line p-5">
            <button
              onClick={() => {
                setIsOpen(false);
                signOut({ callbackUrl: "/" });
              }}
              className="flex w-full items-center justify-center gap-2 rounded-xl border border-danger/30 bg-danger/5 py-2.5 font-mono text-xs text-danger transition-colors hover:bg-danger/10"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout Akun</span>
            </button>
          </div>
        )}
            </motion.div>
              </>
            )}
          </AnimatePresence>,
          document.body,
        )}
    </>
  );
                                                   }
