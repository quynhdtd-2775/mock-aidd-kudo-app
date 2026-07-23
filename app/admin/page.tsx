import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { getTranslations } from "next-intl/server";
import { resolveCurrentUserId } from "@/lib/profile/current-user";
import { getCurrentUserRole } from "@/lib/profile/profile-role-query";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Admin");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

// Placeholder admin dashboard (real dashboard out of scope — clarified in
// plan phase B4). Auth middleware already gates non-public paths; this
// server-side role check is defense-in-depth against non-admins hitting
// /admin directly.
export default async function AdminPage() {
  const t = await getTranslations("Admin");
  const userId = await resolveCurrentUserId();
  const role = userId ? await getCurrentUserRole(userId) : "user";

  if (role !== "admin") {
    redirect("/home-page-saa");
  }

  return (
    <div className="flex min-h-full w-full flex-col items-center justify-center bg-[#00101A] px-4 py-24 text-white">
      <h1 className="text-2xl font-bold">{t("heading")}</h1>
      <p className="mt-2 text-white/70">{t("placeholder")}</p>
    </div>
  );
}
