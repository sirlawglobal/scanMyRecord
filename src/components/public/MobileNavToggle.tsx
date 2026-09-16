"use client";

import Link from "next/link";
import { useState } from "react";

type NavLink = { href: string; label: string };

export default function MobileNavToggle({ links }: { links: NavLink[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger / X button */}
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-label={open ? "Close menu" : "Open menu"}
        className="relative flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white transition hover:bg-white/10"
      >
        <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
        {/* Animated bars → X */}
        <span
          className={`absolute block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            open ? "top-1/2 -translate-y-1/2 rotate-45" : "top-[30%]"
          }`}
        />
        <span
          className={`absolute block h-0.5 rounded-full bg-current transition-all duration-300 ${
            open ? "w-0 opacity-0" : "top-1/2 w-5 -translate-y-1/2 opacity-100"
          }`}
        />
        <span
          className={`absolute block h-0.5 w-5 rounded-full bg-current transition-all duration-300 ${
            open ? "top-1/2 -translate-y-1/2 -rotate-45" : "bottom-[30%]"
          }`}
        />
      </button>

      {/* Overlay + drawer */}
      {open && (
        <>
          {/* Backdrop */}
          <div
            className="mobile-nav-overlay"
            onClick={() => setOpen(false)}
            aria-hidden="true"
          />

          {/* Sheet */}
          <div className="mobile-nav-sheet animate-fade-up">
            {/* Links */}
            <nav className="mt-2 flex flex-col gap-1">
              {links.map((link, i) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setOpen(false)}
                  style={{ animationDelay: `${i * 0.05}s` }}
                  className="animate-fade-up flex items-center gap-3 rounded-xl px-4 py-3.5 text-sm font-medium text-slate-200 transition hover:bg-white/[0.07] hover:text-white"
                >
                  <span className="h-1 w-1 rounded-full bg-gold-400 opacity-70" aria-hidden="true" />
                  {link.label}
                </Link>
              ))}
            </nav>

            <div className="mt-5 border-t border-white/10 pt-5">
              <Link
                href="/#fundraising"
                onClick={() => setOpen(false)}
                className="flex w-full items-center justify-center gap-2 rounded-full bg-gradient-to-r from-gold-500 to-gold-400 px-5 py-3.5 text-sm font-bold text-navy-950 shadow-lg shadow-gold-500/20 transition hover:from-gold-400 hover:to-gold-300"
              >
                Support the work
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
