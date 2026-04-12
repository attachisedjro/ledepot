import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";

export const metadata = {
  title: "Confidentialité & CGU — Le Dépôt",
  description: "Conditions générales d'utilisation et politique de confidentialité du Dépôt.",
};

export default function ConfidentialitePage() {
  return (
    <div className="min-h-screen bg-surface">
      <Navbar />

      <div className="pt-24 pb-16 px-6 max-w-3xl mx-auto">
        <div className="mb-10">
          <span className="inline-block text-xs font-label font-bold text-primary bg-primary/10 px-3 py-1 rounded-full mb-4 uppercase tracking-wider">
            Légal
          </span>
          <h1 className="font-headline font-bold text-4xl text-on-surface mb-4">
            Confidentialité & Conditions d&apos;utilisation
          </h1>
          <p className="text-sm font-body text-on-surface-variant">
            Dernière mise à jour : avril 2026
          </p>
        </div>

        <div className="space-y-10 font-body text-on-surface">

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">1. Présentation de la plateforme</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Le Dépôt est une bibliothèque collaborative du contenu digital africain, éditée par Createeves Africa. La plateforme permet aux community managers de partager leurs campagnes et aux utilisateurs de les consulter librement.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">2. Conditions d&apos;utilisation</h2>
            <div className="space-y-3 text-on-surface-variant leading-relaxed">
              <p>En utilisant Le Dépôt, tu acceptes les conditions suivantes :</p>
              <ul className="list-disc list-inside space-y-2 pl-2">
                <li>Ne soumettre que des contenus dont tu es l&apos;auteur ou pour lesquels tu as les droits nécessaires.</li>
                <li>Ne pas soumettre de contenu illégal, offensant, trompeur ou portant atteinte aux droits de tiers.</li>
                <li>Ne pas utiliser la plateforme à des fins commerciales non autorisées.</li>
                <li>Respecter les autres membres de la communauté.</li>
              </ul>
              <p>
                Createeves Africa se réserve le droit de retirer tout contenu ne respectant pas ces règles, sans préavis.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">3. Propriété intellectuelle</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Chaque contributeur reste propriétaire des contenus qu&apos;il soumet. En les déposant sur la plateforme, il accorde à Createeves Africa une licence non exclusive d&apos;affichage à des fins de référencement et de mise en valeur du contenu digital africain. Les contenus ne seront ni revendus ni utilisés à des fins commerciales sans accord préalable.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">4. Données personnelles</h2>
            <div className="space-y-3 text-on-surface-variant leading-relaxed">
              <p>
                Lors de la création d&apos;un compte, nous collectons les informations suivantes : prénom, nom, adresse e-mail. Ces données sont nécessaires au fonctionnement du service.
              </p>
              <p>
                Nous ne vendons ni ne partageons tes données personnelles avec des tiers à des fins commerciales.
              </p>
              <p>
                L&apos;authentification est gérée par <strong className="text-on-surface">Clerk</strong>, un service tiers sécurisé. Les données de connexion transitent par leurs serveurs conformément à leur propre politique de confidentialité.
              </p>
              <p>
                Tu peux à tout moment demander la suppression de ton compte et de tes données en nous contactant.
              </p>
            </div>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">5. Cookies</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Le Dépôt utilise des cookies techniques nécessaires au bon fonctionnement de la plateforme (session, authentification). Aucun cookie publicitaire ou de traçage n&apos;est utilisé.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">6. Limitation de responsabilité</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Le Dépôt est mis à disposition en l&apos;état. Createeves Africa ne saurait être tenu responsable des contenus soumis par les utilisateurs ni des dommages indirects liés à l&apos;utilisation de la plateforme.
            </p>
          </section>

          <section>
            <h2 className="font-headline font-bold text-xl text-on-surface mb-3">7. Contact</h2>
            <p className="text-on-surface-variant leading-relaxed">
              Pour toute question relative à ces conditions ou à tes données personnelles, tu peux contacter Createeves Africa via{" "}
              <a
                href="https://createevesafrica.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary hover:opacity-75 transition-opacity"
              >
                createevesafrica.com
              </a>.
            </p>
          </section>

        </div>
      </div>

      <Footer />
    </div>
  );
}
