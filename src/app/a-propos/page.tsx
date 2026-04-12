import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import Link from "next/link";

export const metadata = {
  title: "À propos — Le Dépôt",
  description: "Le Dépôt est une bibliothèque collaborative du contenu digital africain, portée par Createeves Africa.",
};

export default function AProposPage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-3xl mx-auto">
        <div className="mb-10">
          <span className="inline-block text-xs font-label font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            À propos
          </span>
          <h1 className="font-headline font-bold text-4xl text-on-surface mb-4 leading-tight">
            Le contenu digital africain mérite d&apos;être vu.
          </h1>
          <p className="font-body text-on-surface-variant text-lg leading-relaxed">
            Le Dépôt est une bibliothèque collaborative où les community managers africains déposent leurs meilleures campagnes. Pour s&apos;inspirer, référencer et valoriser ce qui se fait sur le continent.
          </p>
        </div>

        <div className="space-y-8 font-body text-on-surface">

          <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-card">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-4">Notre mission</h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              L&apos;Afrique produit chaque jour un contenu digital riche, créatif et ancré dans des réalités culturelles fortes. Pourtant, ce contenu reste largement invisible — non archivé, non valorisé, difficile à retrouver.
            </p>
            <p className="text-on-surface-variant leading-relaxed">
              Le Dépôt est né de ce constat. Notre objectif : créer la première bibliothèque de référence du contenu digital africain, accessible à tous, alimentée par ceux qui le créent au quotidien.
            </p>
          </section>

          <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-card">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-4">Comment ça marche</h2>
            <div className="space-y-4">
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-headline font-bold text-sm text-primary">01</span>
                </div>
                <div>
                  <p className="font-label font-medium text-on-surface">Soumettre</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">Un community manager soumet une campagne qu&apos;il a créée : titre, marque, visuel, pays, secteur, et l&apos;intention créative derrière.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-headline font-bold text-sm text-primary">02</span>
                </div>
                <div>
                  <p className="font-label font-medium text-on-surface">Publier</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">La campagne rejoint la bibliothèque, filtrée par pays, secteur, occasion, format et année.</p>
                </div>
              </div>
              <div className="flex gap-4">
                <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center flex-shrink-0">
                  <span className="font-headline font-bold text-sm text-primary">03</span>
                </div>
                <div>
                  <p className="font-label font-medium text-on-surface">Inspirer</p>
                  <p className="text-sm text-on-surface-variant mt-0.5">Tout le continent peut s&apos;en inspirer. Un CM à Dakar découvre une campagne de Cotonou. Le niveau monte partout.</p>
                </div>
              </div>
            </div>
          </section>

          <section className="bg-primary/5 rounded-2xl p-8 border border-primary/10">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-4">Porté par Createeves Africa</h2>
            <p className="text-on-surface-variant leading-relaxed mb-4">
              Le Dépôt est une initiative de <strong className="text-on-surface">Createeves Africa</strong>, une organisation dédiée à l&apos;accompagnement et à la valorisation des créatifs du continent africain.
            </p>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              Createeves Africa croit que les talents africains du digital méritent une visibilité, des outils adaptés et une communauté soudée. Le Dépôt est l&apos;un des projets concrets nés de cette conviction.
            </p>
            <a
              href="https://createevesafrica.com"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-sm font-label font-medium text-primary hover:opacity-75 transition-opacity"
            >
              Découvrir Createeves Africa →
            </a>
          </section>

          <section className="bg-surface-container-lowest rounded-2xl p-8 shadow-card">
            <h2 className="font-headline font-bold text-2xl text-on-surface mb-4">Rejoindre la communauté</h2>
            <p className="text-on-surface-variant leading-relaxed mb-6">
              Le Dépôt grandit grâce à chaque community manager qui contribue. Si tu crées du contenu digital pour des marques africaines, ta place est ici.
            </p>
            <div className="flex flex-wrap gap-3">
              <Link
                href="/sign-up"
                className="btn-gradient text-white font-label font-medium px-6 py-3 rounded-xl text-sm hover:opacity-90 transition-opacity"
              >
                Créer un compte
              </Link>
              <Link
                href="/galerie"
                className="bg-surface-container text-on-surface font-label font-medium px-6 py-3 rounded-xl text-sm hover:bg-surface-container-high transition-colors"
              >
                Explorer la bibliothèque
              </Link>
            </div>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
