import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-surface-container mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 mb-8">
          <Image src="/logo.png" alt="Le Dépôt" width={100} height={32} className="h-7 w-auto object-contain" />

          <nav className="flex flex-wrap gap-6">
            <Link href="/galerie" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
              Bibliothèque
            </Link>
            <Link href="/soumettre" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
              Soumettre
            </Link>
            <Link href="/a-propos" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
              À propos
            </Link>
            <Link href="/confidentialite" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
              Confidentialité
            </Link>
            <Link href="/sign-up" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
              S&apos;inscrire
            </Link>
          </nav>
        </div>

        <div className="border-t border-outline-variant/30 pt-6 flex flex-col md:flex-row items-center justify-between gap-3">
          <p className="text-xs font-body text-on-surface-variant">
            © {new Date().getFullYear()} Le Dépôt — Une initiative{" "}
            <a href="https://createevesafrica.com" target="_blank" rel="noopener noreferrer" className="text-primary hover:opacity-75 transition-opacity">
              Createeves Africa
            </a>
          </p>
          <p className="text-xs font-body text-on-surface-variant/60">
            Par les CMs, pour les CMs.
          </p>
        </div>
      </div>
    </footer>
  );
}
