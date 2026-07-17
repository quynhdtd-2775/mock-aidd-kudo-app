import type { Metadata } from "next";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/home-awards-page/site-header";
import { ProfileKeyvisual } from "@/components/profile/profile-keyvisual";
import { ProfileHeroSection } from "@/components/profile/profile-hero-section";
import { AwardsHeader } from "@/components/profile/awards-header";
import { ProfilePostsGrid } from "@/components/profile/profile-posts-grid";
import { ProfileFooter } from "@/components/profile/profile-footer";
import { DEMO_USER_ID, resolveCurrentUserId } from "@/lib/profile/current-user";
import { isMockProfileDataEnabled } from "@/lib/profile/mock-profile-data";
import {
  getIconCollection,
  getProfile,
  getProfileStats,
  getReceivedKudos,
} from "@/lib/profile/profile-queries";
import {
  toKudoPostCards,
  toProfileHeroProps,
} from "@/lib/profile/profile-view-mappers";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Profile");
  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
  };
}

// mm:362:5037 "Profile bản thân" (fileKey 9ypp4enmFmdK3YAFJLIu6C, screenId 3FoIx6ALVb)
// Server component: data comes from the local Supabase project via lib/profile.
export default async function ProfilePage() {
  const t = await getTranslations("Profile");
  // TODO(api): remove the DEMO_USER_ID fallback together with the mock data
  // source — it only exists so /profile renders without a login while the
  // backend isn't ready (MOCK_DATA=true in .env.local).
  const userId =
    (await resolveCurrentUserId()) ??
    (isMockProfileDataEnabled() ? DEMO_USER_ID : null);
  const profile = userId ? await getProfile(userId) : null;

  const [kudos, stats, icons] = profile
    ? await Promise.all([
        getReceivedKudos(profile.id),
        getProfileStats(profile.id),
        getIconCollection(profile.id),
      ])
    : [[], null, []];

  return (
    <div className="flex min-h-full w-full flex-col bg-[#00101A]">
      <div className="relative w-full">
        <ProfileKeyvisual />
        <div className="absolute left-0 top-0 w-full">
          <SiteHeader />
        </div>
      </div>

      {/* mm:362:5050 "Bìa" — centered 680px content column, negative margin
          pulls it up under the keyvisual gradient like the Figma layout. */}
      <main className="flex-1">
        <div className="mx-auto flex w-full max-w-[680px] flex-col gap-16 px-4 pb-16 pt-0 sm:px-0 lg:-mt-[328px]">
          {profile && stats ? (
            <>
              {/* mm:362:5051 (Frame 532) */}
              <ProfileHeroSection
                {...toProfileHeroProps(profile, stats, icons, {
                  collectionLinkLabel: t("iconCollectionLink"),
                  openBoxButtonLabel: t("openSecretBox"),
                })}
              />

              {/* mm:362:5083 (Frame 530) */}
              <div className="flex w-full flex-col gap-8">
                <AwardsHeader
                  navigationLabel={t("sentCount", { count: stats.kudosSent })}
                />
                <ProfilePostsGrid posts={toKudoPostCards(kudos, profile)} />
              </div>
            </>
          ) : (
            // Safe empty state: unauthenticated or Supabase unreachable
            // (e.g. `supabase start` not running). No crash, no mock data.
            <p className="pt-24 text-center text-white/70 lg:pt-96">
              {t("emptyState")}
            </p>
          )}
        </div>
      </main>

      <ProfileFooter />
    </div>
  );
}
