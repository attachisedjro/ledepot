import { SignUp } from "@clerk/nextjs";

export default function SignUpPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Rejoins Le Dépôt
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Crée ton compte pour soumettre tes campagnes.
          </p>
        </div>
        <SignUp />
      </div>
    </div>
  );
}
