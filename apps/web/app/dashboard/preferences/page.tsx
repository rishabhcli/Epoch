import { Metadata } from "next";
import { auth } from "@/auth";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { PreferencesForm } from "@/components/preferences/preferences-form";

export const metadata: Metadata = {
  title: "Preferences",
  description: "Manage your Epoch Pod preferences",
};

export default async function PreferencesPage() {
  const session = await auth();

  if (!session?.user) {
    redirect("/auth/signin");
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    include: {
      subscription: true,
    },
  });

  if (!user) {
    redirect("/auth/signin");
  }

  // Parse preferences from JSON
  const preferences = (user.preferences as any) || {
    topics: [],
    emailCadence: "weekly",
    voiceConfig: {
      provider: "openai",
      voiceId: "alloy",
      model: "tts-1-hd",
      speed: 1.0,
    },
    episodeDuration: 1200,
    includeTranscripts: true,
    privateFeedEnabled: false,
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-white">
          Preferences
        </h1>
        <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
          Customize your podcast experience
        </p>
      </div>

      <PreferencesForm
        userId={user.id}
        initialPreferences={preferences}
        userEmail={user.email}
        feedToken={user.feedToken}
      />
    </div>
  );
}
