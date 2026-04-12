"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { useUser, UserButton } from "@clerk/nextjs";

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);
  const { isSignedIn } = useUser();

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass-nav border-b border-outline-variant/20">
      <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link href="/">
          <Image src="/logo.png" alt="Le Dépôt" width={120} height={40} className="h-8 w-auto object-contain" priority />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-8">
          <Link
            href="/galerie"
            className="text-sm font-body font-medium text-on-surface-variant hover:text-on-surface transition-colors"
          >
            Galerie
          </Link>
          <Link href="/tendances" className="text-sm font-body font-medium text-on-surface-variant hover:text-on-surface transition-colors">
            Tendances
          </Link>
          <Link href="/a-propos" className="text-sm font-body font-medium text-on-surface-variant hover:text-on-surface transition-colors">
            À propos
          </Link>
          {isSignedIn && (
            <Link
              href="/mon-compte"
              className="text-sm font-body font-medium text-on-surface-variant hover:text-on-surface transition-colors"
            >
              Mon compte
            </Link>
          )}
        </nav>

        {/* CTA */}
        <div className="hidden md:flex items-center gap-4">
          {isSignedIn ? (
            <>
              <Link
                href="/soumettre"
                className="btn-gradient text-white text-sm font-label font-medium px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
              >
                Soumettre
              </Link>
              <UserButton />
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-body font-medium text-on-surface-variant hover:text-on-surface transition-colors"
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="btn-gradient text-white text-sm font-label font-medium px-5 py-2.5 rounded-xl transition-opacity hover:opacity-90"
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>

        {/* Mobile menu button */}
        <button
          className="md:hidden p-2 text-on-surface-variant"
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Menu"
        >
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current mb-1.5" />
          <div className="w-5 h-0.5 bg-current" />
        </button>
      </div>

      {/* Mobile menu */}
      {menuOpen && (
        <div className="md:hidden bg-surface-container-low px-6 pb-6 pt-2 flex flex-col gap-4">
          <Link
            href="/galerie"
            className="text-sm font-body text-on-surface-variant"
            onClick={() => setMenuOpen(false)}
          >
            Galerie
          </Link>
          <Link href="/tendances" className="text-sm font-body text-on-surface-variant" onClick={() => setMenuOpen(false)}>
            Tendances
          </Link>
          <Link href="/a-propos" className="text-sm font-body text-on-surface-variant" onClick={() => setMenuOpen(false)}>
            À propos
          </Link>
          {isSignedIn ? (
            <>
              <Link
                href="/mon-compte"
                className="text-sm font-body text-on-surface-variant"
                onClick={() => setMenuOpen(false)}
              >
                Mon compte
              </Link>
              <Link
                href="/soumettre"
                className="btn-gradient text-white text-sm font-label font-medium px-5 py-2.5 rounded-xl text-center"
                onClick={() => setMenuOpen(false)}
              >
                Soumettre
              </Link>
            </>
          ) : (
            <>
              <Link
                href="/sign-in"
                className="text-sm font-body text-on-surface-variant"
                onClick={() => setMenuOpen(false)}
              >
                Connexion
              </Link>
              <Link
                href="/sign-up"
                className="btn-gradient text-white text-sm font-label font-medium px-5 py-2.5 rounded-xl text-center"
                onClick={() => setMenuOpen(false)}
              >
                S&apos;inscrire
              </Link>
            </>
          )}
        </div>
      )}
    </header>
  );
}
