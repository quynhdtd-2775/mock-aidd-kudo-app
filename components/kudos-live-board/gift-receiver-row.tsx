import Image from "next/image";
import type { GiftReceiverData } from "./gift-receivers-data";

// mm:256:7474 (component "D.3.x_Thông tin Sunner nhận quà") — one row in the
// "10 SUNNER NHẬN QUÀ MỚI NHẤT" sidebar list: round avatar + name + gift
// notification text.
export function GiftReceiverRow({ receiver }: { receiver: GiftReceiverData }) {
  return (
    // mm:2940:13516
    <div className="flex w-full items-center gap-2">
      {/* mm:I2940:13516;256:7460 — MM_MEDIA_Avatar */}
      <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-full border-[1.87px] border-white">
        <Image
          src="/kudos-live-board/avatar-gift.png"
          alt={receiver.name}
          fill
          className="object-cover"
        />
      </div>

      {/* mm:I2940:13516;256:7461 — Frame 520 */}
      <div className="flex min-w-0 flex-1 flex-col items-start gap-[2px]">
        {/* mm:I2940:13516;256:7462 — Name */}
        <p
          className="w-full truncate text-xl font-bold leading-7 text-[#FFEA9E]"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {receiver.name}
        </p>
        {/* mm:I2940:13516;256:7472 — Thông báo content */}
        <p
          className="w-full text-right text-base font-bold leading-6 tracking-[0.15px] text-white"
          style={{ fontFamily: "var(--font-montserrat)" }}
        >
          {receiver.notification}
        </p>
      </div>
    </div>
  );
}
