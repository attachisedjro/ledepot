import Link from "next/link";
import Image from "next/image";

export default function Footer() {
  return (
    <footer className="bg-surface-container mt-24">
      <div className="max-w-6xl mx-auto px-6 py-12 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <Image src="/logo.png" alt="Le Dépôt" width={100} height={32} className="h-7 w-auto object-contain" />

        <nav className="flex flex-wrap gap-6">
          <Link href="/galerie" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
            Bibliothèque
          </Link>
          <Link href="/soumettre" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
            Soumettre
          </Link>
          <Link href="/sign-up" className="text-sm font-body text-on-surface-variant hover:text-on-surface transition-colors">
            S&apos;inscrire
          </Link>
        </nav>

        <p className="text-xs font-body text-on-surface-variant">
          © {new Date().getFullYear()} Createeves Africa
        </p>
      </div>
    </footer>
  );
}
