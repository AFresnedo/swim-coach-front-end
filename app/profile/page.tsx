import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-24 bg-white dark:bg-zinc-950">
      <div className="w-full max-w-sm">
        <h1 className="text-2xl font-bold text-zinc-900 dark:text-zinc-50 mb-1">
          Your profile
        </h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mb-8">
          Tell us about yourself so we can personalize your training plan.
        </p>
        <ProfileForm />
      </div>
    </div>
  );
}
