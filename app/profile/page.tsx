import ProfileForm from "@/components/ProfileForm";

export default function ProfilePage() {
  return (
    <div className="flex min-h-full items-center justify-center bg-page-gradient px-6 py-24">
      <div className="w-full max-w-sm rounded-2xl border border-slate-100 bg-white p-8 shadow-cyan-500/5 shadow-lg dark:border-slate-800 dark:bg-slate-900">
        <h1 className="mb-1 font-bold text-2xl text-slate-900 dark:text-slate-50">Your profile</h1>
        <p className="mb-8 text-slate-500 text-sm dark:text-slate-400">
          A few details about you, so we can tailor SwimCoach to you.
        </p>
        <ProfileForm />
      </div>
    </div>
  );
}
