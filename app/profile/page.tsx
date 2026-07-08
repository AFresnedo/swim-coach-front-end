import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="min-h-full flex items-center justify-center px-6 py-24 bg-gradient-to-br from-sky-200 via-cyan-200 to-teal-200 dark:from-slate-950 dark:via-slate-900 dark:to-slate-950">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-900 p-8 shadow-lg shadow-cyan-500/5">
        <h1 className="text-2xl font-bold text-slate-900 dark:text-slate-50 mb-1">Your profile</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mb-8">
          Tell us about yourself so we can personalize your training plan.
        </p>
        <ProfileForm />
      </div>
    </div>
  );
}
