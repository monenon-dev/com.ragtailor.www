import { UserPreferencesForm } from "@/components/settings/user-preferences-form";
import { UserWarningsBanner } from "@/components/settings/user-warnings-banner";

export default function SettingsPage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-8 dark:bg-gray-950 sm:px-6">
      <div className="mx-auto max-w-2xl">
        <UserWarningsBanner />
        <UserPreferencesForm showBackLink title="라이프스타일 선호도" />
      </div>
    </main>
  );
}
