import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { KudoSenderInfo } from "../kudos-live-board/kudo-sender-info";
import {
  HeartIcon,
  LinkIcon,
  TransferArrowIcon,
} from "../kudos-live-board/highlight-kudo-icons";
import type { ProfileKudoPostData } from "./profile-kudo-posts-data";

// mm:3127:24099 ("KUDO spam") + mm:1949:12832 ("KUDO") — same card shell as
// the Kudos Live Board's KudoPostCard (mm:256:5231), adapted for the Profile
// screen: sender/receiver avatars use the profile sample avatars, an
// optional "Spam" status badge sits top-right (Figma node
// mms_D.3.1_Status), and the hashtag title line has no pen icon here.
export async function ProfileKudoPostCard({
  post,
}: {
  post: ProfileKudoPostData;
}) {
  const t = await getTranslations("Profile");

  return (
    // mm:3127:24169 / mm:1949:12834
    <article className="relative flex w-full flex-col items-start gap-4 rounded-3xl bg-[#FFF8E1] px-6 pb-4 pt-10 sm:px-10">
      {/* mm:I3127:24169;3127:24095 — mms_D.3.1_Status */}
      {post.isSpam && (
        <span
          className="absolute right-6 top-6 rounded p-4 text-base font-bold leading-6 tracking-[0.5px] text-white sm:right-10"
          style={{ backgroundColor: "#FF8104", fontFamily: "var(--font-montserrat)" }}
        >
          {t("spamBadge")}
        </span>
      )}

      {/* mm:I3127:24169;3127:24031 — Frame 482 */}
      <div className="flex w-full flex-wrap items-start justify-center gap-2 sm:flex-nowrap sm:justify-between sm:gap-6">
        <KudoSenderInfo
          name={post.senderName}
          heroCode={post.senderHeroCode}
          badgeVariant={post.senderBadge}
          avatarSrc={post.senderAvatarSrc ?? "/profile/avatar-sample-1.png"}
        />

        {/* mm:I3127:24169;3127:24033 */}
        <div className="flex shrink-0 items-center py-4">
          <TransferArrowIcon />
        </div>

        <KudoSenderInfo
          name={post.receiverName}
          heroCode={post.receiverHeroCode}
          badgeVariant={post.receiverBadge}
          avatarSrc={post.receiverAvatarSrc ?? "/profile/avatar-sample-2.png"}
        />
      </div>

      {/* mm:I3127:24169;3127:24036 */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I3127:24169;3127:24037 — Content */}
      <div className="flex w-full flex-col items-start gap-4">
        {/* mm:I3127:24169;3127:24038 */}
        <p
          className="text-base font-bold leading-6 tracking-[0.5px] text-[#999]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {post.time}
        </p>

        {/* mm:I1949:12834;1949:13384 — only on non-spam "KUDO" cards */}
        {post.title && (
          <p
            className="w-full text-center text-base font-bold leading-6 tracking-[0.5px] text-[#00101A]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {post.title}
          </p>
        )}

        {/* mm:I3127:24169;3127:24042 — Frame 425 (message body) */}
        <div className="w-full self-stretch rounded-xl border border-[#FFEA9E] bg-[rgba(255,234,158,0.4)] px-6 py-4">
          <p
            className="text-justify text-xl font-bold leading-8 text-[#00101A]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {post.message}
          </p>
        </div>

        {/* mm:I3127:24169;3127:24045 — content images */}
        <div className="flex w-full flex-wrap items-center gap-4">
          {Array.from({ length: post.attachmentCount }).map((_, index) => (
            <div
              key={index}
              className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[18px] border border-[#998C5F] bg-white"
            >
              {/* mm:MM_MEDIA_Sample Image */}
              <Image
                src="/profile/post-sample-image.png"
                alt=""
                fill
                className="rounded object-cover"
              />
            </div>
          ))}
        </div>

        {/* mm:I3127:24169;3127:24051 — hashtags */}
        <p
          className="w-full text-base font-bold leading-6 tracking-[0.5px] text-[#D4271D]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {post.hashtags}
        </p>
      </div>

      {/* mm:I3127:24169;3127:24053 */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I3127:24169;3127:24054 — Frame 485 */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        {/* mm:I3127:24169;3127:24055 — Hearts */}
        <div className="flex items-center gap-1">
          <span
            className="text-2xl font-bold leading-8 text-[#00101A]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {post.heartsCount}
          </span>
          <HeartIcon />
        </div>

        {/* mm:I3127:24169;3127:24058 — Copy link button */}
        <button
          type="button"
          className="flex items-center gap-1 rounded p-4 text-[#00101A] transition-colors duration-200 hover:bg-black/5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#FFEA9E] focus-visible:ring-offset-1 active:translate-y-px"
        >
          <span
            className="text-center text-base font-bold leading-6 tracking-[0.15px]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {t("copyLink")}
          </span>
          <LinkIcon />
        </button>
      </div>
    </article>
  );
}
