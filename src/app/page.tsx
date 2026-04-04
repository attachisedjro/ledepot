import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DernieresCampagnes from "@/components/home/DernieresCampagnes";
import CampagneDuJour from "@/components/home/CampagneDuJour";

const HOW_IT_WORKS = [
  {
    step: "01",
    titre: "Tu soumets",
    desc: "Tu partages une campagne que tu as créée : le visuel, la marque, et surtout l'idée derrière.",
  },
  {
    step: "02",
    titre: "Elle rejoint la bibliothèque",
    desc: "Ta campagne est publiée immédiatement et visible par tous les pros de la com du continent.",
  },
  {
    step: "03",
    titre: "Tout le monde s'en inspire",
    desc: "Un professionnel à Dakar trouve une campagne faite à Cotonou. Le niveau monte pour tout le monde.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
        <div>
          {/* Badge */}
          <span className="inline-flex items-center gap-2 bg-surface-container px-4 py-1.5 rounded-full text-xs font-label font-medium text-primary mb-8">
            <span className="w-1.5 h-1.5 rounded-full bg-primary-container inline-block" />
            La bibliothèque collaborative du contenu digital africain
          </span>

          {/* Headline */}
          <h1 className="font-headline font-bold text-5xl md:text-6xl text-on-surface leading-tight mb-6">
            Le contenu digital africain{" "}
            <span className="text-primary">mérite d&apos;être vu.</span>
          </h1>

          <p className="font-body text-lg text-on-surface-variant leading-relaxed mb-10 max-w-xl">
            Les marques africaines créent chaque jour des campagnes remarquables qui
            disparaissent dans le flux. Le Dépôt est là pour les garder,
            les valoriser et les partager.
          </p>

          {/* CTAs */}
          <div className="flex flex-wrap gap-4">
            <Link
              href="/galerie"
              className="btn-gradient text-white font-label font-medium px-7 py-3.5 rounded-xl transition-opacity hover:opacity-90 text-sm"
            >
              Explorer la bibliothèque
            </Link>
            <Link
              href="/soumettre"
              className="bg-surface-container text-on-surface font-label font-medium px-7 py-3.5 rounded-xl hover:bg-surface-container-high transition-colors text-sm"
            >
              Soumettre une campagne
            </Link>
          </div>

          <p className="text-xs font-body text-on-surface-variant mt-6">
            Accès libre · Inscription pour soumettre
          </p>
        </div>
        {/* Campagne du jour — colonne droite, visible seulement si épinglée */}
        <div className="hidden lg:block">
          <CampagneDuJour />
        </div>
        </div>
      </section>

      {/* Galerie preview */}
      <section className="bg-surface-container-low py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="flex items-end justify-between mb-10">
            <div>
              <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
                Dernières campagnes
              </h2>
              <p className="font-body text-on-surface-variant text-sm">
                Ce que les marques du continent ont créé récemment.
              </p>
            </div>
            <Link
              href="/galerie"
              className="text-sm font-label font-medium text-primary hover:opacity-75 transition-opacity hidden md:inline"
            >
              Voir tout →
            </Link>
          </div>

          <DernieresCampagnes />

          <div className="mt-8 text-center md:hidden">
            <Link href="/galerie" className="text-sm font-label font-medium text-primary">
              Voir toute la bibliothèque →
            </Link>
          </div>
        </div>
      </section>

      {/* Comment ça marche */}
      <section className="py-20 px-6 max-w-6xl mx-auto">
        <div className="mb-12">
          <h2 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Simple comme bonjour
          </h2>
          <p className="font-body text-on-surface-variant text-sm">
            Pas de friction, pas de validation. Tu soumets, ça paraît.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {HOW_IT_WORKS.map((item) => (
            <div key={item.step} className="bg-surface-container p-8 rounded-2xl">
              <span className="text-xs font-label font-medium text-primary mb-4 block">
                {item.step}
              </span>
              <h3 className="font-headline font-bold text-xl text-on-surface mb-3">
                {item.titre}
              </h3>
              <p className="font-body text-sm text-on-surface-variant leading-relaxed">
                {item.desc}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA final */}
      <section className="bg-surface-container-low py-20 px-6">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="font-headline font-bold text-4xl text-on-surface mb-4">
            Tu as créé quelque chose de bien.
          </h2>
          <p className="font-body text-on-surface-variant mb-8 leading-relaxed">
            Partage l&apos;idée derrière. Ton travail mérite d&apos;être vu par
            les pros de la com de tout le continent.
          </p>
          <Link
            href="/soumettre"
            className="btn-gradient text-white font-label font-medium px-8 py-4 rounded-xl text-sm hover:opacity-90 transition-opacity inline-block"
          >
            Soumettre ma première campagne
          </Link>
        </div>
      </section>

      {/* Footer */}
      <Footer />
    </div>
  );
}
