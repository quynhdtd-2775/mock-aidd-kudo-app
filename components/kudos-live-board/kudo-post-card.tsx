import Image from "next/image";
import { getTranslations } from "next-intl/server";
import { KudoSenderInfo } from "./kudo-sender-info";
import type { KudoPostData } from "./kudo-posts-data";

// mm:256:5231 (component "C.3_KUDO Post") — one thank-you post card: sender +
// receiver info, timestamp, highlighted hashtag title, message body, attached
// images, hashtag line, then copy-link / hearts actions row.
export async function KudoPostCard({ post }: { post: KudoPostData }) {
  const t = await getTranslations("LiveBoard");

  return (
    // mm:3127:21871
    <article className="flex w-full flex-col items-start gap-4 rounded-3xl bg-[#FFF8E1] px-6 pb-4 pt-10 sm:px-10">
      {/* mm:I3127:21871;256:4857 — Info user */}
      <div className="flex w-full flex-wrap items-start justify-center gap-2 sm:flex-nowrap sm:justify-between sm:gap-6">
        <KudoSenderInfo
          name={post.senderName}
          heroCode={post.senderHeroCode}
          badgeVariant={post.senderBadge}
          avatarSrc="/kudos-live-board/avatar-sender.png"
        />

        {/* mm:I3127:21871;256:5161 — C.3.2_Icon sent */}
        <div className="flex shrink-0 items-center py-4">
          <Image
            src="/kudos-live-board/icon-send.svg"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
          />
        </div>

        <KudoSenderInfo
          name={post.receiverName}
          heroCode={post.receiverHeroCode}
          badgeVariant={post.receiverBadge}
          avatarSrc="/kudos-live-board/avatar-receiver.png"
        />
      </div>

      {/* mm:I3127:21871;256:5192 */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I3127:21871;256:5645 — Content */}
      <div className="flex w-full flex-col items-start gap-4">
        {/* mm:I3127:21871;256:5229 */}
        <p
          className="text-base font-bold leading-6 tracking-[0.5px] text-[#999]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {post.time}
        </p>

        {/* mm:I3127:21871;2234:33038 — D.4_hashtag */}
        <div className="flex w-full items-center gap-2">
          <p
            className="text-center text-base font-bold leading-6 tracking-[0.5px] text-[#00101A]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {post.hashtagTitle}
          </p>
          <Image
            src="/kudos-live-board/icon-pen.svg"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
          />
        </div>

        {/* mm:I3127:21871;662:11382 — Frame 425 (message body) */}
        <div className="w-full self-stretch rounded-xl border border-[#FFEA9E] bg-[rgba(255,234,158,0.4)] px-6 py-4">
          {/* mm:I3127:21871;256:5156 */}
          <p
            className="text-justify text-xl font-bold leading-8 text-[#00101A]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {post.message}
          </p>
        </div>

        {/* mm:I3127:21871;256:5176 — C.3.6_Image đính kèm */}
        <div className="flex w-full flex-wrap items-center gap-4">
          {Array.from({ length: post.attachmentCount }).map((_, index) => (
            <div
              key={index}
              className="relative h-[88px] w-[88px] shrink-0 overflow-hidden rounded-[18px] border border-[#998C5F] bg-white"
            >
              {/* mm:I3127:21871;256:5177;513:8436 — MM_MEDIA_Sample Image */}
              <Image
                src="/kudos-live-board/sample-image.png"
                alt=""
                fill
                className="rounded object-cover"
              />
            </div>
          ))}
        </div>

        {/* mm:I3127:21871;256:5158 — C.3.7_Hash tag */}
        <p
          className="w-full text-base font-bold leading-6 tracking-[0.5px] text-[#D4271D]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {post.hashtags}
        </p>
      </div>

      {/* mm:I3127:21871;256:7496 */}
      <div className="h-px w-full bg-[#FFEA9E]" />

      {/* mm:I3127:21871;256:5194 — C.4_Button */}
      <div className="flex w-full flex-wrap items-center justify-between gap-4">
        {/* mm:I3127:21871;256:5175 — C.4.1_Hearts */}
        <div className="flex items-center gap-1">
          <span
            className="text-2xl font-bold leading-8 text-[#00101A]"
            style={{ fontFamily: "var(--font-montserrat)" }}
          >
            {post.heartsCount}
          </span>
          <Image
            src="/kudos-live-board/icon-heart.svg"
            alt=""
            width={32}
            height={32}
            aria-hidden="true"
          />
        </div>

        {/* mm:I3127:21871;256:5216 — C.4.2_Copy link button */}
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
          <Image
            src="/kudos-live-board/icon-link.svg"
            alt=""
            width={24}
            height={24}
            aria-hidden="true"
          />
        </button>
      </div>
    </article>
  );
}
