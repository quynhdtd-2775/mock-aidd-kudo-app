import {
  ProfileInfoCard,
  type ProfileInfoCardProps,
} from "./profile-info-card";
import {
  ProfileBadgesRow,
  type ProfileBadgesRowProps,
} from "./profile-badges-row";
import {
  ProfileStatsPanel,
  type ProfileStatsPanelProps,
} from "./profile-stats-panel";

export interface ProfileHeroSectionProps {
  info: ProfileInfoCardProps;
  badges: Omit<ProfileBadgesRowProps, "collectionLinkLabel"> & {
    collectionLinkLabel?: string;
  };
  stats: ProfileStatsPanelProps;
}

/** Sample data lifted verbatim from the Figma design (mm:362:5052 / 362:5064 / 362:5073). */
export const PROFILE_HERO_SAMPLE_DATA: ProfileHeroSectionProps = {
  info: {
    name: "Huỳnh Dương Xuân Nhật",
    department: "CEVC3",
    legendLabel: "Legend Hero",
  },
  badges: {
    badgeCount: 6,
    collectionLinkLabel: "Bộ sưu tập icon của tôi",
  },
  stats: {
    kudosReceived: "5",
    kudosSent: "25",
    heartsReceived: "25",
    secretBoxesOpened: "25",
    secretBoxesUnopened: "25",
    openBoxButtonLabel: "Mở Secret Box",
  },
};

/**
 * mm:362:5051 (Frame 532) — top-level composition of the "Profile bản thân"
 * user-info + stats panel section: avatar/name/badges block stacked above
 * the personal stats card. Presentational only — callers wire real data
 * and click handlers.
 */
export function ProfileHeroSection({
  info,
  badges,
  stats,
}: ProfileHeroSectionProps) {
  return (
    <div className="flex w-full flex-col items-center gap-8">
      {/* mm:362:5052 (mms_A_Info) */}
      <div className="flex w-full flex-col items-center gap-8">
        <ProfileInfoCard {...info} />
        {/* mm:362:5064 (mms_A.3_Huy Hiệu) + mm:3053:10052 */}
        <ProfileBadgesRow
          collectionLinkLabel="Bộ sưu tập icon của tôi"
          {...badges}
        />
      </div>

      {/* mm:362:5073 (mms_B_Thống kê) */}
      <ProfileStatsPanel {...stats} />
    </div>
  );
}
