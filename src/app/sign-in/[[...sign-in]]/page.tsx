import { SignIn } from "@clerk/nextjs";

export default function SignInPage() {
  return (
    <div className="min-h-screen bg-surface flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <h1 className="font-headline font-bold text-3xl text-on-surface mb-2">
            Bon retour
          </h1>
          <p className="font-body text-sm text-on-surface-variant">
            Connecte-toi pour accéder à ton espace.
          </p>
        </div>
        <SignIn />
      </div>
    </div>
  );
}
