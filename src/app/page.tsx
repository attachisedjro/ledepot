import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

const FEATURED_CAMPAIGNS = [
  {
    id: "1",
    titre: "Renaissance Sahélienne",
    marque: "SAFTIKING",
    pays: "Sénégal",
    secteur: "Mode / Beauté",
    cm: "Amadou Diop",
    color: "#e8c49a",
  },
  {
    id: "2",
    titre: "FintechHorizon",
    marque: "FinPay",
    pays: "Côte d'Ivoire",
    secteur: "Banque / Finance",
    cm: "Mariama Koné",
    color: "#1c2a3a",
  },
  {
    id: "3",
    titre: "Galerie Nomade",
    marque: "ArtCo Dakar",
    pays: "Sénégal",
    secteur: "Médias",
    cm: "Fatou Sarr",
    color: "#8b5e3c",
  },
  {
    id: "4",
    titre: "Pulse Abidjan",
    marque: "BrassAbidjan",
    pays: "Côte d'Ivoire",
    secteur: "FMCG",
    cm: "Koffi Assi",
    color: "#2c3e50",
  },
];

const HOW_IT_WORKS = [
  {
    step: "01",
    titre: "Tu soumets",
    desc: "Tu partages une campagne que tu as créée : le visuel, la marque, et surtout l'idée derrière.",
  },
  {
    step: "02",
    titre: "Elle rejoint la bibliothèque",
    desc: "Ta campagne est publiée immédiatement et visible par tous les CMs du continent.",
  },
  {
    step: "03",
    titre: "Tout le monde s'en inspire",
    desc: "Un CM à Dakar trouve une campagne faite à Cotonou. Le niveau monte pour tout le monde.",
  },
];

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      {/* Hero */}
      <section className="pt-32 pb-20 px-6 max-w-6xl mx-auto">
        <div className="max-w-3xl">
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
            Les CMs africains créent chaque jour des campagnes remarquables qui
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
              href="/sign-up"
              className="bg-surface-container text-on-surface font-label font-medium px-7 py-3.5 rounded-xl hover:bg-surface-container-high transition-colors text-sm"
            >
              Soumettre une campagne
            </Link>
          </div>

          <p className="text-xs font-body text-on-surface-variant mt-6">
            Accès libre · Inscription pour soumettre
          </p>
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
                Ce que les CMs du continent ont créé récemment.
              </p>
            </div>
            <Link
              href="/galerie"
              className="text-sm font-label font-medium text-primary hover:opacity-75 transition-opacity hidden md:inline"
            >
              Voir tout →
            </Link>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {FEATURED_CAMPAIGNS.map((c) => (
              <article
                key={c.id}
                className="bg-surface-container-lowest rounded-2xl overflow-hidden shadow-card hover:shadow-ambient transition-shadow group cursor-pointer"
              >
                <div
                  className="w-full aspect-[4/5] flex items-end p-4"
                  style={{ backgroundColor: c.color }}
                >
                  <span className="text-white/80 text-xs font-label font-medium bg-black/20 px-2 py-1 rounded-full">
                    {c.pays}
                  </span>
                </div>
                <div className="p-4">
                  <p className="text-xs font-label text-on-surface-variant mb-1">
                    {c.marque} · {c.secteur}
                  </p>
                  <h3 className="font-headline font-bold text-base text-on-surface group-hover:text-primary transition-colors">
                    {c.titre}
                  </h3>
                  <p className="text-xs font-body text-on-surface-variant mt-2">
                    par {c.cm}
                  </p>
                </div>
              </article>
            ))}
          </div>

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
            les CMs de tout le continent.
          </p>
          <Link
            href="/sign-up"
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
